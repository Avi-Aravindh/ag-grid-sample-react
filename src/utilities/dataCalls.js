export const fetchGet = (endPoint, token) => {
  let promise = new Promise((resolve, reject) => {
    fetch(endPoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token,
      },
      method: 'get',
    })
      .then(async (res) => {
        let response = await res.json();
        response.ok = res.ok;
        resolve(response);
      })
      .catch((err) => {
        if (err.code === 403) {
          window.location.reload();
        }
        console.log(`Error fetching data from ${endPoint}`);
        reject(err);
      });
  });

  return promise;
};

export const fetchPost = (endPoint, params, token) => {
  console.log('login, fetch', endPoint, params);
  let promise = new Promise((resolve, reject) => {
    fetch(endPoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token,
      },
      method: 'post',
      body: JSON.stringify(params),
    })
      .then(async (res) => {
        let response = await res.json();
        response.ok = res.ok;
        resolve(response);
      })
      .catch((err) => {
        if (err.code === 403) {
          window.location.reload();
        }
        console.log(`Error in adding ${params} at ${endPoint}`);
        reject(err);
      });
  });

  return promise;
};

export const fetchPut = (endPoint, params, token) => {
  let promise = new Promise((resolve, reject) => {
    fetch(endPoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token,
      },
      method: 'put',
      body: JSON.stringify(params),
    })
      .then(async (res) => {
        let response = await res.json();
        response.ok = res.ok;
        resolve(response);
      })
      .catch((err) => {
        if (err.code === 403) {
          window.location.reload();
        }
        console.log(`Error in updating ${params} at ${endPoint}`);
        reject(err);
      });
  });

  return promise;
};

export const fetchDelete = (endPoint, params, token) => {
  let promise = new Promise((resolve, reject) => {
    fetch(endPoint, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        token,
      },
      method: 'delete',
      body: JSON.stringify(params),
    })
      .then(async (res) => {
        let response = await res.json();
        response.ok = res.ok;
        resolve(response);
      })
      .catch((err) => {
        if (err.code === 403) {
          window.location.reload();
        }
        console.log(`Error in updating ${params} at ${endPoint}`);
        reject(err);
      });
  });

  return promise;
};
