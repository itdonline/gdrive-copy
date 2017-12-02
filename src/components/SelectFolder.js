'use strict';

import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import parseURL from '../util/parseURL';
import { showPicker } from '../util/picker';

export default class SelectFolder extends React.Component {
  constructor() {
    super();
    this.state = {
      value: ''
    };
    this.launchPicker = this.launchPicker.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  launchPicker() {
    this.props.picker.showPicker();
  }

  // allow TextInput to update if typing in
  // todo: should this be removed to only support pasting?
  handleChange(e) {
    this.setState({
      value: e.target.value
    });
  }

  /**
   * Parse the text pasted into the input
   * and extract an ID. Then call google script
   * to get metadata for that folder ID.
   * @param {pasteEvent} e
   */
  handlePaste(e) {
    const url = e.clipboardData.getData('Text');
    const id = parseURL(url);
    this.props.processing('Getting folder info');
    const _this = this;
    if (process.env.NODE_ENV === 'production') {
      google.script.run
        .withSuccessHandler(folder => {
          _this.setState({
            srcFolderURL: url
          });
          _this.props.handleFolderSelect(
            url,
            id,
            folder.name,
            folder.parents[0].id
          );
        })
        .withFailureHandler(err => {
          _this.props.showError(err);
        })
        .getMetadata(id);
    } else {
      // TEST MODE
      // ======================
      const _this = this;
      return setTimeout(function() {
        _this.setState({
          srcFolderURL: url
        });
        return _this.props.handleFolderSelect(url, id, 'test mode folder', id);
      }, 1000);
    }
  }

  render() {
    return (
      <div>
        <TextField
          floatingLabelText="Paste Folder URL"
          key="folderName"
          id="folderName"
          name="folderName"
          onChange={this.handleChange}
          onPaste={this.handlePaste}
          value={this.state.value}
        />
        <br />or<br />
        <RaisedButton
          label="Search your Drive"
          primary={true}
          onClick={this.launchPicker}
        />
      </div>
    );
  }
}
