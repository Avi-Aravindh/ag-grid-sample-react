import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { AgGridReact } from 'ag-grid-react';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import React, { useState, useContext, useEffect } from 'react';
import NumericEditor from '../components/NumericEditor';
import CurrencyEditor from '../components/CurrencyEditor';

import AppContext from '../context/AppContext';
import { DATAURLS } from '../utilities/constants';
import { fetchPost } from '../utilities/dataCalls';

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
      display: 'flex',
      justifyContent: 'center',
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
    formControl: {
      width: '70%',
      marginBottom: '15px',
    },
    inputGroup: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    inputControl: { fontFamily: 'Poppins !important', fontSize: '1rem' },
  })
);

const AddNewUser = ({
  open,
  setOpen,
  parentGridApi,
  allUsers,
  allUserRoles,
  getNewData,
  columnDefs,
  title,
  assetTypes,
  statusNames,
}) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [userPassword, setUserPassword] = useState();
  const [emailError, setEmailError] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [userRole, setUserRole] = useState();

  const [enableSubmission, setEnableSubmission] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const appContext = useContext(AppContext);

  const mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  useEffect(() => {
    setUserName();
    setUserEmail();
    setUserPassword();
    setUserRole();
    setSuccess(false);
    setError(false);
    setLoading(false);
  }, [open]);

  useEffect(() => {
    if ((userEmail && !userEmail.match(mailformat)) || emailError) {
      setEnableSubmission(false);
      return;
    }
    if (!userName || !userEmail || !userPassword || !userRole) {
      setEnableSubmission(false);
      return;
    }
    if (
      userName &&
      userEmail.match(mailformat) &&
      userPassword &&
      userRole &&
      !emailError
    ) {
      setEnableSubmission(true);
    }
  }, [userName, userEmail, userPassword, userRole, emailError, invalidEmail]);

  const handleSubmit = () => {
    setLoading(true);
    fetchPost(DATAURLS.USERS.url, {
      user_name: userName,
      user_email: userEmail,
      user_password: userPassword,
      user_role: userRole,
      force_reset: true,
    })
      .then((response) => {
        if (response.ok) {
          setLoading(false);
          setSuccess(true);
        } else {
          setLoading(false);
          setError(true);
          setErrorMessage(response.message);
        }
      })
      .catch((err) => {
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
        {!success && !error && (
          <div className={classes.inputGroup}>
            <FormControl className={classes.formControl}>
              <TextField
                inputProps={{ className: classes.inputControl }}
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                variant='outlined'
                required
                fullWidth
                id='user_name'
                label='Full Name'
                autoFocus
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                //   autoComplete='fname'
                error={emailError || invalidEmail}
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
                onBlur={(event) => {
                  setEmailError(
                    allUsers.find((user) => user.user_email === userEmail)
                  );
                  setInvalidEmail(!userEmail.match(mailformat));
                }}
                variant='outlined'
                required
                fullWidth
                id='user_email'
                label='Email'
                helperText={
                  emailError
                    ? 'An account already exists for this email !'
                    : invalidEmail
                    ? 'Invalid Email'
                    : ''
                }
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                value={userPassword}
                onChange={(event) => setUserPassword(event.target.value)}
                variant='outlined'
                required
                fullWidth
                id='user_password'
                label='Password'
                password
              />
            </FormControl>
            <FormControl
              variant='outlined'
              required
              className={classes.formControl}
            >
              <InputLabel id='demo-simple-select-outlined-label'>
                Role
              </InputLabel>
              <Select
                labelId='demo-simple-select-outlined-label'
                id='demo-simple-select-outlined'
                value={userRole}
                onChange={(event) => setUserRole(event.target.value)}
                label='Role'
              >
                {allUserRoles &&
                  allUserRoles.map((item) => (
                    <MenuItem value={item.role}>{item.role}</MenuItem>
                  ))}
              </Select>
            </FormControl>
          </div>
        )}
        {success && !error && <div>User creation successful</div>}
        {!success && error && <div>{errorMessage}</div>}
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
              onClick={() => handleSubmit()}
              color='primary'
              disabled={!enableSubmission}
              className={classes.button}
            >
              Add
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

export default AddNewUser;
