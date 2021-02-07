import Button from '@material-ui/core/Button';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import React, { useState, useEffect } from 'react';

import CustomDialog from './CustomDialog';

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
      height: '15px',
    },
    // editIcon: {
    //   color: theme.primary,
    // },
    deleteIcon: {
      color: 'red',
      height: '20px',
    },
  })
);
const ActionCellRenderer = (props) => {
  // console.log('action cell ', props, props.api.getEditingCells());
  const classes = useStyles();
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setEditMode(
      props.api.getEditingCells().length > 0
        ? props.api.getEditingCells()[0].rowIndex === props.node.rowIndex
        : false
    );
  }, [props]);

  const handleEdit = () => {
    setEditMode(true);
    props.api.startEditingCell({
      rowIndex: props.node.rowIndex,
      colKey: props.colDef.cellRendererParams.colKey
        ? props.colDef.cellRendererParams.colKey
        : 'quantity',
    });
  };

  const handleDone = () => {
    setEditMode(false);
    props.api.stopEditing();
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    console.log('handleopen', props.colDef.cellRendererParams);
    if (
      props.colDef.cellRendererParams &&
      props.colDef.cellRendererParams.deleteConfirmation
    ) {
      let proceedWithDeletion = props.colDef.cellRendererParams.deleteConfirmation(
        props.data,
        props.colDef.cellRendererParams.allAssets
      );
      if (proceedWithDeletion) {
        setOpen(true);
      } else {
        setOpen(false);
      }
      return;
    }

    setOpen(true);
  };
  const handleDelete = () => {
    props.agGridReact.props.handleDelete(props);
  };

  return (
    <div className={classes.root}>
      {!editMode && (
        <EditIcon
          className={[classes.icon, classes.editIcon]}
          color='primary'
          onClick={() => handleEdit()}
        ></EditIcon>
      )}
      {editMode && (
        <DoneIcon
          className={[classes.icon]}
          color='primary'
          onClick={() => handleDone()}
        ></DoneIcon>
      )}
      <DeleteIcon className={classes.icon} onClick={() => handleOpen()} />

      <CustomDialog
        open={open}
        title='Delete Order'
        message={`Are you sure you want to delete ${
          props.colDef.cellRendererParams.colKey
            ? props.node.data[props.colDef.cellRendererParams.colKey]
            : 'this order'
        }`}
        handleDisagree={() => handleClose()}
        handleAgree={() => handleDelete()}
      />
    </div>
  );
};

export default ActionCellRenderer;
