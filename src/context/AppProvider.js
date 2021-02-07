import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';
import { authenticate } from '../utilities/authenticate';

const AppProvider = (props) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [token, setToken] = useState('');

  useEffect(() => {
    authenticate()
      .then((res) => {
        console.log('appcontext initial load setting verified');
        if (res.currentUser.user_name) {
          setIsUserLoggedIn(true);
          setCurrentUser(res.currentUser);
          setToken(res.token);
        } else {
          setIsUserLoggedIn(false);
          setCurrentUser({});
          setToken('');
        }
        setIsVerified(true);
      })
      .catch((err) => {
        setIsUserLoggedIn(false);
        setCurrentUser({});
        setToken('');
        setIsVerified(true);
        console.log('error in authenticating');
        throw err;
      });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isUserLoggedIn,
        setIsUserLoggedIn,
        token,
        setToken,
        currentUser,
        setCurrentUser,
        isVerified,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppProvider;
