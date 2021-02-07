import { useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      margin: theme.spacing(1),
    },
  })
);

const MyButton = ({ type, disabled, action }) => {
  const classes = useStyles();

  return (
    <Button
      variant='contained'
      className={classes.root}
      color='primary'
      onClick={() => action()}
      disabled={disabled}
    >
      {type.label}
    </Button>
  );
};

export default MyButton;
