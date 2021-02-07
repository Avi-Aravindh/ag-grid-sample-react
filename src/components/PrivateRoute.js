import React, { useContext } from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import AppContext from '../context/AppContext';

const PrivateRoute = ({ component: Component, ...props }) => {
  const appContext = useContext(AppContext);
  const location = useLocation();
  console.log('privateroute, appContext', appContext);
  return (
    <Route
      {...props}
      render={
        (props) =>
          location.pathname === '/users' ? (
            appContext.isUserLoggedIn > 0 &&
            appContext.currentUser.user_role === 'Admin' ? (
              <Component {...props} />
            ) : (
              <Redirect to='/login' />
            )
          ) : appContext.isUserLoggedIn > 0 ? (
            <Component {...props} />
          ) : (
            <Redirect to='/login' />
          )

        // appContext.isUserLoggedIn > 0 ? (
        //   <Component {...props} />
        // ) : (
        //   <Redirect to='/login' />
        // )
      }
    />
  );
};

export default PrivateRoute;
