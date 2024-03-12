import React from "react";
import _ from "lodash";

import { Grid, Slide, Button, Fade } from '@mui/material';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton'

import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';

import ResponsiveDialog from '../../components/dialogs/ResponsiveDialog';
import StretchableText from "../../components/Text/StretchableText";

import appUtils from '../../utils/appUtils';

import Scene from './scene';
import dataController from "../../store/dataController";
import textController from "../../store/textController";
import settingsController from "../../store/settingsController";
import ImageContainer from "../../components/Image/ImageContainer";
import SceneTest from "./scene_test";


class SceneHolder extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showLoadingDialog: true,
            openDialog: false,
            dialogObj: null,
            animationTime: 0,
            sliderValue: 0,
            onCameraRotation: false,
            sceneSettings: {},
            showPlanets: false,
            hideUiList: appUtils.isMobile,
            showUI: false,
            showMenu: true,
            showStartMenu: true,
            components: {}
        }
    }

    componentDidMount() {
        console.log("-- Scene Holder mount --");
        window.addEventListener('resize', this.onWindowResize, false);
        // window.addEventListener('mousemove', this.onMouseMove, false);
        // window.addEventListener('pointerdown', this.onPointerDown, false);
        // window.addEventListener('pointerup', this.onPointerUp, false);
        // window.addEventListener('wheel', this.onMouseWheel, false);

        // // window.addEventListener("touchstart", this.onTouchStart, false);
        // // window.addEventListener("touchend", this.onTouchEnd, false);
        // // window.addEventListener("touchcancel", this.onTouchCancel, false);
        // window.addEventListener("touchmove", this.onMouseMove, false);

        // window.addEventListener("keydown", this.onKeyPress, false);

        this.getData();
    }

    componentDidUpdate() {
        if (
            appUtils.isMobile &&
            this.state.sceneStared &&
            !this.state.mobileDialogShowed) {
            this.openMobileDialog();
        }
    }

    getData = () => {
        const that = this;
        dataController.makeRequest('get', '/data').then(
            data => {
                console.log("Site Data:", data);
                for (let key in data.texts) {
                    textController.addSection(key, data.texts[key]);
                }
                that.setState({
                    onCameraRotation: data.envParams.camera.enableCameraRotation,
                    ...data
                });
            },
            e => console.log(e)
        )
    }

    //listeners

    onMouseMove = e => {
        if (this.scene && this.scene.onMouseMove) {
            this.scene.onMouseMove(e);
        }
    }

    onPointerDown = e => {
        if (this.scene && this.scene.onPointerDown) {
            this.scene.onPointerDown(e);
        }
    }

    onPointerUp = e => {
        if (this.scene && this.scene.onPointerUp) {
            this.scene.onPointerUp(e);
        }
    }

    onWindowResize = e => {
        if (this.scene && this.scene.onWindowResize) {
            this.scene.onWindowResize(e);
        }
    }

    onMouseWheel = e => {
        if (this.scene && this.scene.onMouseWheel) {
            this.scene.onMouseWheel(e);
        }
    }

    onKeyPress = e => {
        // console.log(e.code);
        // switch (e.code) {
        //     case "Space":
        //         this.setState({
        //             onTransmission: true
        //         })
        //         this.scene.startTransmission();
        //         break;

        //     case "ArrowRight":
        //         this.scene.increaseDecreaseVel(true);
        //         break;

        //     case "ArrowLeft":
        //         this.scene.increaseDecreaseVel(false);
        //         break;

        //     case "KeyS":
        //         this.openSettingsDialog();
        //         break;
        // }
    }

    // setters

    updateState = state => {
        this.setState(state);
        this.props.setAppState({
            holderState: _.merge(this.state, state)
        });
    }

    setActiveItem = (item, action) => {

    }

    // actions

    openSettingsDialog = () => {
        // let that = this;
        let settingsDialog;
        if (!this.state.settingsDialog) {
            settingsController.processInputs(this.state.settings, this.state.envParams);
            settingsDialog = {
                ...this.state.settings,
                onClose: (_settingsDialog) => {
                    this.setState({
                        // settingsDialog: _settingsDialog,
                        openDialog: false,
                        dialogObj: null
                    });
                    this.scene.setInteractionState(true, true, 'openSettings');
                },
                onChange: (input) => {
                    if (input.reloadDialog) {
                        this.setState({
                            settingsDialog: null
                        })
                    }
                    if (input.key === 'show_ui') {
                        this.setState({
                            showUI: input.value
                        })
                    } else {
                        switch (input.key) {
                            case "settings_mode": {
                                const envParams = this.state.envParams;
                                envParams.device.settingsStateUser = input.value
                                this.setState({
                                    envParams: envParams,
                                })
                                this.scene.updateSettings(input);
                            }
                                break;

                            default:
                                this.scene.updateSettings(input);
                                break;
                        }
                    }
                }

            }
        } else {
            settingsDialog = this.state.settingsDialog;
        }
        this.setState({
            openDialog: true,
            settingsDialog: settingsDialog,
            dialogObj: settingsDialog
        });
        this.scene.setInteractionState(false, false, 'openSettings');
    }

    openHelpDialog = () => {
        const that = this;
        let dialogObj = {
            title: '',
            text: textController.getText('aboutDialog', 'state1'),
            onClose: function (_dialog) {
                that.setState({
                    openDialog: false,
                    dialogObj: null
                });
                that.scene.setInteractionState(true, true, 'openHelpDialog');
            },
            onClick: openAboutDialog
        }

        this.setState({
            openDialog: true,
            dialogObj: dialogObj
        });
        this.scene.setInteractionState(false, false, 'openHelpDialog');

        function openAboutDialog() {
            dialogObj = {
                size: 'lg',
                title: 'About',
                titleClass: 'xxxl',
                text: textController.getText('aboutDialog', 'state2'),
                onClick: function (value) {
                    appUtils.openInNewTab(value);
                },
                onClose: function (_dialog) {
                    that.setState({
                        openDialog: false,
                        dialogObj: null
                    });
                    that.scene.setInteractionState(true, true, 'openHelpDialog');
                }
            }

            that.setState({
                openDialog: true,
                dialogObj: dialogObj
            });
            that.scene.setInteractionState(false, false, 'openHelpDialog');
        }
    }

    openMobileDialog = () => {
        const that = this;
        let dialogObj = {
            title: "Try it on a computer",
            text: `<p className="noShadow">Using <b>Mobile</b> to run 3D environments results in lower resolution and settings.\nUse a <b>Computer browser</b> to enjoy the full graphic experience.</p>`,
            onClose: () => {
                that.setState({
                    openDialog: false,
                    dialogObj: null
                });
                if (!that.state.onActiveBox) {
                    setTimeout(() => {
                        that.scene.setInteractionState(!that.state.onActiveBox, !that.state.onActiveBox, 'openMobileDialog');
                    }, 1000);
                }
            }
        }
        this.scene.setInteractionState(false, false, 'openMobileDialog');
        this.setState({
            mobileDialogShowed: true,
            openDialog: true,
            dialogObj: dialogObj
        });
    }

    makeZoom = type => {
        this.scene.zoomCamera(type);
        this.setState({
            blockZoomIn: type === 'in',
            blockZoomOut: type === 'out'
        })
    }

    // callbacks

    onHoverItem = (item, action) => {
        // console.log(this.state.lastAction);
        // if (this.state.lastAction !== 'click') {
        //     if (item && !this.state.activeItem || item == null && this.state.activeItem) {
        //         console.log('\n-- onHoverItem Holder --');
        //         console.log(item);
        //         this.setState({
        //             activeItem: item,
        //             topLabel: item ? item.userData.name : null,
        //             lastAction: 'hover'
        //         });
        //     }
        // }
    }

    onFileDownloaded = (loadingStates) => {
        let loadingDialogObj = this.state.loadingDialogObj;
        loadingDialogObj.percentText = Math.min(loadingStates.progress, 100);
        this.setState({
            loadingDialogObj: loadingDialogObj
        })
    }

    onZoomCallback = (allowZoomIn, allowZoomOut) => {
        this.setState({
            zoomType: null,
            blockZoomIn: !allowZoomIn,
            blockZoomOut: !allowZoomOut
        })
    }

    // UI

    getUI = () => {
        return (
            <div
                id='ui'
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: appUtils.isMobile ? '75%' : '100%',
                    overflowY: "hidden",
                    padding: appUtils.isMobile ? '3%' : '5%',
                    display: 'flex',
                }}
            >

                <Fade
                    // direction="right"
                    mountOnEnter unmountOnExit
                    in={!this.state.hideUi}
                    timeout={3000}
                >
                    <div style={{
                        alignSelf: !appUtils.isMobile && 'center',
                        paddingLeft: !appUtils.isMobile && 15,
                        paddingRight: 15,
                        overflow: appUtils.isMobile && 'auto'
                    }}>
                        <Grid container direction={'row'}>
                            <Grid item xs={12}>
                                <Grid container direction={appUtils.isMobile ? 'column' : 'row'}>
                                    <Grid item xs={12} style={{ marginBottom: 15 }}>
                                        <h1 style={{ letterSpacing: '1.5vh' }}>DARKNESS IS COMPLETELY DEFINED</h1>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <StretchableText
                                            style={{
                                                flex: 1,
                                                textTransform: 'uppercase',
                                                fontSize: '105%',
                                                // textAlign: 'justify'
                                            }}>
                                            new album by the a/v
                                            artist Or Sarfati
                                            <br />
                                            Close your eyes and step into darkness,
                                            follow the journey
                                            between light and
                                            shadows / space and
                                            constrain / the defined
                                            and the undefined.
                                            <br /><br />
                                            <a onClick={() => this.openHelpDialog()}>S u b s c r i b e</a> for the release of hard copies involving Audio and visual materials
                                            <br /><br />
                                            <a onClick={() => this.openHelpDialog()}>G e t</a> the premiere tickets - 21/04/24 - Delphi theatre - Berlin
                                            <br /><br />
                                            Released Jan. 2024
                                        </StretchableText>
                                        <div style={{ marginTop: 15 }}>
                                            <a target="_blank" rel="noreferrer" href="https://open.spotify.com/album/2V8Dz6VDbHIOmZpc2J2YrM?si=8bHfo8JbRBeMacqcsxehkQ">
                                                <img className="imgStroke" src="public/images/spotifyIcon.png" style={{ width: 35 }} />
                                            </a>
                                            <a target="_blank" rel="noreferrer" href="https://orsarfati.bandcamp.com/album/darkness-is-completely-defined">
                                                <img className="imgStroke" src="public/images/bandcampIcon.png" style={{ width: 35, marginLeft: 15 }} />
                                            </a>
                                            <a target="_blank" rel="noreferrer" href="https://music.apple.com/us/album/darkness-is-completely-defined/1725671367">
                                                <img className="imgStroke" src="public/images/appleIcon.png" style={{ width: 35, marginLeft: 15 }} />
                                            </a>
                                        </div>
                                    </Grid>
                                    <Grid item xs={5} style={{ display: 'flex' }}>
                                        <Grid container justifyContent="flex-end">
                                            <ImageContainer
                                                style={{ width: '100%', marginTop: appUtils.isMobile && 15 }}
                                                urls={[
                                                    [
                                                        "public/images/darkness_screenshot1.png",
                                                        "public/images/darkness_screenshot2.png",
                                                        "public/images/darkness_screenshot3.png"
                                                    ],
                                                    [
                                                        "public/images/darkness_screenshot4.png",
                                                        "public/images/darkness_screenshot5.png",
                                                        "public/images/darkness_screenshot6.png"
                                                    ],
                                                    [
                                                        "public/images/darkness_screenshot7.png",
                                                        "public/images/darkness_screenshot8.png",
                                                        "public/images/darkness_screenshot9.png"
                                                    ],
                                                    [
                                                        "public/images/darkness_screenshot10.png",
                                                        "public/images/darkness_screenshot11.png",
                                                        "public/images/darkness_screenshot12.png"
                                                    ]
                                                ]}
                                            />
                                            {/* <iframe style={{ paddingLeft: 4 }} src="https://bandcamp.com/EmbeddedPlayer/album=1276424360/size=large/bgcol=333333/linkcol=e99708/tracklist=false/artwork=small/transparent=true/" seamless><a href="https://orsarfati.bandcamp.com/album/darkness-is-completely-defined">DARKNESS IS COMPLETELY DEFINED by Or Sarfati</a></iframe> */}
                                            {/* <iframe id="embed-iframe" style={{ minHeight: '50%', opacity: 0.8 }} src="https://open.spotify.com/embed/album/2V8Dz6VDbHIOmZpc2J2YrM?utm_source=generator&theme=0" loading="lazy"></iframe> */}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </div>
                </Fade>
            </div >
        )
    }

    getBottomMenuView = () => {
        return (
            <Zoom
                id='settings'
                ref={ref => (this.settingsView = ref)}
                in={this.state.sceneStared}
                style={{
                    position: 'absolute',
                    bottom: 15,
                    right: 15,
                    zIndex: 999
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {this.state.introDone && this.state.showUI && this.state.hideUi &&
                        <IconButton
                            onClick={() => {
                                this.setState({
                                    // showUI: !this.state.showUI
                                    hideUi: false
                                })
                            }}>
                            <InfoRoundedIcon style={{
                                fontSize: (appUtils.isMobile ? '2rem' : '4rem')
                            }} />
                        </IconButton>
                    }
                    {this.state.introDone && this.state.showUI && !this.state.hideUi &&
                        < IconButton
                            onClick={() => {
                                this.setState({
                                    // showUI: !this.state.showUI
                                    hideUi: true
                                })
                            }}>
                            <CancelRoundedIcon style={{
                                fontSize: (appUtils.isMobile ? '2rem' : '4rem')
                            }} />
                        </IconButton>
                    }

                    <IconButton
                        color={'primary'}
                        disabled={this.state.disableHelp}
                        onClick={this.openHelpDialog}>
                        <HelpIcon style={{ fontSize: appUtils.isMobile ? '2rem' : '4rem' }} />
                    </IconButton>

                    {this.state.components.Audio?.loaded &&
                        <>
                            {
                                (this.state.audioOn || this.state.components.Audio?.disabled) &&
                                <IconButton
                                    disabled={this.state.components.Audio?.disabled}
                                    onClick={() => {
                                        this.setState({
                                            audioOn: false
                                        });
                                        this.scene.setComponentValue('Audio', { property: 'unmute' });
                                    }}>
                                    <VolumeOffRoundedIcon style={{ fontSize: appUtils.isMobile ? '2rem' : '4rem' }} />
                                </IconButton>
                            }
                            {
                                !this.state.audioOn && !this.state.components.Audio?.disabled &&
                                <IconButton
                                    disabled={this.state.components.Audio?.disabled}
                                    onClick={() => {
                                        this.setState({
                                            audioOn: true
                                        });
                                        this.scene.setComponentValue('Audio', { property: 'mute' });
                                    }}>
                                    <VolumeUpRoundedIcon style={{ fontSize: appUtils.isMobile ? '2rem' : '4rem' }} />
                                </IconButton>
                            }
                        </>
                    }

                    <IconButton
                        color={'primary'}
                        disabled={this.state.onActiveBox}
                        onClick={() => {
                            if (!this.state.showUI) {
                                this.scene.setAnimationGroupsState({
                                    intro: false,
                                    intro_done: false,
                                    ui: true
                                });
                                this.setState({
                                    showStartMenu: false
                                })
                            } else {
                                // I want to see the light!
                                location.reload();
                            }
                        }
                        }>
                        {!this.state.introDone &&
                            < SkipNextRoundedIcon style={{
                                fontSize: (appUtils.isMobile ? '2rem' : '4rem')
                            }} />
                        }
                        {this.state.introDone &&
                            <ReplayRoundedIcon style={{
                                fontSize: (appUtils.isMobile ? '2rem' : '4rem')
                            }} />
                        }
                    </IconButton>

                    <IconButton
                        color={'primary'}
                        disabled={this.state.disableSettings}
                        onClick={() => this.openSettingsDialog()}>
                        <SettingsIcon style={{
                            fontSize: (appUtils.isMobile ? '2rem' : '4rem')
                        }} />
                    </IconButton>
                </div>
            </Zoom >
        )
    }

    getStartMenu = () => {
        if (!this.state.startMenuIn) {
            setTimeout(() => {
                this.setState({ startMenuIn: true })
            }, 1000);
        }
        return (
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                <Fade
                    mountOnEnter unmountOnExit
                    in={this.state.startMenuIn}
                    timeout={5000}

                >
                    <div style={{ alignSelf: 'center' }}>
                        <Button onClick={() => {
                            console.log(this.state.components);
                            this.scene.setAnimationGroupsState({
                                intro: true,
                                audioOn: true
                            });
                            this.setState({
                                showStartMenu: false
                            })
                        }}>
                            <h1>S T A R T</h1>
                        </Button>
                    </div>
                </Fade>
            </div>
        )
    }

    getEmbed() {
        setTimeout(() => {
            if (window.IFrameAPI && !this.iframeLoaded && document.getElementById('embed-iframe')) {
                this.iframeLoaded = true;
                const element = document.getElementById('embed-iframe');
                const options = {
                    uri: "https://open.spotify.com/album/2V8Dz6VDbHIOmZpc2J2YrM",
                    theme: 'dark',
                    height: '100%',
                    width: '100%'
                };
                const callback = (embedController) => {
                    console.log(embedController);
                    document.getElementById('embed').style.opacity = appUtils.isMobile ? 1.0 : 0.8;
                    embedController.onPlaybackUpdate = (props) => {
                        if (this.state.components.Audio?.playing) {
                            this.scene.setComponentValue('Audio', { property: 'mute' });
                            this.setState({
                                audioOn: true
                            })
                        }
                    }
                };
                window.IFrameAPI.createController(element, options, callback);
            }
        }, 500);

        return (
            <div
                id="embed"
                className="transitionLong"
                style={{
                    visibility: this.state.hideUi && appUtils.isMobile ? 'hidden' : 'visible',
                    position: 'absolute',
                    bottom: appUtils.isMobile ? 5 : 0,
                    zIndex: 999,
                    opacity: 0,
                    left: appUtils.isMobile ? 15 : null,
                    right: appUtils.isMobile ? null : '6%',
                    width: appUtils.isMobile ? '80%' : '36%',
                    height: appUtils.isMobile ? '25%' : '20%'
                }}>
                <div id="embed-iframe"></div>
            </div>
        )
    }

    //

    render() {
        console.log('** Scene holder render **');
        return (
            <div style={{ width: "100%", height: "100%" }}>

                {/* {this.getUI()} */}
                {/* {this.getEmbed()} */}

                {/* {this.state.sceneStared && this.state.showUI && this.getUI()}
                {this.state.showEmbed && this.getEmbed()}
                {this.state.sceneStared && this.state.showStartMenu && this.state.components?.Audio?.loaded && this.getStartMenu()}
                {this.state.sceneStared && this.state.components.Audio?.loaded && this.state.showMenu && this.getBottomMenuView()}

                <ResponsiveDialog
                    size={this.state.dialogObj && this.state.dialogObj.size ? this.state.dialogObj.size : 'md'}
                    dialogObj={this.state.dialogObj}
                    visible={this.state.openDialog}
                    onClose={() => {
                        this.setState({ openDialog: false, dialogObj: null });
                        this.scene.setInteractionState(true, true, 'ResponsiveDialog');
                    }}
                    closeDialog={() => {
                        this.setState({ openDialog: false, dialogObj: null });
                        this.scene.setInteractionState(true, true, 'ResponsiveDialog');
                    }}
                />

                {
                    this.state.envParams &&
                    this.props.appState &&
                    this.props.appState.introIsDone &&
                    <Scene
                        ref={ref => (this.scene = ref)}
                        data={this.state.data}
                        updateHolderState={this.updateState}
                        setActiveItem={this.setActiveItem}
                        onHoverItem={this.onHoverItem}
                        onFileDownloaded={this.onFileDownloaded}
                        envParams={this.state.envParams}
                        onZoomCallback={this.onZoomCallback}
                        onDebug={this.props.onDebug}
                        loadingManager={this.props.loadingManager}
                    />
                } */}

                <SceneTest
                    ref={ref => (this.scene = ref)}
                    data={this.state.data}
                    updateHolderState={this.updateState}
                    setActiveItem={this.setActiveItem}
                    onHoverItem={this.onHoverItem}
                    onFileDownloaded={this.onFileDownloaded}
                    envParams={this.state.envParams}
                    onZoomCallback={this.onZoomCallback}
                    onDebug={this.props.onDebug}
                    loadingManager={this.props.loadingManager}
                ></SceneTest>

            </div >
        )
    }
}

export default SceneHolder;