import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Grid, Hidden, Button } from '@material-ui/core';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import EmailIcon from '@material-ui/icons/Email';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import React, { useState, useContext, useEffect } from 'react';

import clsx from 'clsx';

import { Router, Redirect, useLocation, useHistory } from 'react-router-dom';

import AppContext from '../context/AppContext';
import WorkChatLog from '../images/undraw_Work_chat.svg';
import { DATAURLS } from '../utilities/constants';
import { fetchPost, fetchPut } from '../utilities/dataCalls';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      background: '#f5f7fd',
      height: '100vh',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff !important',
      height: '7%',
      width: '100%',
    },
    mainContent: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '90%',
      width: '100%',
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      width: '100%',
      paddingLeft: '25px',
    },
    loginContainer1HeaderText: {
      fontFamily: 'Poppins',
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
    loginContainer1Text: {
      fontFamily: 'Poppins',
      fontSize: '1.5rem',
      color: '#3B5096 !important',
      fontWeight: 'bold',
      marginLeft: '5px',
    },
    inputContainer: {
      // display: 'flex',
      // flexDirection: 'row',
      // flexWrap: 'wrap',
      height: '60%',
      width: '60%',
      boxShadow: '0 4px 16px rgba(0,0,0,.15)',
      backgroundColor: '#fff',
      [theme.breakpoints.down('sm')]: {
        width: '90%',
      },
    },
    inputContainer1: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      height: '100%',
      // background: '#3B5096',
      backgroundImage: 'url(../images/undraw_Work_chat.svg)',
    },
    inputContainer2: {
      height: '100%',
    },
    welcomeText: {
      color: 'white',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
    },
    inputContainer3: {
      height: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      // border: '1px solid',
    },
    inputContainer4: {
      marginTop: '15px',
      // height: '15%',
      height: '10%',
      textAlign: 'center',
    },
    inputContainer5: {
      height: '80%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputText: {
      fontFamily: 'Poppins',
      color: '#3B5096',
    },
    inputValue: {
      fontSize: '1em',
    },
    test: {
      border: '1px solid red',
    },
    textField: {
      width: '70%',
      marginBottom: '15px',
      background: '#f5f7fd',
    },
    loginButton: {
      // marginTop: '15px',
      width: '150px',
      height: '40px',
      borderRadius: '10px',
      background: '#3B5096',
      color: 'white',
      '&:hover': {
        background: '#3B5096',
        opacity: 0.8,
      },
      '&:disabled': {
        background: '#3B5096',
        opacity: 0.5,
      },
    },
    icon: {
      color: '#c8cacf',
    },
    buttonText: {
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      fontFamily: 'Poppins',
      fontWeight: 'bold',
      fontSize: '1rem',
    },
    buttonProgress: { marginLeft: '15px' },
    errorTextContainer: {
      height: '40px',
      width: '100%',
      marginTop: '10px',
      textAlign: 'center',
      color: 'red',
    },
    textControl: { marginTop: '10px' },
    dialogRoot: {
      paddingBottom: '0px !important',
    },
    dialogActions: {
      paddingRight: '20px',
      marginBottom: '10px',
    },
    image: {
      width: '100%',
      height: '100%',
      // maxWidth: '75%',
    },
  })
);

const Login = () => {
  const classes = useStyles();

  const [useremail, setUseremail] = useState('demo@aravindh.me');
  const [pwd, setPwd] = useState('hello123');
  const [showPwd, setShowPwd] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [response, setResponse] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordDuplicate, setPasswordDuplicate] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);

  const appContext = useContext(AppContext);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    localStorage.removeItem('token');
    appContext.setIsUserLoggedIn(false);
    appContext.setToken(null);
    appContext.setCurrentUser({});
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setErrorMessage('');
    setError(false);
    fetchPost(DATAURLS.LOGIN.url, { user_email: useremail, user_password: pwd })
      .then((response) => {
        if (response.ok) {
          setLoading(false);
          setResponse(response);
          if (response.force_reset) {
            setConfirmation(true);
          } else {
            localStorage.setItem('token', response.token);
            appContext.setIsUserLoggedIn(true);
            appContext.setToken(response.token);
            appContext.setCurrentUser({
              user_name: response.user_name,
              user_email: useremail,
              user_password: pwd,
              user_role: response.user_role,
            });
            setRedirect(true);
          }
        } else {
          appContext.setIsUserLoggedIn(false);
          appContext.setToken(null);
          appContext.setCurrentUser({});
          setLoading(false);
          setRedirect(false);
          setError(true);
          setErrorMessage(response.message);
        }
      })
      .catch((err) => {
        throw err;
      });
  };

  const handlePasswordChange = () => {
    let data = {
      user_id: response.user_id,
      user_password: newPassword,
      force_reset: false,
    };

    fetchPut(
      DATAURLS.USERS.url,
      {
        matchBy: 'user_id',
        data: data,
      },
      response.token
    )
      .then((res) => {
        setSuccess(true);
      })
      .catch((err) => {
        throw err;
      });
  };

  const handleOk = () => {
    localStorage.setItem('token', response.token);

    appContext.setIsUserLoggedIn(true);
    appContext.setToken(response.token);
    appContext.setCurrentUser({
      user_name: response.user_name,
      user_email: useremail,
      user_password: pwd,
      user_role: response.user_role,
    });
    setConfirmation(false);
    setRedirect(true);
  };

  return (
    <div>
      {redirect && <Redirect to='/orders' />}
      {!redirect && (
        <div className={classes.root}>
          <div className={classes.header}>
            <div className={classes.textContainer}>
              <span className={classes.loginContainer1HeaderText}>Dunder</span>
              <span className={classes.loginContainer1Text}>Mifflin</span>
            </div>
          </div>
          <div className={classes.mainContent}>
            {/* <div className={classes.inputContainer}> */}
            <Grid container direction='row' className={classes.inputContainer}>
              <Hidden mdDown>
                <Grid
                  item
                  lg={5}
                  md={5}
                  xs={false}
                  className={classes.inputContainer1}
                >
                  <div className={classes.inputContainer4}></div>
                  <div className={classes.inputContainer5}>
                    <img
                      src={WorkChatLog}
                      className={classes.image}
                      alt='login-image-work-chat'
                    />
                  </div>
                </Grid>
              </Hidden>
              <Grid
                container
                lg={7}
                md={12}
                xs={12}
                className={classes.inputContainer2}
                direction='row'
                justify='center'
                alignItems='space-around'
              >
                <Grid
                  container
                  lg={11}
                  className={classes.inputContainer3}
                  justify='center'
                >
                  <Grid
                    container
                    lg={12}
                    justify='center'
                    className={classes.inputContainer4}
                  >
                    <div>
                      <h2 className={classes.inputText}>Welcome</h2>
                      {/* <h4 className={classes.inputText}>
                        For access, reach out to an administrator
                      </h4> */}
                    </div>
                  </Grid>
                  <Grid
                    container
                    lg={12}
                    justify='center'
                    alignItems='center'
                    className={classes.inputContainer5}
                  >
                    <Grid
                      container
                      lg={12}
                      justify='center'
                      alignItems='center'
                      className={classes.inputContainer5}
                    >
                      <Grid container lg={12} justify='center'>
                        <FormControl
                          className={clsx(classes.margin, classes.textField)}
                          variant='outlined'
                          required
                        >
                          <OutlinedInput
                            id='outlined-adornment-email'
                            type={'text'}
                            error={invalidEmail}
                            value={useremail}
                            placeholder='E-mail'
                            className={classes.inputValue}
                            onChange={(event) =>
                              setUseremail(event.target.value)
                            }
                            onBlur={(event) => {
                              setInvalidEmail(!useremail.match(/\S+@\S+\.\S+/));
                            }}
                            startAdornment={
                              <InputAdornment position='start'>
                                {<EmailIcon className={classes.icon} />}
                              </InputAdornment>
                            }
                            // labelWidth={70}
                          />
                        </FormControl>
                      </Grid>
                      <Grid container lg={12} justify='center'>
                        <FormControl
                          className={clsx(classes.margin, classes.textField)}
                          variant='outlined'
                          required
                        >
                          {/* <InputLabel htmlFor='outlined-adornment-password'>
                        Password
                      </InputLabel> */}
                          <OutlinedInput
                            id='outlined-adornment-password'
                            type={showPwd ? 'text' : 'password'}
                            value={pwd}
                            placeholder='password'
                            onChange={(event) => setPwd(event.target.value)}
                            startAdornment={
                              <InputAdornment position='start'>
                                {<VpnKeyIcon className={classes.icon} />}
                              </InputAdornment>
                            }
                            endAdornment={
                              <InputAdornment position='end'>
                                <IconButton
                                  aria-label='toggle password visibility'
                                  onClick={() => setShowPwd((prev) => !prev)}
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  edge='end'
                                >
                                  {showPwd ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                              </InputAdornment>
                            }
                            // labelWidth={90}
                          />
                        </FormControl>
                      </Grid>
                      <Grid container lg={12} justify='center'>
                        <Button
                          variant='contained'
                          color='primary'
                          disabled={
                            !(
                              pwd &&
                              pwd.length > 0 &&
                              useremail &&
                              useremail.length > 0
                            ) ||
                            loading ||
                            invalidEmail
                          }
                          className={classes.loginButton}
                          onClick={() => handleLogin()}
                        >
                          <div className={classes.buttonText}>
                            Login
                            {loading && (
                              <CircularProgress
                                size='1rem'
                                className={classes.buttonProgress}
                              />
                            )}
                          </div>
                        </Button>

                        <div className={classes.errorTextContainer}>
                          <div>{errorMessage}</div>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* </Grid> */}
              </Grid>
            </Grid>
            {/* </div> */}
          </div>
        </div>
      )}
      <Dialog
        open={confirmation}
        onClose={() => setConfirmation(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Change Password</DialogTitle>
        <DialogContent className={classes.dialogRoot}>
          {success && (
            <DialogContentText>
              Password has been changed successfully
            </DialogContentText>
          )}
          {!success && (
            <DialogContentText id='alert-dialog-description'>
              Since this is your first login, we request you to change the
              password
              <FormControl className={classes.textControl} required>
                <TextField
                  //   autoComplete='fname'
                  error={passwordError || passwordDuplicate}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError(!event.target.value.length > 0);
                    setPasswordDuplicate(event.target.value === pwd);
                  }}
                  variant='outlined'
                  required
                  fullWidth
                  id='new_password'
                  label='New Password'
                  helperText={
                    passwordError
                      ? 'A new password is required'
                      : passwordDuplicate
                      ? 'New password cannot be the same as old password'
                      : ''
                  }
                />
              </FormControl>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          {success && (
            <Button
              variant='contained'
              onClick={() => {
                handleOk();
              }}
              color='primary'
              autoFocus
            >
              Ok!
            </Button>
          )}
          {!success && (
            <Button
              variant='contained'
              onClick={() => {
                handlePasswordChange();
              }}
              color='primary'
              autoFocus
              disabled={newPassword.length === 0 || passwordDuplicate}
            >
              Update
              {loading && (
                <CircularProgress
                  size='1rem'
                  className={classes.buttonProgress}
                />
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Login;
