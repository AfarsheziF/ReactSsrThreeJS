import { Grid, Button, Container, TextField } from "@mui/material";
import { Navigate } from "react-router-dom";
import React from "react";
import CircularProgress from '@mui/material/CircularProgress';

import logger from "../../logs/logger";
import utils from "../utils/utils";
import dataController from "../store/dataController";

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appConfig: {},
            showEnvParams: false,
            showSettings: false,
            showTexts: false,
            showAppConfig: false,
            // loggedIn: __DEV__
        }
    }

    componentDidMount() {
        if (this.state.loggedIn) {
            this.getData();
        }
    }

    getData = () => {
        const that = this;
        dataController.makeRequest(
            'post',
            [
                '/appConfig',
                '/data',
                '/backups'
            ],
            { session: this.state.session })
            .then(
                results => {
                    // console.log(results);
                    that.setState({
                        ...results[0],
                        ...results[1],
                        ...results[2]
                    })
                },
                e => {
                    alert(e.message);
                    logger.error(e)
                    this.setState({
                        loggedIn: false
                    })
                }
            )
    }

    onUploadCallback = status => {
        alert(status.message);
    }

    //

    getLogin = () => {
        return (
            <div style={{ width: "100%", height: "100%", display: 'table' }}>
                <Container
                    fixed
                    sx={{
                        backgroundColor: '#888',
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: 'center'
                    }}
                >
                    <Grid container direction={'row'} spacing={1}>
                        <Grid item xs={12}>
                            <TextField
                                type={'text'}
                                label='Password'
                                variant="outlined"
                                onChange={event => { this.setState({ textValue: event.target.value }) }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button onClick={() => {
                                const that = this;
                                dataController.makeRequest('post', '/validatePass', { value: this.state.textValue }
                                ).then(
                                    function (data) {
                                        // console.log(json);
                                        that.setState(data);
                                        if (data.loggedIn && data.session) {
                                            that.getData();
                                        }
                                    }, function (e) {
                                        that.setState({
                                            error: e.message
                                        })
                                        logger.error(e);
                                    }
                                )
                            }}>Submit</Button>
                            {this.state.error && <p>{this.state.error}</p>}
                        </Grid>
                    </Grid>
                </Container>
            </div >
        )
    }

    getUI = () => {
        return (
            <Grid container direction={'row'} spacing={1}>

                <Grid item xs={12}>
                    <h1 className="black">{this.state.appConfig.name} Admin.</h1>
                </Grid>

                {/*  */}

                <Grid item xs={12} className="border" style={{ padding: 5, marginTop: 5 }}>
                    <Grid container direction={'column'} spacing={1}>
                        <Grid item xs={12}>
                            <h3 className="">Application Config</h3>
                        </Grid>
                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.appConfig, 'appConfig') }}>
                                Download Application config
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => {
                                    dataController.uploadFile({ filePath: '/config', update: true, session: this.state.session }, 'appConfig.json', this.onUploadCallback)
                                }}>
                                Update Application config
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.appConfig_backup, 'appConfig_backup') }}>
                                Download Application config backup
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p
                                className="aStyle"
                                onClick={() => {
                                    this.setState({
                                        showAppConfig: !this.state.showAppConfig
                                    })
                                }}>{`${this.state.showAppConfig ? 'Hide' : 'Show'} Application config`}
                            </p>
                            {this.state.showAppConfig && <div><pre>{JSON.stringify(this.state.appConfig, null, 2)}</pre></div>}
                        </Grid>
                    </Grid>
                </Grid>

                {/*  */}

                <Grid item xs={12} className="border" style={{ padding: 5, marginTop: 5 }}>
                    <Grid container direction={'column'} spacing={1}>
                        <Grid item xs={12}>
                            <h3 className="">Simulation Config</h3>
                        </Grid>
                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.envParams, 'envParams') }}>
                                Download simulation params
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => dataController.uploadFile({ filePath: '/data', update: true, session: this.state.session }, 'envParams.json', this.onUploadCallback)}>
                                Upload simulation params
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.evnParams_backup, 'envParams_backup') }}>
                                Download simulation params backup
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p
                                className="aStyle"
                                onClick={() => {
                                    this.setState({
                                        showEnvParams: !this.state.showEnvParams
                                    })
                                }}>{`${this.state.showEnvParams ? 'Hide' : 'Show'} Simulation Params`}
                            </p>
                            {this.state.showEnvParams && <div><pre>{JSON.stringify(this.state.envParams, null, 2)}</pre></div>}
                        </Grid>
                    </Grid>
                </Grid>

                {/*  */}

                <Grid item xs={12} className="border" style={{ padding: 5, marginTop: 5 }}>
                    <Grid container direction={'column'} spacing={1}>
                        <Grid item xs={12}>
                            <h3 className="">Settings Dialog</h3>
                        </Grid>
                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.settings, 'settings') }}>
                                Download Settings Dialog params</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => dataController.uploadFile({ filePath: '/data', update: true, session: this.state.session }, 'settings.json', this.onUploadCallback)}>
                                Upload Settings Dialog params
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.settings_backup, 'settings_backup') }}>
                                Download Settings Dialog params backup</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p
                                className="aStyle"
                                onClick={() => {
                                    this.setState({
                                        showSettings: !this.state.showSettings
                                    })
                                }}>{`${this.state.showSettings ? 'Hide' : 'Show'} Settings Params`}
                            </p>
                            {this.state.showSettings && <div><pre>{JSON.stringify(this.state.settings, null, 2)}</pre></div>}
                        </Grid>
                    </Grid>
                </Grid>

                {/*  */}

                <Grid item xs={12} className="border" style={{ padding: 5, marginTop: 5 }}>
                    <Grid container direction={'column'} spacing={1}>
                        <Grid item xs={12}>
                            <h3 className="">Texts</h3>
                        </Grid>
                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.texts, 'texts') }}>
                                Download Texts</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => dataController.uploadFile({ filePath: '/data', update: true, session: this.state.session }, 'texts.json', this.onUploadCallback)}>
                                Upload Texts
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained"
                                onClick={() => { utils.downloadToJSON(this.state.texts_backup, 'texts_backup') }}>
                                Download Texts backup</Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p
                                className="aStyle"
                                onClick={() => {
                                    this.setState({
                                        showTexts: !this.state.showTexts
                                    })
                                }}>{`${this.state.showTexts ? 'Hide' : 'Show'} Texts Params`}
                            </p>
                            {this.state.showTexts && <div><pre>{JSON.stringify(this.state.texts, null, 2)}</pre></div>}
                        </Grid>
                    </Grid>
                </Grid>

                {/*  */}

                <Grid item xs={12} className="border" style={{ padding: 5, marginTop: 5 }}>
                    <Grid container direction={'column'} spacing={1}>
                        <Grid item xs={12}>
                            <Button className="_fullWidth" variant="contained" color='secondary'
                                onClick={() => {
                                    this.props.setAppState({ onDebug: true });
                                    setTimeout(() => {
                                        this.setState({
                                            navigationRoute: '/'
                                        })
                                    }, 500);
                                }}>
                                Launch Application in Debug Mode
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

            </Grid>
        )
    }

    render() {
        return (
            !this.state.loggedIn && this.getLogin() ||
            <div style={{ width: "100%", height: "100%", display: 'table' }}>
                <Container
                    fixed
                    sx={{
                        backgroundColor: '#888',
                        height: '100%',
                        overflow: 'auto',
                        display: this.state.envParams ? 'inherit' : 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: this.state.envParams ? 'left' : 'center'
                    }}
                >
                    {this.state.loggedIn && this.state.envParams && this.getUI()}
                    {this.state.loggedIn && !this.state.envParams && <CircularProgress size={85} />}
                    {this.state.navigationRoute && <Navigate to={this.state.navigationRoute} replace={true} />}
                </Container>
            </div >

        )
    }
}

export default Admin;