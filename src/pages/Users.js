import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faTasks,
  faPlus,
  faTrash,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';

import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { useState, useEffect, useContext } from 'react';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import ActionCellRenderer from '../components/ActionCellRenderer';
import BulkUpdateDialog from '../components/BulkUpdateDialog';
import CustomDropdown from '../components/CustomDropdown';
import AddNewUser from '../components/AddNewUser';
import FileUploadDialog from '../components/FileUploadDialog';
import AppContext from '../context/AppContext';
import { AppTheme } from '../utilities/Theme';
import { DATAURLS } from '../utilities/constants';
import {
  fetchPut,
  fetchPost,
  fetchGet,
  fetchDelete,
} from '../utilities/dataCalls';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '95vw',
      height: '93vh',
      marginLeft: '4vw',
      // marginTop: '80px',
    },

    buttonBox: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '50%',
    },
    buttonArea: {
      display: 'flex',
    },
    select: {
      color: 'white',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      // color: '#212121',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1rem',
      // marginTop: '10px',
      width: '95%',
      height: '40px',
      boxShadow: '0px 0px 5px #222',
      paddingLeft: '10px',
      background:
        'linear-gradient(90deg, rgba(39,105,85,1) 55%, rgba(39,96,0,1) 100%)',
    },
    actionArea: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: '30%',
    },
    actionIcon: {
      fontSize: '1rem',
      cursor: 'pointer',
      color: theme.primary,
    },
    textRoot: {
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: 400,
      height: '30px',
    },
    input: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
  })
);

const frameworkComponents = {
  //   CustomCellEditor: CustomCellEditor,
  ActionCellRenderer: ActionCellRenderer,
};

const Users = () => {
  const theme = useTheme(AppTheme);
  const classes = useStyles(theme);
  const appContext = useContext(AppContext);
  const overlayLoadingTemplate =
    '<span class="ag-overlay-loading-center">Please wait while update in progress</span>';

  const buildColumnDefinitions = (columnDefs) => {
    return columnDefs.map((columnDef, index) => {
      let columnDefinition = {
        headerName: columnDef.header_name,
        // cellRenderer: columnDef.id === 0 ? 'ActionCellRenderer' : false,
        // cellRendererParams: {
        //   onRowEditingStopped: (params) => onRowEditingStopped(params),
        //   colKey: 'user_name',
        //   deleteConfirmation: deleteConfirmation,
        //   //   allAssets: allAssets,
        // },
        // headerCheckboxSelection: index === 0 ? true : false,
        checkboxSelection: index === 0 ? true : false,
        field: columnDef.field,
        editable: columnDef.editable,
        // filter: index !== 0 ? 'agTextColumnFilter' : 'none',
        sortable: true,
        resizable: true,
        hide: columnDef.hide,
        // floatingFilter: true,
        width: index === 0 ? 20 : 'auto',
      };
      return columnDefinition;
    });
  };

  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState('success');
  const [rowData, setRowData] = useState([]);
  const [rowDataAPI, setRowDataAPI] = useState([]);
  const [allUserRoles, setUserRoles] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [assetTypeFieldMapping, setAssetTypeFieldMapping] = useState([]);
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [enableDelete, setEnableDelete] = useState(false);
  const [gridApi, setGridApi] = useState();
  const [quickFilterText, setQuickFilterText] = useState('');

  const [addNewDialog, setAddNewDialog] = useState(false);

  useEffect(() => {
    if (!gridApi) {
      return;
    }
    let allColumnIds = gridApi.columnController.gridColumns.map(
      (col) => col.colId
    );
    let currentMapping = assetTypeFieldMapping.find(
      (mapping) => mapping.Asset_Name === selectedAssetType
    );

    let columnsToShow = currentMapping ? currentMapping.Fields : [];
    console.log('assettypes', assetTypeFieldMapping, columnsToShow);
    if (!columnsToShow || columnsToShow.length === 0) {
      gridApi.columnController.setColumnsVisible(allColumnIds, true);
      return;
    }

    if (columnsToShow.length > 0) {
      columnsToShow.push('actions', 'pallet_id');
    }

    gridApi.columnController.setColumnsVisible(allColumnIds, false);
    gridApi.columnController.setColumnsVisible(columnsToShow, true);
  }, [gridApi, assetTypeFieldMapping, selectedAssetType]);

  const getNewData = async (gridApi) => {
    console.log('gridapi', gridApi);
    setLoading(true);
    gridApi.showLoadingOverlay();

    // Fetching all users
    fetchGet(DATAURLS.USERS.url, appContext.token)
      .then((response) => {
        setRowData(response.users);
        setLoading(false);
      })
      .catch((err) => {
        throw err;
      });

    // Fetching all user roles
    fetchGet(DATAURLS.USER_ROLES.url, appContext.token)
      .then((response) => {
        setUserRoles(response.userRoles);
      })
      .catch((err) => {
        throw err;
      });

    // Fetching column definition
    fetchGet(DATAURLS.USERS_COLUMNDEFINITIONS.url, appContext.token)
      .then((response) => {
        setColumnDefs(response.columnDefinitions);
        setLoading(false);
      })
      .catch((err) => {
        throw err;
      });

    highlightUnsavedRows();
    gridApi.sizeColumnsToFit();
  };

  const deleteConfirmation = (data, allAssets) => {
    console.log('deleteconfirmation,data', data, allAssets, rowData);
    const existingAssets = allAssets.filter(
      (asset) => asset.pallet_id === data.pallet_id
    );

    if (existingAssets.length > 0) {
      setSnackBarOpen(true);
      setSnackBarMessage(
        `Cannot delete ${data.pallet_id}. There are assets existing with this pallet id`
      );
      setSnackBarType('error');

      return false;
    }
    return true;
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    getNewData(params.api);
  };

  const onModelUpdated = (params) => {
    params.api.sizeColumnsToFit();
  };

  const onRowSelected = (params) => {
    setEnableDelete(gridApi.getSelectedRows().length > 0);
  };

  const onRowDataChanged = (params) => {
    highlightUnsavedRows(params);
  };

  const onRowEditingStarted = (params) => {
    console.log('on row editing started', params);
    gridApi.refreshCells({
      rowNodes: [params.node],
      columns: [params.columnApi.columnController.allDisplayedColumns[0]],
      force: true,
    });
  };

  const onRowEditingStopped = (params) => {
    console.log('rowediting stopped');
    let currentRowFromAPI = rowDataAPI.find(
      (row) => row.pallet_id === params.data.pallet_id
    );

    if (
      currentRowFromAPI &&
      JSON.stringify(params.data) === JSON.stringify(currentRowFromAPI)
    ) {
      console.log('no update done');
      return;
    }

    if (params.data.pallet_id) {
      handleUpdate(params);
      return;
    }
    handleSave(params);
  };

  const handleAddNew = async (data) => {
    setAddNewDialog(true);
    // console.log('add new', gridApi);
    // let newRow = [{ ...data }];
    // setRowData((prev) => [...newRow, ...prev]);
  };

  const handleUpdate = (params) => {
    console.log('rowediting, update', params);
    Object.keys(params.data).forEach((key) => {
      if (!params.data[key]) {
        params.data[key] = null;
      }
    });

    console.log('rowediting update data', params.data);

    setLoading(true);
    gridApi.showLoadingOverlay();

    fetchPut(
      DATAURLS.PALLETS.url,
      {
        data: params.data,
        matchBy: 'pallet_id',
      },
      appContext.token
    )
      .then((response) => {
        console.log('response', response);
        if (response.ok) {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('success');
          gridApi.redrawRows({ rowNodes: [params.node] });
        } else {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('error');
          gridApi.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: 'quantity',
          });
        }
        setLoading(false);
        gridApi.hideOverlay();
        setTimeout(() => {
          highlightUnsavedRows(params);
        }, 600);
      })
      .catch((err) => {
        throw err;
      });
  };

  const handleSave = (params) => {
    console.log('handlesave, params', params);
    setLoading(true);
    gridApi.showLoadingOverlay();

    fetchPost(DATAURLS.PALLETS.url, { data: params.data }, appContext.token)
      .then((response) => {
        if (response.ok) {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('success');
          params.data.pallet_id = response.rows[0].pallet_id;
          gridApi.redrawRows({ rowNodes: [params.node] });
        } else {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('error');
          gridApi.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: 'pallet_type',
          });
        }
        setLoading(false);
        gridApi.hideOverlay();
        params.node.setSelected(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(rowData);
        throw err;
      });
  };

  const handleDelete = (params) => {
    console.log('handle delete Asset Type', params);

    fetchDelete(DATAURLS.PALLETS.url, { data: params.data }, appContext.token)
      .then((res) => {
        if (res.ok) {
          getNewData(gridApi);
        } else {
          setSnackBarOpen(true);
          setSnackBarMessage(res.message);
          setSnackBarType('error');
        }
      })
      .catch((err) => {
        console.log('error deleting record');
        throw err;
      });
  };

  const highlightUnsavedRows = (params) => {
    console.log('highlightUnsavedRows', params);
    if (!params || rowDataAPI.length === 0) {
      return;
    }
    let missingRowNodes = params.api.rowModel.rowsToDisplay.filter((row) => {
      if (!row.data.pallet_id) {
        return row;
      }
    });

    console.log('highlightUnsavedRows', missingRowNodes);
    if (missingRowNodes.length > 0) {
      missingRowNodes.map((node) => {
        if (params.node !== node) {
          node.setSelected(true);
        }
      });
    }
  };

  const bgColorDecider = (params, rowDataAPI) => {
    return false;
  };

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        Users
        <Paper component='form' className={classes.textRoot}>
          <InputBase
            className={classes.input}
            placeholder='Search Users'
            inputProps={{ 'aria-label': 'Search Users' }}
            value={quickFilterText}
            onChange={(event) => setQuickFilterText(event.target.value)}
          />
          <IconButton
            // type='submit'
            className={classes.iconButton}
            aria-label='search'
          >
            <SearchIcon />
          </IconButton>
        </Paper>
        <div className={classes.actionArea}>
          <FontAwesomeIcon
            icon={faPlus}
            title='Add'
            className={classes.actionIcon}
            onClick={() => handleAddNew()}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title='Delete'
            className={classes.actionIconDisabled}
            onClick={() => handleDelete()}
          />
        </div>
      </div>
      <div
        className='ag-theme-balham'
        style={{
          width: '95%',
          height: '80vh',
          boxShadow: '0 1px 15px 1px rgba(69,65,78,.08)',
        }}
      >
        <AgGridReact
          rowData={rowData}
          rowBuffer={500}
          debounceVerticalScrollbar={true}
          columnDefs={buildColumnDefinitions(columnDefs)}
          frameworkComponents={frameworkComponents}
          suppressDragLeaveHidesColumns={true}
          onGridReady={onGridReady}
          rowSelection='multiple'
          onRowEditingStopped={onRowEditingStopped}
          onRowSelected={onRowSelected}
          onRowDataChanged={onRowDataChanged}
          onRowEditingStarted={onRowEditingStarted}
          editType='fullRow'
          getRowClass={(params) => bgColorDecider(params, rowDataAPI)}
          overlayLoadingTemplate={overlayLoadingTemplate}
          getNewData={getNewData}
          handleDelete={handleDelete}
          pagination={true}
          paginationPageSize={pageSize}
          suppressRowClickSelection={true}
          alwaysShowVerticalScroll={true}
          quickFilterText={quickFilterText}
          onModelUpdated={onModelUpdated}
        ></AgGridReact>

        <CustomDropdown
          options={[25, 50, 100, 500]}
          title={'Page Size'}
          value={pageSize}
          onChange={(value) => {
            setPageSize(value);
            gridApi.paginationSetPageSize(value);
          }}
        />
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={3000}
          onClose={() =>
            setSnackBarOpen(snackBarType === 'error' ? true : false)
          }
        >
          <MuiAlert
            elevation={6}
            variant='filled'
            onClose={() => setSnackBarOpen(false)}
            severity={snackBarType}
          >
            {snackBarMessage}
          </MuiAlert>
        </Snackbar>
      </div>
      <AddNewUser
        open={addNewDialog}
        setOpen={setAddNewDialog}
        title='Add New User'
        allUsers={rowData}
        allUserRoles={allUserRoles}
        getNewData={getNewData}
        parentGridApi={gridApi}
      />
    </div>
  );
};

export default Users;
