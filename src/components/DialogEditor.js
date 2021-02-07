import React, { Component, createRef } from 'react';
import CustomDialog from '../components/CustomDialog';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

export default class DialogEditor extends Component {
  constructor(props) {
    super(props);
    console.log('dialog editor', props);
    let inputRef = createRef();
    this.state = this.createInitialState(props);

    this.handleChange = this.handleChange.bind(this);
  }

  createInitialState(props) {
    return {
      value: props.value,
    };
  }

  getValue() {
    return this.state.value;
  }

  afterGuiAttached() {
    console.log('dialgue editor after gui');
  }

  focusIn() {
    console.log('dialgue editor focus in');
    this.setState({
      open: true,
    });
    this.inputRef.focus();
  }

  handleChange(event) {
    this.setState({ value: event.target.innerText });
  }

  render() {
    return (
      <div>
        <Autocomplete
          options={this.props.values}
          getOptionLabel={(option) => option}
          openOnFocus
          onChange={(event) => this.handleChange(event)}
          renderInput={(params) => (
            <TextField
              {...params}
              label={this.state.value}
              inputRef={(input) => {
                this.inputRef = input;
              }}
              margin='normal'
              value={this.state.value}
            />
          )}
        />
      </div>
    );
  }
}
