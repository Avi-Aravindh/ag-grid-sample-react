import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef();

  useEffect(() => {
    console.log('celleditor123, useffect', props);
    inputRef.current.focus();
    inputRef.current.value = props.charPress;
    setValue(props.charPress);
  }, []);

  function onChangeHandler(e, value) {
    setValue(value);
  }

  function onInputChangeHandler(e, inputValue) {
    console.log('celleditor123, inputValue', inputValue);
    inputRef.current.focus();

    setInputValue(inputValue);
  }

  function onKeyDown(params) {
    console.log('celleditor123, onkeyDown', params);
    inputRef.current.focus();
    inputRef.current.value = props.charPress;
    setValue(props.charPress);
  }

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return value;
      },
      afterGuiAttached: () => {
        setValue(props.value);
      },
    };
  });

  return (
    <Autocomplete
      style={{ padding: '0 10px' }}
      options={props.values}
      value={value}
      onChange={onChangeHandler}
      inputValue={inputValue}
      onInputChange={onInputChangeHandler}
      onKeyDown={onKeyDown}
      disableClearable
      freeSolo
      selectOnFocus
      renderInput={(params) => (
        <TextField
          {...params}
          style={{ padding: '5px 0' }}
          placeholder={'Select ' + props.column.colId}
          inputRef={inputRef}
        />
      )}
    />
  );
});
