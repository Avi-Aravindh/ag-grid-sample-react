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

import XLSX from 'xlsx';

import clsx from 'clsx';

import { useState, useEffect, useContext, useRef } from 'react';

import { AgGridReact, AgGridColumn } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import ActionCellRenderer from '../components/ActionCellRenderer';
import BulkUpdateDialog from '../components/BulkUpdateDialog';
import CurrencyEditor from '../components/CurrencyEditor';
import CustomDialog from '../components/CustomDialog';
import CustomDropdown from '../components/CustomDropdown';
import DialogEditor from '../components/DialogEditor';
import FileUploadDialog from '../components/FileUploadDialog';
import NumericEditor from '../components/NumericEditor';
import AppContext from '../context/AppContext';
import { AppTheme } from '../utilities/Theme';
import { DATAURLS } from '../utilities/constants';
import {
  fetchPut,
  fetchPost,
  fetchGet,
  fetchDelete,
} from '../utilities/dataCalls';
import { generateExcel } from '../utilities/generateExcel';

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
      // marginTop: '20px',
      width: '95%',
      height: '40px',
      boxShadow: '0px 0px 5px #222',
      paddingLeft: '10px',
      background: '#3B5096',
      // background:
      //   'linear-gradient(90deg, rgba(39,105,85,1) 55%, rgba(39,96,0,1) 100%)',
    },
    actionArea: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      width: '30%',
    },
    actionIconDisabled: {
      color: '#aaa',
      cursor: 'not-allowed',
    },
    actionIcon: {
      fontSize: '1rem',
      cursor: 'pointer',
      color: 'white',
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
  ActionCellRenderer,
  NumericEditor,
  CurrencyEditor,
  DialogEditor,
};

const Orders = () => {
  const theme = useTheme(AppTheme);
  const classes = useStyles(theme);
  const appContext = useContext(AppContext);
  const overlayLoadingTemplate =
    '<span class="ag-overlay-loading-center">Please wait while update in progress</span>';

  const buildColumnDefinitions = (columnDefs, assetTypes) => {
    return columnDefs.map((columnDef, index) => {
      let columnDefinition = {
        headerName: index !== 0 ? columnDef.header_name : '',
        cellRenderer: index === 0 ? 'ActionCellRenderer' : false,
        cellRendererParams: {
          onRowEditingStopped: (params) => onRowEditingStopped(params),
        },
        headerCheckboxSelection: index === 0 ? true : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: index === 0 ? true : false,
        field: columnDef.field,
        editable: true,
        filter: index !== 0 ? 'agTextColumnFilter' : 'none',
        sortable: true,
        resizable: true,
        hide: false,
        width: index === 0 ? 100 : 'auto',
        valueFormatter:
          columnDef.type === 'currencyColumn' &&
          ((params) => {
            return params.value ? '\xA3' + params.value : ' ';
          }),
      };
      if (columnDef.field === 'status') {
        columnDefinition.cellEditor = 'agSelectCellEditor';
        columnDefinition.cellEditorParams = {
          values: statusNames,
        };
      }
      if (columnDef.type === 'numericColumn') {
        columnDefinition.cellEditor = 'NumericEditor';
      }
      if (columnDef.type === 'currencyColumn') {
        columnDefinition.cellEditor = 'CurrencyEditor';
      }

      return columnDefinition;
    });
  };

  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(25);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [customDeleteDialog, setCustomDeleteDialog] = useState(false);
  const [customDialogTitle, setCustomDialogTitle] = useState('');
  const [customDialogMessage, setCustomDialogMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState('success');
  const [rowData, setRowData] = useState([]);
  const [rowDataAPI, setRowDataAPI] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetTypeFieldMapping, setAssetTypeFieldMapping] = useState([]);
  const [statusCodes, setStatusCodes] = useState([]);
  const [statusNames, setStatusNames] = useState([]);
  const [palletNumbers, setPalletNumbers] = useState([]);
  const [selectedAssetType, setSelectedAssetType] = useState('All');
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [enableBulkUpdates, setEnableBulkUpdates] = useState(false);
  const [gridApi, setGridApi] = useState();
  const [quickFilterText, setQuickFilterText] = useState('');
  const externalFilterRef = useRef(null);

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

    if (!columnsToShow || columnsToShow.length === 0) {
      gridApi.columnController.setColumnsVisible(allColumnIds, true);
      return;
    }

    if (columnsToShow.length > 0) {
      columnsToShow.push('actions', 'order_id');
    }

    gridApi.columnController.setColumnsVisible(allColumnIds, false);
    gridApi.columnController.setColumnsVisible(columnsToShow, true);
  }, [gridApi, assetTypeFieldMapping, selectedAssetType]);

  useEffect(() => {
    gridApi && gridApi.onFilterChanged();
  }, [selectedAssetType]);

  useEffect(() => {
    setLoading(false);
  }, [rowData]);

  useEffect(() => {
    if (!gridApi) {
      return;
    }
    loading ? gridApi.showLoadingOverlay() : gridApi.hideOverlay();
  }, [loading]);

  const getNewData = async (gridApi) => {
    setLoading(true);
    gridApi.showLoadingOverlay();

    // Fetching data
    fetchGet(DATAURLS.ORDERS.url, appContext.token)
      .then((response) => {
        setRowData(response.Orders);
        let tempAPI = JSON.parse(JSON.stringify(response.Orders));
        setRowDataAPI(tempAPI);
      })
      .catch((err) => {
        throw err;
      });

    // Fetching column definition
    fetchGet(DATAURLS.COLUMNDEFINITIONS.url, appContext.token)
      .then((response) => {
        setColumnDefs(response.columnDefinitions);
      })
      .catch((err) => {
        throw err;
      });

    // Fetching Asset Types
    // fetchGet(DATAURLS.ASSETTYPES.url, appContext.token)
    //   .then((response) => {
    //     setAssetTypeFieldMapping(response.assetTypes);
    //     let assetNames = response.assetTypes.map(
    //       (assetType) => assetType.Asset_Name
    //     );
    //     setAssetTypes(assetNames);
    //     gridApi.hideOverlay();
    //   })
    //   .catch((err) => {
    //     throw err;
    //   });

    // Fetching Status Codes
    // fetchGet(DATAURLS.STATUS_CODES.url, appContext.token)
    //   .then((response) => {
    //     setStatusCodes(
    //       response.status_codes.sort((a, b) =>
    //         a.status_id < b.status_id ? -1 : 1
    //       )
    //     );
    //     let statusNames = response.status_codes.map(
    //       (status) => status.status_name
    //     );
    //     setStatusNames(statusNames);
    //     gridApi.hideOverlay();
    //   })
    //   .catch((err) => {
    //     throw err;
    //   });

    highlightUnsavedRows();
  };

  const validateRow = (params) => {
    let allRows = [];
    params.api.forEachNode((node) => allRows.push(node.data));

    let duplicateNumberRows = [];

    duplicateNumberRows = allRows.filter(
      (row) => row.asset_number && row.asset_number === params.data.asset_number
    );

    return duplicateNumberRows.length <= 1;
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    getNewData(params.api);
  };

  const onRowSelected = (params) => {
    setEnableBulkUpdates(gridApi.getSelectedRows().length > 0);
  };

  const onRowDataChanged = (params) => {
    highlightUnsavedRows(params);
  };

  const onRowEditingStarted = (params) => {
    gridApi.refreshCells({
      rowNodes: [params.node],
      columns: [params.columnApi.columnController.allDisplayedColumns[0]],
      force: true,
    });
  };

  const onRowEditingStopped = (params) => {
    gridApi.stopEditing();

    if (validateRow(params) === true) {
      let currentRowFromAPI = rowDataAPI.find(
        (row) => row.order_id === params.data.order_id
      );

      if (
        currentRowFromAPI &&
        JSON.stringify(params.data) === JSON.stringify(currentRowFromAPI)
      ) {
        return;
      }

      // if (params.data.order_id) {
      //   handleUpdate(params);
      //   return;
      // }

      if (currentRowFromAPI) {
        handleUpdate(params);
        return;
      }
      handleSave(params);
    } else {
      setSnackBarOpen(true);
      setSnackBarMessage('Cannot insert duplicate asset number');
      setSnackBarType('error');
      params.api.startEditingCell({
        rowIndex: params.rowIndex,
        colKey: 'asset_number',
      });
    }
  };

  const onCellEditingStopped = (params) => {
    if (params.colDef.field !== 'asset_type') {
      return;
    }

    if (params.colDef.field === 'asset_type') {
      let currentAssetType = assetTypeFieldMapping.find(
        (asset) => asset.Asset_Name === params.data.asset_type
      );
      if (!params.data.sample_co2 || params.oldValue !== params.newValue) {
        params.data.sample_co2 = currentAssetType.sampleco2;
      }
      if (!params.data.sample_weight || params.oldValue !== params.newValue) {
        params.data.sample_weight = currentAssetType.sample_weight;
      }
    }
  };

  const handleAddNew = async (data) => {
    if (gridApi) {
      gridApi.paginationGoToFirstPage();
    }
    let newRow = [{ ...data }];
    if (selectedAssetType !== 'All') {
      newRow.map((row) => (row.asset_type = selectedAssetType));
    }

    setRowData((prev) => [...newRow, ...prev]);
    setTimeout(() => {
      gridApi.startEditingCell({
        rowIndex: 0,
        colKey: 'quantity',
        keyPress: '1',
      });
    }, 150);
  };

  const handleUpdate = (params) => {
    Object.keys(params.data).forEach((key) => {
      if (!params.data[key]) {
        params.data[key] = null;
        params.data['deleted'] = false;
      }
    });

    setLoading(true);
    gridApi.showLoadingOverlay();

    params.data.last_updated_at = new Date().toISOString();
    params.data.last_updated_by = appContext.currentUser.user_email;

    if (params.data.status === 'Sold' && !params.data.date_nor) {
      params.data.date_nor = new Date().toISOString().slice(0, 10);
    }

    if (params.data.status !== 'Sold' && params.data.date_nor) {
      params.data.date_nor = null;
    }
    fetchPut(
      DATAURLS.ORDERS.url,
      {
        data: params.data,
        matchBy: 'order_id',
      },
      appContext.token
    )
      .then((response) => {
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

  const handleBulkUpdate = (params) => {
    setBulkUpdateOpen(true);
  };

  const handleSave = (params) => {
    setLoading(true);
    gridApi.showLoadingOverlay();

    if (params.data.status === 'Sold' && !params.data.date_nor) {
      params.data.date_nor = new Date().toISOString().slice(0, 10);
    }

    if (params.data.status !== 'Sold' && params.data.date_nor) {
      params.data.date_nor = null;
    }

    params.data.created_by = appContext.currentUser.user_email;

    fetchPost(DATAURLS.ORDERS.url, { data: params.data }, appContext.token)
      .then((response) => {
        if (response.ok) {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('success');
          params.data.order_id = response.rows[0].order_id;
          gridApi.redrawRows({ rowNodes: [params.node] });
        } else {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('error');
          gridApi.startEditingCell({
            rowIndex: params.rowIndex,
            colKey: 'asset_type',
          });
        }
        setLoading(false);
        gridApi.hideOverlay();
        params.node.setSelected(false);
      })
      .catch((err) => {
        setLoading(false);
        throw err;
      });
  };

  const handleExport = () => {
    generateExcel(gridApi, 'Orders.xlsx');
  };

  const handleCopy = () => {
    if (gridApi) {
      gridApi.paginationGoToFirstPage();
    }
    let selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      return;
    }
    let updatedRows = JSON.parse(JSON.stringify(selectedRows.slice()));

    updatedRows.map((row) => {
      delete row['order_id'];
    });
    setRowData((prev) => [...updatedRows, ...prev]);
  };

  const handleDelete = async (props) => {
    gridApi.showLoadingOverlay();
    setLoading(true);
    if (!props.data.order_id) {
      let rowDataCopy = [...rowData];
      rowDataCopy.splice(props.node.rowIndex, 1);
      setRowData(rowDataCopy);
      return;
    }

    fetchDelete(
      DATAURLS.ORDERS.url,
      {
        data: { order_id: props.data.order_id },
        matchBy: 'order_id',
      },
      appContext.token
    )
      .then((res) => {
        if (res.ok) {
          let rowDataCopy = [...rowData];
          rowDataCopy.splice(props.node.rowIndex, 1);
          setRowData(rowDataCopy);
          setLoading(false);
        } else {
          setLoading(false);
          console.log('error', res);
        }
      })
      .catch((err) => {
        console.log('deletion failed', err);
      });

    gridApi.hideOverlay();
  };

  const handleOpen = () => {
    setCustomDeleteDialog(true);
    setCustomDialogTitle('Delete multiple');
    setCustomDialogMessage('Are you sure that you want to delete these orders');
  };

  const handleBulkDelete = async (props) => {
    let selectedRows = gridApi.getSelectedRows();
    let selectedAssetIds = selectedRows.map((row) => {
      return { order_id: row.order_id };
    });

    setLoading(true);

    fetchDelete(
      DATAURLS.ORDERS_MULTIPLE.url,
      selectedAssetIds,
      appContext.token
    )
      .then((res) => {
        setLoading(false);
        if (res.ok) {
          gridApi.deselectAll();
          getNewData(gridApi);
        } else {
          gridApi.deselectAll();
          getNewData(gridApi);
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log('bulk update err', err);
        throw err;
      });
  };

  const highlightUnsavedRows = (params) => {
    if (!params || rowDataAPI.length === 0) {
      return;
    }
    let missingRowNodes = params.api.rowModel.rowsToDisplay.filter((row) => {
      if (!row.data.order_id) {
        return row;
      }
    });

    if (missingRowNodes.length > 0) {
      missingRowNodes.map((node) => {
        if (params.node !== node) {
          node.setSelected(true);
        }
      });
    }
  };

  const bgColorDecider = (params, rowDataAPI) => {
    // use this function to change background color of rows based on data
    // leaving it here for future use
    return false;
  };

  const externalFilterChanged = (value) => {
    setSelectedAssetType(value);
  };

  const isExternalFilterPresent = () => {
    return externalFilterRef.current.children[1].value !== 'All';
  };

  const doesExternalFilterPass = (node) => {
    return node.data.asset_type === externalFilterRef.current.children[1].value;
  };

  return (
    <div className={classes.root}>
      <div className={classes.sectionHeader}>
        Order Details{' '}
        <Paper component='form' className={classes.textRoot}>
          <InputBase
            className={classes.input}
            placeholder='Search Orders'
            inputProps={{ 'aria-label': 'Search Orders' }}
            value={quickFilterText}
            onChange={(event) => {
              event.stopPropagation();
              setQuickFilterText(event.target.value);
            }}
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
          <Select
            value={selectedAssetType}
            className={classes.select}
            ref={externalFilterRef}
            onChange={(event) => {
              externalFilterChanged(event.target.value);
            }}
          >
            <MenuItem value='All'>All</MenuItem>
            {assetTypes.map((type) => (
              <MenuItem value={type}>{type}</MenuItem>
            ))}
          </Select>
          <FontAwesomeIcon
            icon={faTasks}
            title='Bulk Update'
            className={clsx(classes.actionIconDisabled, {
              [classes.actionIcon]: enableBulkUpdates,
            })}
            onClick={() => enableBulkUpdates && handleBulkUpdate(gridApi)}
          />

          <FontAwesomeIcon
            icon={faUpload}
            title='Import'
            className={classes.actionIcon}
            onClick={() => setFileUploadOpen(true)}
          />

          <FontAwesomeIcon
            icon={faDownload}
            title='Export'
            className={classes.actionIcon}
            onClick={() => handleExport()}
          />

          <Divider orientation='vertical' flexItem />
          <FontAwesomeIcon
            icon={faPlus}
            title='Add'
            className={classes.actionIcon}
            onClick={() => handleAddNew()}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title='Delete'
            className={clsx(classes.actionIconDisabled, {
              [classes.actionIcon]: enableBulkUpdates,
            })}
            // onClick={() => enableBulkUpdates && handleBulkDelete()}
            onClick={() => enableBulkUpdates && handleOpen()}
          />
          <FontAwesomeIcon
            icon={faCopy}
            title='Copy'
            className={classes.actionIcon}
            onClick={() => handleCopy()}
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
          columnDefs={buildColumnDefinitions(columnDefs, assetTypes)}
          frameworkComponents={frameworkComponents}
          suppressDragLeaveHidesColumns={true}
          onGridReady={onGridReady}
          rowSelection='multiple'
          onRowEditingStopped={onRowEditingStopped}
          onCellEditingStopped={onCellEditingStopped}
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
          // quickFilterText={selectedAssetType !== 'All' ? selectedAssetType : ''}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          floatingFilter={true}
          // stopEditingWhenGridLosesFocus={true}
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
      <BulkUpdateDialog
        open={bulkUpdateOpen}
        title='bulk update'
        columnDefs={columnDefs}
        parentGridApi={gridApi}
        getNewData={getNewData}
        setOpen={setBulkUpdateOpen}
        assetTypes={assetTypes}
        statusNames={statusNames}
      />
      <FileUploadDialog
        open={fileUploadOpen}
        allAssets={rowData}
        title='file upload'
        setOpen={setFileUploadOpen}
        assetTypes={assetTypes}
        palletNumbers={palletNumbers}
        statusNames={statusNames}
        getNewData={getNewData}
        parentGridApi={gridApi}
      />
      <CustomDialog
        open={customDeleteDialog}
        title={customDialogTitle}
        message={customDialogMessage}
        handleAgree={() => {
          handleBulkDelete();
          setCustomDeleteDialog(false);
        }}
        handleDisagree={() => setCustomDeleteDialog(false)}
      />
    </div>
  );
};

export default Orders;
