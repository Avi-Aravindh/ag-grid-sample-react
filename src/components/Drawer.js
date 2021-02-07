import React, { useState } from 'react';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Typography,
  AppBar,
} from '@material-ui/core';

import DevicesOtherIcon from '@material-ui/icons/DevicesOther';
import CategoryIcon from '@material-ui/icons/Category';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import { Link, useLocation } from 'react-router-dom';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = makeStyles((props) =>
  createStyles({
    root: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      width: '5%',
      backgroundColor: '#232323',
      transitionDuration: '500ms',
      borderTop: 'none',
      zIndex: 1000,
    },

    imageContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      width: '100%',
      height: '60px',
      color: 'white',
      marginBottom: '50px',
    },

    linkContainer: {
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '140px',
      width: '100%',
      height: '80%',
    },

    links: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingTop: '15px',
      paddingBottom: '15px',
      marginBottom: '25%',
      fontFamily: 'Poppins',
      fontSize: '0.75rem',
      color: 'white',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      lineHeight: 2.5,
      '&:hover': {
        backgroundColor: '#3B5096',
        borderRadius: '5px',
      },
    },

    linksActive: {
      backgroundColor: '#3B5096',
      borderRadius: '5px',
      transitionDuration: '500ms',
    },

    linksText: {
      fontFamily: 'Poppins',
      fontSize: '0.75rem',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      lineHeight: 2.5,
      textDecoration: 'none',
    },
  })
);

const AppDrawer = ({ open }) => {
  const location = useLocation();
  console.log('location', location);
  const theme = useTheme();

  return (
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
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'rtl' ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </div>
      {/* <Divider /> */}
      <List>
        <Link to='/assets' className={classes.linksText}>
          <ListItem>
            <ListItemIcon>
              <DevicesOtherIcon />
            </ListItemIcon>
            <ListItemText primary='Assets' />
          </ListItem>
        </Link>
        <Link to='/pallettes' className={classes.linksText}>
          <ListItem style={{ background: 'red' }}>
            <ListItemIcon>
              <ViewColumnIcon />
            </ListItemIcon>
            <ListItemText primary='Palettes' />
          </ListItem>
        </Link>
        <Link to='/categories' className={classes.linksText}>
          <ListItem>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary='Categories' />
          </ListItem>
        </Link>
      </List>
    </Drawer>

    // <Drawer
    //   //   className={classes.root}
    //   classes={{
    //     paper: classes.root,
    //   }}
    //   variant='permanent'
    //   anchor='left'
    // >
    //   <div
    //     className={classes.imageContainer}
    //     // onClick={() => setDrawerOpen((prev) => !prev)}
    //   >
    //     <img src='/logo-footer.png' alt='logo' width='40' height='40' />
    //     {/* {drawerOpen && <ChevronLeftIcon />} */}
    //   </div>

    //   <div className={classes.linksContainer}>
    //     <Link to='/assets' className={classes.linksText}>
    //       <div
    //         className={clsx(classes.links, {
    //           [classes.linksActive]: location.pathname.includes('/assets'),
    //         })}
    //       >
    //         <DevicesOtherIcon />
    //         <div className={classes.linksText}>Assets</div>
    //       </div>
    //     </Link>
    //     <Link to='/pallettes' className={classes.linksText}>
    //       <div
    //         className={clsx(classes.links, {
    //           [classes.linksActive]: location.pathname.includes('/pallettes'),
    //         })}
    //       >
    //         <ViewColumnIcon />
    //         Pallettes
    //       </div>
    //     </Link>
    //     <Link to='/categories' className={classes.linksText}>
    //       <div
    //         className={clsx(classes.links, {
    //           [classes.linksActive]: location.pathname.includes('/categories'),
    //         })}
    //       >
    //         <CategoryIcon />
    //         Categories
    //       </div>
    //     </Link>
    //   </div>
    // </Drawer>
  );
};

export default AppDrawer;
