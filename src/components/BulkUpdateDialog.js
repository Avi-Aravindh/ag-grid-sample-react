import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles } from '@material-ui/core/styles';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import React, { useState, useContext } from 'react';
import NumericEditor from '../components/NumericEditor';
import CurrencyEditor from '../components/CurrencyEditor';

import AppContext from '../context/AppContext';
import { DATAURLS } from '../utilities/constants';
import { fetchPut } from '../utilities/dataCalls';

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogTitle: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '40px',
      background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
      boxShadow: '1px 1px 3px #8e9eab',
    },
    dialogRoot: {
      width: '650px !important',
      height: '500px',
      //   display: 'flex',
      //   flexDirection: 'column',
    },
    dialogTitleText: {
      fontFamily: "'Poppins'",
      fontWeight: 700,
      textTransform: 'uppercase',
      fontSize: '0.85rem',
    },
    dialogContent: {
      marginTop: '10px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      width: '50%',
      marginBottom: '15px',
      marginRight: '15px',
    },
    button: {
      marginLeft: '15px',
    },
    buttonProgress: { marginLeft: '5px' },
  })
);

const BulkUpdateDialog = ({
  open,
  setOpen,
  parentGridApi,
  getNewData,
  columnDefs,
  title,
  assetTypes,
  statusNames,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [gridApi, setGridApi] = useState(null);
  const appContext = useContext(AppContext);

  const frameworkComponents = {
    //   CustomCellEditor: CustomCellEditor,
    NumericEditor,
    CurrencyEditor,
  };

  const buildColumnDefinitions = (columnDefs) => {
    return [
      {
        headerName: 'Column',
        field: 'header_name',
        // checkboxSelection: true,

        resizable: true,
      },
      { headerName: 'field', field: 'field', hide: true, resizable: true },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        cellEditorSelector: (params) => {
          if (params.data.field === 'asset_type') {
            return {
              component: 'agSelectCellEditor',
              params: {
                values: assetTypes,
              },
            };
          }
          if (params.data.field === 'status') {
            return {
              component: 'agSelectCellEditor',
              params: {
                values: statusNames,
              },
            };
          }
          if (params.data.type === 'numericColumn') {
            return { component: 'NumericEditor' };
          }
          if (params.data.type === 'currencyColumn') {
            return { component: 'CurrencyEditor' };
          }
        },
      },
    ];
  };

  const onGridReady = (params) => {
    params.api.sizeColumnsToFit();
    setGridApi(params.api);
    setEnableSubmission(false);
  };

  const onCellEditingStarted = (params) => {
    setEnableSubmission(false);
  };
  const onCellEditingStopped = (params) => {
    let checkValue = columnDefs.filter((column) => column.value);
    setEnableSubmission(checkValue.length > 0 ? true : false);
  };

  const handleSubmit = (rows) => {
    let selectedRowNodes = rows.filter((node) => node.data.value);
    let selectedRows = selectedRowNodes.map((node) => node.data);

    setLoading(true);
    let updateObject = {};
    selectedRows.forEach((row) => {
      updateObject[row.field] = row.value;
    });

    let selectedData = [];

    selectedData = parentGridApi.getSelectedRows().map((row) => {
      return { order_id: row.order_id, ...updateObject };
    });

    fetchPut(DATAURLS.ORDERS_MULTIPLE.url, selectedData, appContext.token)
      .then((res) => {
        if (res.ok) {
          setSuccess(true);
          setLoading(false);
        } else {
          setSuccess(false);
          setError(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log('bulk response err', err);
        setLoading(false);
        throw err;
      });
  };

  return (
    <Dialog
      open={open}
      //   onClose={getNewData(p)}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      maxWidth='md'
      className='dialogRoot'
      classes={{ paper: classes.dialogRoot }}
    >
      <DialogTitle id='alert-dialog-title' className={classes.dialogTitle}>
        <div className={classes.dialogTitleText}>{title}</div>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {success && <div>Update Successful</div>}
        {!success && (
          <div>
            <DialogContentText id='alert-dialog-description'>
              Select columns to update{' '}
              {parentGridApi && (
                <span>
                  - {parentGridApi.getSelectedRows().length} rows selected
                </span>
              )}
            </DialogContentText>
            <div
              className='ag-theme-alpine'
              style={{
                width: '600px',
                height: '300px',
                boxShadow: '0 1px 15px 1px rgba(69,65,78,.08)',
              }}
            >
              <AgGridReact
                rowData={columnDefs.filter((column) => column.bulk_update)}
                columnDefs={buildColumnDefinitions(columnDefs)}
                frameworkComponents={frameworkComponents}
                onCellEditingStopped={onCellEditingStopped}
                onCellEditingStarted={onCellEditingStarted}
                onGridReady={onGridReady}
                editType='fullRow'
                stopEditingWhenGridLosesFocus={true}
              ></AgGridReact>
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        {success && (
          <div className={classes.buttonContainer}>
            <Button
              variant='contained'
              color='primary'
              className={classes.button}
              onClick={() => {
                getNewData(parentGridApi);
                parentGridApi.deselectAll();
                setSuccess(false);
                setOpen(false);
              }}
            >
              Ok!
            </Button>
          </div>
        )}
        {!success && (
          <div className={classes.buttonContainer}>
            <Button
              variant='contained'
              onClick={() => setOpen(false)}
              color='secondary'
              disabled={loading}
              className={classes.button}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={() => handleSubmit(gridApi.rowModel.rowsToDisplay)}
              color='primary'
              disabled={loading || !enableSubmission}
              className={classes.button}
            >
              Update
              {loading && (
                <CircularProgress
                  size='1rem'
                  className={classes.buttonProgress}
                />
              )}
            </Button>
          </div>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkUpdateDialog;
