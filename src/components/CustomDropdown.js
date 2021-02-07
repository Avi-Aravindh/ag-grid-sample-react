import { makeStyles, createStyles } from '@material-ui/core/styles';

import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      height: '50px',
      marginTop: '-40px',
      paddingLeft: '20px',
      fontFamily: 'Poppins',
      // fontWeight: 'bold',
      fontSize: '0.75rem',
      textTransform: 'none',
      letterSpacing: '1px',
      lineHeight: 2.5,
      textDecoration: 'none',
    },
    options: {
      marginLeft: '5px',
      fontFamily: 'poppins',
      fontSize: '0.75rem',
    },
  })
);
const CustomDropdown = ({ value, onChange, options }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      Page size
      <div className={classes.options}>
        <select
          onChange={(event) => onChange(Number(event.target.value))}
          value={value}
        >
          {options.map((option) => (
            <option value={option} selected>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomDropdown;
