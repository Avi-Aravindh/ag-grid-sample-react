export const BUTTONS = {
  IMPORT: {
    label: 'Import',
    backgroundColor: 'default',
  },
  EXPORT: {
    label: 'Export',
    backgroundColor: 'default',
  },
  BULK_UPDATE: {
    label: 'Bulk Update',
    backgroundColor: 'default',
  },
  ADD: {
    label: 'Add',
    backgroundColor: 'default',
  },
  DELETE: {
    label: 'Delete',
    backgroundColor: 'default',
  },
  COPY: {
    label: 'Copy',
    backgroundColor: 'default',
  },
  SAVE: {
    label: 'Save',
    backgroundColor: 'default',
  },
  RESET: {
    label: 'Reset',
    backgroundColor: 'default',
  },
};

export const FILE_UPLOAD_ROW_COUNT_ERROR = 1000;
export const FILE_UPLOAD_ROW_COUNT_ERROR_MESSAGE =
  'Invalid file. Exceeds 1000 rows';
export const FILE_UPLOAD_order_id_MISSING_MESSAGE =
  'Invalid file. Column order_id (Asset Number) is missing';
export const FILE_UPLOAD_EMPTY_FILE_MESSAGE =
  'Invalid file. No records available';

const domain = 'http://griddemoapi.aravindh.me/api';
// const domain = 'http://localhost:5000/api';

export const DATAURLS = {
  ORDERS: { url: `${domain}/orders` },
  COLUMNDEFINITIONS: {
    url: `${domain}/orders/columnDefinitions`,
  },
  ORDERS_ALL: { url: `${domain}/orders/all` },
  ORDERS_MULTIPLE: { url: `${domain}/orders/multiple` },

  ITEMTYPES: { url: `${domain}/itemtypes` },
  PALLETS: { url: `${domain}/pallets` },
  PALLETS_COLUMNDEFINITIONS: {
    url: `${domain}/pallets/columnDefinitions`,
  },
  PALLETS_STATUS_CODES: {
    url: `${domain}/pallets/statusCodes`,
  },
  PALLETS_IN_PRODUCTION: {
    url: `${domain}/pallets/inproduction`,
  },
  PICEA: { url: `${domain}/picea` },
  PICEA_COLUMNDEFINITIONS: {
    url: `${domain}/picea/columnDefinitions`,
  },
  CERTUS: { url: `${domain}/certus` },
  CERTUS_COLUMNDEFINITIONS: {
    url: `${domain}/certus/columnDefinitions`,
  },
  PICEA_DIRECT: {},
  STATUS_CODES: {
    url: `${domain}/statuscodes`,
  },
  USERS: { url: `${domain}/users` },
  USERS_COLUMNDEFINITIONS: { url: `${domain}/users/columnDefinitions` },
  USER_ROLES: { url: `${domain}/users/roles` },
  LOGIN: { url: `${domain}/users/login` },
  AUTHORIZE: { url: `${domain}/users/authorize` },
};
