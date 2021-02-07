import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faUpload,
  faTasks,
  faPlus,
  faTrash,
  faCopy,
} from '@fortawesome/free-solid-svg-icons';

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
import ColumnCellRenderer from '../components/ColumnCellRenderer';
import CustomDropdown from '../components/CustomDropdown';
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
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      // color: '#212121',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1rem',
      // marginTop: '10px',
      width: '100%',
      height: '40px',
      boxShadow: '0px 0px 5px #222',
      paddingLeft: '10px',
      background: '#3B5096',
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
  })
);

const AssetTypes = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [rowDataAPI, setRowDataAPI] = useState([]);
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  const [snackBarType, setSnackBarType] = useState('success');
  const [gridApi, setGridApi] = useState();
  const [pageSize, setPageSize] = useState(25);
  const appContext = useContext(AppContext);

  const overlayLoadingTemplate =
    '<span class="ag-overlay-loading-center">Please wait while update in progress</span>';

  const frameworkComponents = {
    //   CustomCellEditor: CustomCellEditor,
    ActionCellRenderer: ActionCellRenderer,
    ColumnCellRenderer: ColumnCellRenderer,
  };

  useEffect(() => {
    getNewData();
  }, []);

  const getNewData = async () => {
    setLoading(true);
    try {
      const ordersResponse = await fetchGet(
        DATAURLS.ORDERS.url,
        appContext.token
      );

      const itemTypesResponse = await fetchGet(
        DATAURLS.ITEMTYPES.url,
        appContext.token
      );

      setAllOrders(ordersResponse.Orders);
      setRowData(itemTypesResponse.ItemTypes);

      setLoading(false);
    } catch (err) {
      setLoading(true);
    }
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
    params.api.setDomLayout('autoHeight');
    params.api.sizeColumnsToFit();
  };

  const handleAddNew = async (data) => {
    console.log('add new', gridApi);
    let newRow = [{ ...data }];
    setRowData((prev) => [...newRow, ...prev]);
  };

  const onRowEditingStopped = (params) => {
    let currentRowFromAPI = rowDataAPI.find((row) => row.id === params.data.id);

    if (
      currentRowFromAPI &&
      JSON.stringify(params.data) === JSON.stringify(currentRowFromAPI)
    ) {
      return;
    }

    if (params.data.id) {
      handleUpdate(params);
      return;
    }
    handleSave(params);
  };

  const handleUpdate = (params) => {
    console.log('handle update');
    Object.keys(params.data).forEach((key) => {
      if (!params.data[key]) {
        params.data[key] = null;
      }
    });

    setLoading(true);
    gridApi.showLoadingOverlay();
    delete params.data.columnNames;

    fetchPut(
      DATAURLS.ITEMTYPES.url,
      {
        data: params.data,
        matchBy: 'id',
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
            colKey: 'id',
          });
        }
        setLoading(false);
        gridApi.hideOverlay();
      })
      .catch((err) => {
        throw err;
      });
  };

  const handleSave = (params) => {
    setLoading(true);
    gridApi.showLoadingOverlay();
    delete params.data.columnNames;
    fetchPost(DATAURLS.ITEMTYPES.url, { data: params.data }, appContext.token)
      .then((response) => {
        if (response.ok) {
          setSnackBarOpen(true);
          setSnackBarMessage(response.message);
          setSnackBarType('success');
          params.data.id = response.rows[0].id;
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
        console.log(rowData);
        throw err;
      });
  };

  const handleDelete = (params) => {
    fetchDelete(DATAURLS.ITEMTYPES.url, { data: params.data }, appContext.token)
      .then((res) => {
        if (res.ok) {
          getNewData();
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

  const deleteConfirmation = (data, allOrders) => {
    const existingOrders = allOrders.filter(
      (order) => order.item === data.item
    );

    if (existingOrders.length > 0) {
      setSnackBarOpen(true);
      setSnackBarMessage(
        `Cannot delete ${data.id}. There are existing orders with this product type`
      );
      setSnackBarType('error');

      return false;
    }
    return true;
  };

  const columnDefs = [
    {
      headerName: '',
      field: 'Action',
      width: '80px',
      cellRenderer: 'ActionCellRenderer',
      cellRendererParams: {
        colKey: 'id',
        deleteConfirmation: deleteConfirmation,
        allOrders: allOrders,
      },
    },
    {
      headerName: 'Item Type',
      field: 'item_name',
      editable: true,
      cellEditor: 'agTextCellEditor',
    },
    {
      headerName: 'Unit Cost',
      field: 'item_unit_cost',
      editable: true,
      cellEditor: 'agTextCellEditor',
    },
  ];

  return (
    <div className={classes.root}>
      <div>
        <div className={classes.sectionHeader}>
          Asset Types
          <div className={classes.actionArea}>
            {/* <FontAwesomeIcon
              icon={faDownload}
              title='Export'
              className={classes.actionIcon}
              onClick={() => handleExport()}
            /> */}

            <Divider orientation='vertical' flexItem />
            <FontAwesomeIcon
              icon={faPlus}
              title='Add'
              className={classes.actionIcon}
              onClick={() =>
                handleAddNew({
                  item_name: '',
                  item_unit_cost: '',
                })
              }
            />
          </div>
        </div>
        <div
          className='ag-theme-alpine'
          style={{
            width: '600px',
            // height: '350px',
            boxShadow: '0 1px 15px 1px rgba(69,65,78,.08)',
            border: 'none',
          }}
        >
          <AgGridReact
            rowData={rowData}
            rowBuffer={500}
            debounceVerticalScrollbar={true}
            columnDefs={columnDefs}
            suppressDragLeaveHidesColumns={true}
            onGridReady={onGridReady}
            rowSelection='multiple'
            frameworkComponents={frameworkComponents}
            onRowEditingStopped={onRowEditingStopped}
            editType='fullRow'
            overlayLoadingTemplate={overlayLoadingTemplate}
            handleDelete={handleDelete}
            pagination={true}
            paginationPageSize={pageSize}
            suppressRowClickSelection={true}
            alwaysShowVerticalScroll={true}
          ></AgGridReact>

          {/* <CustomDropdown
          options={[25, 50, 100, 500]}
          title={'Page Size'}
          value={pageSize}
          onChange={(value) => {
            setPageSize(value);
            gridApi.paginationSetPageSize(value);
          }}
        /> */}
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
      </div>
    </div>
  );
};

export default AssetTypes;
