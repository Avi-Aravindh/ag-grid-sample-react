import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  ThemeProvider,
} from '@material-ui/core';
import ImportantDevicesIcon from '@material-ui/icons/ImportantDevices';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import DevicesOtherIcon from '@material-ui/icons/DevicesOther';
import CategoryIcon from '@material-ui/icons/Category';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import React, { useContext, useState, useEffect } from 'react';

import clsx from 'clsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
  useLocation,
  useHistory,
} from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import AppContext from './context/AppContext';
import ItemTypes from './pages/ItemTypes';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Users from './pages/Users';
import { AppTheme } from './utilities/Theme';

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  root: {
    // display: 'flex',
    // background: '#f5f7fd',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f7fd',
    color: '#3B5096',
    height: '60px',
    // paddingLeft: '2%',
    paddingRight: '2%',
    // width: '95%',
    // zIndex: '100',
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  appBarControls: {
    display: 'flex',
    flexDirection: 'row',
    flexGrow: '1',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActionContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  headerAction: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginRight: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease 0s',

    '&:hover': {
      opacity: 0.75,
    },
  },
  userName: {
    marginLeft: '5px',
    height: '20px',
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: '#232323',
  },
  drawerClose: {
    color: 'white',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerIcon: {
    marginLeft: '20px',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    // padding: theme.spacing(3),
    background: '#f5f7fd',
  },
  list: {
    marginTop: '50px',
  },
  listItemIcon: {
    minWidth: '58px',
  },
  listItemText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: '2rem',
    lineHeight: '2',
  },

  links: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: '25px',
    fontFamily: 'Poppins',
    fontSize: '0.75rem',
    color: 'white',
    cursor: 'pointer',
    textTransform: 'uppercase',
    textDecoration: 'none',
    letterSpacing: '1px',
    lineHeight: 2.5,
    '&:hover': {
      // backgroundColor: '#3B5096',
      // color: 'white',
      // borderRadius: '5px',
    },
    linkIcons: {
      color: 'red',
    },
  },
  linksActive: {
    backgroundColor: '#3B5096',
    // transitionDuration: '500ms',
  },
  linkIcons: {
    color: '#3B5096',
    marginLeft: '8px',
    fontSize: '24px',
  },
  linkActiveIcons: {
    color: 'white',
    marginLeft: '8px',
  },
}));

export default function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [logoutMenu, setLogoutMenu] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const location = useLocation();
  const history = useHistory();
  const appContext = useContext(AppContext);
  const [isVerified, setIsVerified] = React.useState(appContext.isVerified);

  useEffect(() => {
    console.log('updating isverified', appContext);
    setIsVerified(appContext.isVerified);
  }, [appContext]);

  console.log('Appcontext', appContext);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleProfileClick = () => {
    setLogoutMenu(false);
    history.push('/profile');
  };

  return (
    isVerified && (
      <div className={classes.root}>
        <ThemeProvider theme={AppTheme}>
          <CssBaseline />
          {appContext.isUserLoggedIn && (
            <AppBar
              position='fixed'
              className={clsx(classes.appBar, {
                [classes.appBarShift]: open,
              })}
            >
              <Toolbar className={classes.appBarControls}>
                <IconButton
                  color='inherit'
                  aria-label='open drawer'
                  onClick={handleDrawerOpen}
                  edge='start'
                  className={clsx(classes.menuButton, {
                    [classes.hide]: open,
                  })}
                >
                  <MenuIcon />
                </IconButton>

                <div className={classes.appBarControls}>
                  <div className='pageHeaderBlack'>
                    Dunder<span className='pageHeader'>Mifflin</span>
                  </div>

                  <div className={classes.headerActionContainer}>
                    <div className={classes.headerAction}>
                      <div
                        onClick={(event) => {
                          setAnchorEl(event.target);
                          setLogoutMenu(true);
                        }}
                      >
                        <AccountCircleIcon />
                      </div>
                      <div
                        className={classes.userName}
                        onClick={(event) => {
                          setAnchorEl(event.target);
                          setLogoutMenu(true);
                        }}
                      >
                        {appContext.currentUser.user_name}
                      </div>
                      <Menu
                        id='simple-menu'
                        anchorEl={anchorEl}
                        keepMounted
                        open={logoutMenu}
                        onClose={() => {
                          setLogoutMenu(false);
                          setAnchorEl(null);
                        }}
                      >
                        <MenuItem onClick={() => handleProfileClick()}>
                          Profile
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            localStorage.removeItem('token');
                            window.location.reload();
                            setLogoutMenu(false);
                          }}
                        >
                          Logout
                        </MenuItem>
                      </Menu>
                    </div>
                  </div>
                </div>
              </Toolbar>
            </AppBar>
          )}
          {appContext.isUserLoggedIn && (
            <Drawer
              variant='permanent'
              BackdropProps={{ invisible: true }}
              className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              })}
              classes={{
                paper: clsx({
                  [classes.drawerOpen]: open,
                  [classes.drawerClose]: !open,
                }),
              }}
            >
              <div className={classes.toolbar}>
                <img
                  src='./logo-white.png'
                  width='40px'
                  alt='logo'
                  className={classes.drawerIcon}
                />
                <IconButton onClick={handleDrawerClose}>
                  <ArrowLeftIcon style={{ color: 'white', fontSize: '2rem' }} />
                </IconButton>
              </div>
              {/* <Divider /> */}
              <List className={classes.list}>
                <Link
                  to='/orders'
                  className={clsx(classes.links, {
                    [classes.linksActive]: location.pathname.includes(
                      '/orders'
                    ),
                  })}
                >
                  <ListItem>
                    <ListItemIcon className={classes.listItemIcon}>
                      <DevicesOtherIcon
                        className={clsx(classes.linkIcons, {
                          [classes.linkActiveIcons]: location.pathname.includes(
                            '/orders'
                          ),
                        })}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Orders'
                      className={classes.listItemText}
                    />
                  </ListItem>
                </Link>
                <Link
                  to='/itemtypes'
                  className={clsx(classes.links, {
                    [classes.linksActive]: location.pathname.includes(
                      '/itemtypes'
                    ),
                  })}
                >
                  <ListItem>
                    <ListItemIcon className={classes.listItemIcon}>
                      <ImportantDevicesIcon
                        className={clsx(classes.linkIcons, {
                          [classes.linkActiveIcons]: location.pathname.includes(
                            '/itemtypes'
                          ),
                        })}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Item Types'
                      className={classes.listItemText}
                    />
                  </ListItem>
                </Link>
                <Link
                  to='/pallets'
                  className={clsx(classes.links, {
                    [classes.linksActive]: location.pathname.includes(
                      '/pallets'
                    ),
                  })}
                >
                  <ListItem>
                    <ListItemIcon className={classes.listItemIcon}>
                      <ViewColumnIcon
                        className={clsx(classes.linkIcons, {
                          [classes.linkActiveIcons]: location.pathname.includes(
                            '/pallets'
                          ),
                        })}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary='Palettes'
                      className={classes.listItemText}
                    />
                  </ListItem>
                </Link>

                {appContext.currentUser.user_role === 'Admin' && (
                  <Link
                    to='/users'
                    className={clsx(classes.links, {
                      [classes.linksActive]: location.pathname.includes(
                        '/users'
                      ),
                    })}
                  >
                    <ListItem>
                      <ListItemIcon className={classes.listItemIcon}>
                        <PeopleAltIcon
                          className={clsx(classes.linkIcons, {
                            [classes.linkActiveIcons]: location.pathname.includes(
                              '/users'
                            ),
                          })}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary='Users'
                        className={classes.listItemText}
                      />
                    </ListItem>
                  </Link>
                )}
              </List>
            </Drawer>
          )}
          <main className={classes.content}>
            {location.pathname !== '/login' && (
              <div className={classes.toolbar} />
            )}
            <Switch>
              <Route exact path='/' render={() => <Redirect to='/orders' />} />
              <Route path='/login' component={Login}></Route>
              <PrivateRoute path='/orders' component={Orders}></PrivateRoute>
              <PrivateRoute
                path='/itemtypes'
                component={ItemTypes}
              ></PrivateRoute>
              <PrivateRoute path='/users' component={Users}></PrivateRoute>
            </Switch>
          </main>
        </ThemeProvider>
      </div>
    )
  );
}
