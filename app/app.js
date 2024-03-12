import React from 'react';
import { Typography } from '@mui/material';

import AppRouter from './navigation/appRouter';
import appUtils from './utils/appUtils';
import IntroDialog from './components/dialogs/introDialog';
import LoadingManager from './store/LoadingManager';

import styles from './style/styles';

function Copyright() {
  return (
    <Typography variant="body2" align="center" color="primary" style={{ position: 'absolute', bottom: 0 }}>
      {'Copyright © '}
      {/* <Link color="primary"> */}
      {typeof document !== 'undefined' ? document.title : ""}
      {/* </Link> */}
      {' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      onDebug: __DEV__,
      showIntroDialog: true,
      introIsDone: true
    };

    this.loadingManager = new LoadingManager();

    console.log_org = console.log;
    if (!__DEV__) {
      console.log = function () { };
    }
  }

  componentDidMount() {
    console.log('** App Mounted **');
    appUtils.browserCheck();
    styles.init();
    this.setState({
      envParams: window && window.envParams || {}
    });

    appUtils.getGpuTier().then(
      (res) => {
        this.setState({
          gpu: res
        })
      },
      e => {
        this.setState({
          gpu: { error: e }
        })
      }
    )
  }

  setAppState = (state) => {
    // this.setState(Object.assign(this.state, state));
    this.setState(state);
    if (state.onDebug) {
      console.log = console.log_org;
    }
  }

  render() {
    return (
      <div style={{ height: '100%', width: '100%', backgroundColor: 'black' }}>

        {/* <IntroDialog
          visible={!this.state.holderState?.sceneStared || !this.state.holderState?.components?.Audio?.loaded}
          loadingManager={this.loadingManager}
          opacity={0.5}
        />

        {this.state.gpu &&
          !this.state.gpu.error &&
          <AppRouter
            appState={this.state}
            setAppState={this.setAppState}
            envParams={this.state.envParams}
            appConfig={this.props.appConfig}
            loadingManager={this.loadingManager}
          />
        } */}

        <AppRouter
          appState={this.state}
          setAppState={this.setAppState}
          envParams={this.state.envParams}
          appConfig={this.props.appConfig}
          loadingManager={this.loadingManager}
        />

        {this.state.gpu &&
          this.state.gpu.error &&
          <div>
            <h1>GPU ERROR</h1>
            <pre>{JSON.stringify(this.state.gpu, null, 2)}</pre>
          </div>
        }

        <Copyright />
      </div>
    );
  }
}
