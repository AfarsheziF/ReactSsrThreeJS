import React from 'react';
import { Typography, Link, Box } from '@mui/material';

import AppRouter from './navigation/appRouter';
import styles from './style/styles';

import utils from './utils/utils';
utils.browserCheck();

function Copyright() {
  return (
    <Typography variant="body2" align="center" color="primary">
      {'Copyright © '}
      <Link color="primary" href="https://earthsignaluniversewide.com/">
        {typeof document !== 'undefined' ? document.title : ""}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onDebug: __DEV__
    };
    console.log_org = console.log;
    if (!__DEV__) {
      console.log = function () { };
    }
  }

  componentDidMount() {
    console.log('-- App Mounted --');
    console.log(window.envParams);
    this.setState({
      envParams: window.envParams || {}
    })
  }

  setAppState = (state) => {
    this.setState(state);
    if (state.onDebug) {
      console.log = console.log_org;
    }
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%', backgroundColor: 'black' }}>
        {/* <NavHeader /> */}
        <AppRouter appState={this.state} setAppState={this.setAppState} envParams={this.state.envParams} />
        <Copyright />
      </div>
    );
  }
}
