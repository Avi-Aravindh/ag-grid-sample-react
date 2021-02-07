import { DATAURLS } from './constants';
import { fetchGet } from '../utilities/dataCalls';

export const authenticate = () => {
  //   const tokenFromLocal = localStorage.getItem('token');
  console.log('tokenfromlocal', localStorage.token);
  let promise = new Promise((resolve, reject) => {
    if (!localStorage.token) {
      reject(false);
      return;
    }
    fetchGet(DATAURLS.AUTHORIZE.url, localStorage.token)
      .then((res) => {
        if (res.ok) {
          console.log('user verified');
          resolve({
            currentUser: res.currentUser,
            token: localStorage.token,
          });
        } else {
          console.log('user not verified');
          resolve({
            currentUser: {},
            token: null,
          });
        }
      })
      .catch((err) => {
        console.log('unable to authorize session');
        reject(err);
      });
  });

  return promise;
};
