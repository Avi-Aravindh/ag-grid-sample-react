import { faColumns } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppContext from '../context/AppContext';

import DualListBox from 'react-dual-listbox';

import React, { useState, useEffect, useContext } from 'react';

import CustomDialog from './CustomDialog';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
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
      justifyContent: 'center',
      alignItems: 'center',
      height: '100% !important',
      width: '100%',
      color: 'red',
    },
    icon: {
      color: '#3B5096',
      height: '15px',
      cursor: 'pointer',
    },
    dialogRoot: {
      width: '650px',
      height: '500px',
      //   display: 'flex',
      //   flexDirection: 'column',
    },
    dialogTitle: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '40px',
      background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
      boxShadow: '1px 1px 3px #8e9eab',
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
    listRoot: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
  })
);
const ColumnCellRenderer = (props) => {
  console.log('column cell ', props);
  const classes = useStyles();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [allColumnsOptions, setAllColumnsOptions] = useState([]);
  const [selectedColumnOptions, setSelectedColumnOptions] = useState([]);
  const [fields, setFields] = useState([]);
  const appContext = useContext(AppContext);

  const handleToggle = (value) => {
    console.log('handle toggle', value);
    if (fields.indexOf(value) === -1) {
      setFields((prev) => [...prev, value]);
      console.log('setting fields', fields);
      return;
    }
    setFields((prev) => prev.filter((field) => field !== value));
  };

  useEffect(() => {
    setEnableSubmission(
      JSON.stringify(props.data.Fields.sort()) !== JSON.stringify(fields.sort())
    );
  }, [fields]);

  useEffect(() => {
    setAllColumnsOptions(
      props.colDef.cellRendererParams.allColumns.map((col) => ({
        field: col.field,
        header_name: col.header_name,
      }))
    );

    let tempFields = JSON.parse(JSON.stringify(props.data.Fields));
    setFields(tempFields);
  }, [props]);

  const handleUpdate = () => {
    let data = {
      Asset_Name: props.data.Asset_Name,
      Asset_Id: props.data.Asset_Id,
      Fields: fields,
    };
    console.log('rowediting, update', data);
    Object.keys(data).forEach((key) => {
      if (!data[key]) {
        data[key] = null;
      }
    });

    console.log('rowediting update data', data);
    setLoading(true);
    delete data.columnNames;

    fetchPut(
      DATAURLS.ASSETTYPES.url,
      {
        data: data,
        matchBy: 'Asset_Id',
      },
      appContext.token
    )
      .then((response) => {
        console.log('response', response);
        if (response.ok) {
          setSuccess(true);
          setLoading(false);
        } else {
          setSuccess(false);
          setLoading(false);
          setError(true);
        }
      })
      .catch((err) => {
        throw err;
      });
  };

  return (
    <div className={classes.root}>
      <FontAwesomeIcon
        icon={faColumns}
        className={classes.icon}
        onClick={() => {
          if (props.data.Asset_Name.length > 0) {
            setOpen(true);
          }
        }}
      />
      <Dialog
        open={open}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        maxWidth='md'
        classes={{ paper: classes.dialogRoot }}
      >
        <DialogTitle id='alert-dialog-title' className={classes.dialogTitle}>
          <div
            className={classes.dialogTitleText}
          >{`Columns for ${props.data.Asset_Name}`}</div>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {success && <div>Update Successful</div>}
          {!success && (
            <div>
              <DialogContentText>
                {fields.length} / {allColumnsOptions.length} selected
              </DialogContentText>
              <List className={classes.listRoot}>
                {allColumnsOptions.map((column) => {
                  const labelId = `checkbox-list-label-${column.field}`;

                  return (
                    <ListItem
                      key={column.field}
                      role={undefined}
                      dense
                      button
                      onClick={() => handleToggle(column.field)}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge='start'
                          checked={
                            fields.length > 0
                              ? fields.indexOf(column.field) !== -1
                              : true
                          }
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={column.header_name} />
                    </ListItem>
                  );
                })}
              </List>
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
                onClick={() => {
                  setFields(props.data.Fields);
                  setOpen(false);
                }}
                color='secondary'
                // disabled={loading}
                className={classes.button}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={() => handleUpdate()}
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
    </div>
  );
};

export default ColumnCellRenderer;
