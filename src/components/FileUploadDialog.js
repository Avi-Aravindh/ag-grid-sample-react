import {
  faTimes,
  faFileUpload,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import XLSX from 'xlsx';
import AppContext from '../context/AppContext';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fetchPut, fetchPost, fetchGet } from '../utilities/dataCalls';
import React, { useState, useRef, useEffect, useContext } from 'react';
import PacmanLoader from 'react-spinners/PacmanLoader';
import GridLoader from 'react-spinners/GridLoader';

import {
  DATAURLS,
  FILE_UPLOAD_ROW_COUNT_ERROR,
  FILE_UPLOAD_ROW_COUNT_ERROR_MESSAGE,
  FILE_UPLOAD_order_id_MISSING_MESSAGE,
  FILE_UPLOAD_EMPTY_FILE_MESSAGE,
} from '../utilities/constants';

const useStyles = makeStyles((theme) =>
  createStyles({
    dialogRoot: {
      width: '600px',
      height: '450px',
      display: 'flex',
      flexDirection: 'column',
    },
    dialogTitle: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '40px',
      background: 'linear-gradient(to right, #eef2f3, #8e9eab)',
      boxShadow: '1px 1px 3px #8e9eab',
    },
    dialogTitleText: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: "'Poppins'",
      fontWeight: 700,
      textTransform: 'uppercase',
      fontSize: '0.85rem',
    },
    dialogContent: {
      //   marginTop: '10px',
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
    actionIcon: {
      fontSize: '1.25rem',
      cursor: 'pointer',
    },
    stepContent: {
      width: '100%',
    },
    steps: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      //   paddingLeft: '20px',
    },
    stepsText: {
      marginTop: '15px',
      fontFamily: 'Poppins',
      fontSize: '20px',
    },
    stepsTextError: {
      marginTop: '15px',
      fontFamily: 'Poppins',
      fontSize: '20px',
      color: 'red',
      textAlign: 'center',
    },
    stepsSubText: {
      marginTop: '5px',
      fontFamily: 'Poppins',
      fontSize: '12px',
    },
    uploadArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: '#ababab',
      '&:hover': {
        color: '#3B5096',
        cursor: 'pointer',
      },
    },
    uploadIcon: {
      fontSize: '80px',
      // color: '#cdcdcd',
      // '&:hover': {
      //   color: '#3B5096',
      //   cursor: 'pointer',
      // },
    },
    successIcon: {
      color: '#3B5096',
      marginBottom: '15px',
    },
    errorIcon: {
      color: '#eb8034',
      marginBottom: '15px',
    },
    successArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    spinnerArea: {
      marginBottom: '10px',
    },
    animatedItem: {
      animation: `$myEffect 300ms ${theme.transitions.easing.easeInOut}`,
    },
    '@keyframes myEffect': {
      '0%': {
        opacity: 0,
      },
      '100%': {
        opacity: 1,
      },
    },
  })
);

const handleSubmit = () => {
  console.log('handle submit');
};

const FileUploadDialog = ({
  open,
  title,
  allAssets,
  setOpen,
  assetTypes,
  palletNumbers,
  statusNames,
  getNewData,
  parentGridApi,
}) => {
  console.log('Allassets', allAssets, assetTypes, statusNames);
  const classes = useStyles();
  const fileUploader = useRef(null);
  const appContext = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [fileUploadErrorMessage, setFileUploadErrorMessage] = useState('');
  const [data, setData] = useState([]);
  const [cols, setCols] = useState([]);
  const [steps, setSteps] = useState([
    'Select a file',
    'Update Records',
    'Insert Records',
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [assetIDRows, setAssetIDRows] = useState([]);
  const [nonAssetIDRows, setNonAssetIDRows] = useState([]);

  useEffect(() => {
    handleReset();
  }, [open]);

  useEffect(() => {
    if (!success) {
      return;
    }
    let allAssetIDs = allAssets.map((asset) => asset.order_id);
    console.log('allasset ids , data', allAssetIDs, data);
    setAssetIDRows(
      data.filter((row) => allAssetIDs.indexOf('' + row.order_id) !== -1)
    );
    setNonAssetIDRows(
      data.filter((row) => allAssetIDs.indexOf('' + row.order_id) === -1)
    );
  }, [success]);

  const handleReset = () => {
    setLoading(false);
    setSuccess(false);
    setError(false);
    setData([]);
    setCols([]);
    setCurrentStep(0);
    setAssetIDRows([]);
    setNonAssetIDRows([]);
    setFileUploadSuccess(false);
    setFileUploadErrorMessage('');
    setFileUploadError(false);
    if (fileUploader.current) {
      fileUploader.current.value = null;
    }
  };

  const handleNext = () => {
    setSuccess(false);
    setError(false);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let updateSuccess = await fetchPut(
        DATAURLS.ORDERS_MULTIPLE.url,
        assetIDRows,
        appContext.token
      );
      setLoading(false);
      if (updateSuccess.ok) {
        setSuccess(true);
      } else {
        setError(true);
        setLoading(false);
        setFileUploadErrorMessage(updateSuccess.message.split('-')[1]);
      }
    } catch (err) {
      console.log('update error', err);
      setLoading(false);
      setError(false);
      setFileUploadErrorMessage(err.message);
      throw err;
    }
  };

  const handleInsert = async () => {
    setLoading(true);
    let dataWithoutAssetIds = nonAssetIDRows.map((asset) => {
      let tempObject = { ...asset };
      if (!tempObject.order_id) {
        tempObject.order_id = null;
      }
      Object.keys(tempObject).forEach((key) => {
        if (!tempObject[key]) {
          delete tempObject[key];
        }
      });

      return tempObject;
    });

    try {
      let insertSuccess = await fetchPost(
        DATAURLS.ORDERS_MULTIPLE.url,
        dataWithoutAssetIds,
        appContext.token
      );
      setLoading(false);
      if (insertSuccess.ok) {
        setSuccess(true);
      } else {
        setError(true);
        setLoading(false);
        setFileUploadErrorMessage(insertSuccess.message.split('-')[1]);
      }
    } catch (err) {
      setLoading(false);
      setError(false);
      setFileUploadErrorMessage(err.message);
      throw err;
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];

    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    setLoading(true);
    try {
      reader.onload = (e) => {
        /* Parse data */
        const bstr = e.target.result;
        // const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
        const wb = XLSX.read(bstr, { type: 'binary' });
        // const wb = XLSX.readFile(file.path);
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws, { defval: null });
        /* Update state */
        setData(data);
        setCols(make_cols(ws['!ref']));
        console.log('resetting load');

        setLoading(false);
        console.log('columns', data);

        // checking all file upload errors here
        if (data.length === 0 || !data) {
          console.log('columns empty file', data);
          setSuccess(true);
          setFileUploadError(true);
          setFileUploadErrorMessage(FILE_UPLOAD_EMPTY_FILE_MESSAGE);
          return;
        }

        if (Object.keys(data[0]).indexOf('order_id') === -1) {
          setSuccess(true);
          setFileUploadError(true);
          setFileUploadErrorMessage(FILE_UPLOAD_order_id_MISSING_MESSAGE);
          return;
        }

        if (data.length > FILE_UPLOAD_ROW_COUNT_ERROR) {
          setSuccess(true);
          setFileUploadError(true);
          setFileUploadErrorMessage(FILE_UPLOAD_ROW_COUNT_ERROR_MESSAGE);
          return;
        }
        // Checking for new asset types in uploaded file
        // let newAssetType = data.find(
        //   (asset) => assetTypes.indexOf(asset.asset_type) === -1
        // );

        // if (newAssetType) {
        //   setSuccess(true);
        //   setFileUploadError(true);
        //   setFileUploadErrorMessage(
        //     `Invalid asset type - '${newAssetType.asset_type}' found in one or more rows`
        //   );
        //   return;
        // }

        // Checking for new status values in uploaded file
        // let newStatus = data.find(
        //   (asset) => asset.status && statusNames.indexOf(asset.status) === -1
        // );
        // if (newStatus) {
        //   setSuccess(true);
        //   setFileUploadError(true);
        //   setFileUploadErrorMessage(
        //     `Invalid status - '${newStatus.status}' found in one or more rows`
        //   );
        //   return;
        // }

        // Checking for new pallet number in uploaded file
        // let newPalletNumber = data.find(
        //   (asset) =>
        //     asset.pallet_number &&
        //     palletNumbers.indexOf(asset.pallet_number) === -1
        // );

        // console.log('pallet numbers', data, palletNumbers, newPalletNumber);
        // if (newPalletNumber) {
        //   setSuccess(true);
        //   setFileUploadError(true);
        //   setFileUploadErrorMessage(
        //     `Invalid pallet number - '${newPalletNumber.pallet_number}' found in one or more rows`
        //   );
        //   return;
        // }

        // // Checking for empty quanity in uploaded file
        // let emptyQuantity = data.find((asset) => !asset.quantity);
        // if (emptyQuantity) {
        //   setSuccess(true);
        //   setFileUploadError(true);
        //   setFileUploadErrorMessage(
        //     `Invalid quantity - one or more rows with no quantity values`
        //   );
        //   return;
        // }

        setFileUploadSuccess(true);
        setSuccess(true);
        // this.setState({ data: data, cols: make_cols(ws['!ref']) });
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
    } catch (err) {
      setError(true);
      throw err;
    }

    // fileUploader.current.value = '';
  };

  const make_cols = (refstr) => {
    let o = [],
      C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i)
      o[i] = { name: XLSX.utils.encode_col(i), key: i };
    return o;
  };

  const stepContent = (stepNumber) => {
    switch (stepNumber) {
      case 0: {
        return (
          <div className={classes.steps}>
            <input
              type='file'
              ref={fileUploader}
              style={{ display: 'none' }}
              accept={'.csv, .xls, .xlsx'}
              onChange={(e) => handleFileUpload(e)}
            />
            {!loading && !success && (
              <div
                onClick={(e) => fileUploader.current.click()}
                className={classes.uploadArea}
              >
                <FontAwesomeIcon
                  icon={faFileUpload}
                  className={classes.uploadIcon}
                />
                <div className={classes.stepsText}>Select a file</div>
                <div className={classes.stepsSubText}>
                  (.csv, .xls, .xlsx. Also, limit to 1000 rows)
                </div>
              </div>
            )}
            {loading && (
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className={clsx(classes.uploadArea, classes.uploadIcon)}
              />
            )}
            {!loading && success && (
              <div className={classes.successArea}>
                {!fileUploadError && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={clsx(
                      classes.uploadArea,
                      classes.uploadIcon,
                      classes.successIcon,
                      classes.animatedItem
                    )}
                  />
                )}
                {fileUploadError && (
                  <div className={classes.uploadArea}>
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      className={clsx(
                        classes.uploadIcon,
                        classes.errorIcon,
                        classes.animatedItem
                      )}
                    />
                    <div
                      className={classes.uploadArea}
                      onClick={(e) => {
                        fileUploader.current.click();
                        setTimeout(() => {
                          handleReset();
                        }, 500);
                      }}
                    >
                      Click here to try again
                    </div>
                  </div>
                )}
                {!fileUploadError && (
                  <div className={classes.stepsText}>
                    {data.length} rows found. Let's start reviewing
                  </div>
                )}
                {fileUploadError && (
                  <div className={classes.stepsTextError}>
                    {fileUploadErrorMessage}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
      case 1: {
        return (
          <div className={classes.successArea}>
            {!loading && !success && (
              <div>
                <div className={classes.stepsText}>
                  {assetIDRows.length} records with a matching Asset ID
                </div>
              </div>
            )}
            {loading && <PacmanLoader color='#3B5096' size={50} />}
            {!loading && success && (
              <div>
                <div className={classes.stepsText}>Update Successful</div>
              </div>
            )}
            {!loading && error && (
              <div>
                <div className={classes.stepsTextError}>
                  {fileUploadErrorMessage}
                </div>
              </div>
            )}
          </div>
        );
      }
      case 2: {
        return (
          <div className={classes.successArea}>
            {!loading && !success && (
              <div>
                <div className={classes.stepsText}>
                  {nonAssetIDRows.length} new records found
                </div>
              </div>
            )}
            {loading && <GridLoader color='#3B5096' size={30} />}
            {!loading && success && (
              <div>
                <div className={classes.stepsText}>Insertion Successful</div>
              </div>
            )}
            {!loading && error && (
              <div>
                <div className={classes.stepsTextError}>
                  {fileUploadErrorMessage}
                </div>
              </div>
            )}
          </div>
        );
      }
      default: {
        <div>Successful</div>;
      }
    }
  };

  return (
    <Dialog
      open={open}
      //   onClose={getNewData(p)}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
      maxWidth='md'
      //   className={classes.dialogRoot}
    >
      <div className={classes.dialogRoot}>
        <DialogTitle id='alert-dialog-title' className={classes.dialogTitle}>
          <div className={classes.dialogTitleText}>
            <div>{title}</div>
          </div>
          <FontAwesomeIcon
            icon={faTimes}
            className={classes.actionIcon}
            onClick={() => setOpen(false)}
          />
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          <DialogContentText id='alert-dialog-description'>
            <Stepper
              activeStep={currentStep}
              alternativeLabel
              // style={{ width: '700px', height: '400px' }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </DialogContentText>
          <div className={classes.stepContent}>{stepContent(currentStep)}</div>
        </DialogContent>
        <DialogActions>
          <div className={classes.buttonContainer}>
            <Button
              variant='contained'
              onClick={() => handlePrevious()}
              color='secondary'
              disabled={currentStep === 0}
              className={classes.button}
            >
              Back
            </Button>

            {currentStep !== 2 && (
              <Button
                variant='contained'
                onClick={() => handleNext()}
                color='primary'
                disabled={
                  !assetIDRows.length === 0 ||
                  !fileUploadSuccess ||
                  (assetIDRows.length > 0 &&
                    (loading || fileUploadError || !success))
                }
                className={classes.button}
              >
                Next
                {/* {loading && (
                <CircularProgress
                  size='1rem'
                  className={classes.buttonProgress}
                /> 
              )}*/}
              </Button>
            )}

            {currentStep === 1 && !success && assetIDRows.length > 0 && (
              <Button
                variant='contained'
                onClick={() => handleUpdate()}
                color='primary'
                disabled={loading}
                className={classes.button}
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
            {currentStep === 2 && !success && nonAssetIDRows.length > 0 && (
              <Button
                variant='contained'
                onClick={() => handleInsert()}
                color='primary'
                disabled={loading}
                className={classes.button}
              >
                Insert
                {loading && (
                  <CircularProgress
                    size='1rem'
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            )}
            {currentStep === 2 &&
              (nonAssetIDRows.length === 0 ||
                (nonAssetIDRows.length > 0 && success)) && (
                <Button
                  variant='contained'
                  onClick={() => {
                    getNewData(parentGridApi);
                    setOpen(false);
                  }}
                  color='primary'
                  disabled={loading}
                  className={classes.button}
                >
                  Finish
                  {loading && (
                    <CircularProgress
                      size='1rem'
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              )}
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default FileUploadDialog;
