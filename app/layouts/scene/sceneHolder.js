import React from "react";

import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
import IconButton from '@mui/material/IconButton'

// import LaunchIcon from '@mui/icons-material/Launch';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import ResponsiveDialog from '../../components/dialogs/responsiveDialog';
import LoadingDialog from '../../components/dialogs/loadingDialog';
import ListMenu from "../../components/menus/listMenu";

import utils from '../../utils/utils';

import Scene from './scene';
import dataController from "../../store/dataController";
import textController from "../../store/textController";
import settingsController from "../../store/settingsController";

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
            loadingDialogObj: {
                title: "Earth Signal Universe Wide",
                subtitle: "Building Simulation...",
                percentText: 0
            },
            sceneSettings: {},
            showPlanets: false,
            hideUiList: utils.isMobile,
            showUI: true
        }
    }

    componentDidMount() {
        console.log("-- Scene Holder mount --");
        window.addEventListener('mousemove', this.onMouseMove, false);
        window.addEventListener('pointerdown', this.onPointerDown, false);
        window.addEventListener('pointerup', this.onPointerUp, false);
        window.addEventListener('resize', this.onWindowResize, false);
        window.addEventListener('wheel', this.onMouseWheel, false);

        // window.addEventListener("touchstart", this.onTouchStart, false);
        // window.addEventListener("touchend", this.onTouchEnd, false);
        // window.addEventListener("touchcancel", this.onTouchCancel, false);
        window.addEventListener("touchmove", this.onMouseMove, false);

        window.addEventListener("keydown", this.onKeyPress, false);

        this.getData();
    }

    componentDidUpdate() {
        // console.log('-- Scene Holder update --');
    }

    getData = () => {
        const that = this;
        dataController.makeRequest('get', '/data').then(
            data => {
                console.log(data);
                for (let key in data.texts) {
                    textController.addSection(key, data.texts[key]);
                }
                that.setState({
                    onCameraRotation: data.envParams.camera.enableCameraRotation,
                    sceneSettings: settingsController.processInputs(data.settings),
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

    onMouseMove = e => {
        if (this.scene && this.scene.onMouseMove) {
            this.scene.onMouseMove(e);
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
    }

    setActiveItem = (item, action) => {

    }

    // actions

    openSettingsDialog = () => {
        let that = this;
        let settingsDialog;
        if (!this.state.settingsDialog) {
            settingsDialog = {
                ...this.state.settings,
                onClose: function (_settingsDialog) {
                    that.setState({
                        settingsDialog: _settingsDialog,
                        openDialog: false,
                        dialogObj: null
                    });
                    that.scene.setInteractionState(true, true, 'openSettings');
                },
                onChange: function (input) {
                    if (input.name === 'showUI') {
                        that.setState({
                            showUI: input.value
                        })
                    } else {
                        that.scene.updateSettings(input.name, input.value);
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
            text:
                `
                ${textController.getText('aboutDialog', 'state1')}
                <br />
                <div onClick="0">
                   <h3 class="aStyle noShadow">Tell me more about the project</h3>
                </div>
            `
            ,
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
                    utils.openInNewTab(value);
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

    //

    getUI() {
        const that = this;
        return (
            <div>
                <div style={{ position: 'absolute', top: 5, width: '100%' }}>
                    <h1 style={{ textAlign: 'center' }}>{this.state.topLabel}</h1>
                </div>

                <div
                    id='ui'
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        padding: 15,
                        width: 250,
                        height: utils.isMobile ? 'auto' : '100%',
                        overflowY: "auto"
                    }}>

                    {utils.isMobile &&
                        <IconButton
                            color={'primary'}
                            onClick={() =>
                                this.setState({
                                    hideUiList: !this.state.hideUiList
                                })}>
                            {this.state.hideUiList &&
                                <MenuIcon style={{
                                    fontSize: (utils.isMobile ? '2rem' : '4rem')
                                }} />
                            }
                            {!this.state.hideUiList &&
                                <CloseIcon style={{
                                    fontSize: (utils.isMobile ? '2rem' : '4rem')
                                }} />
                            }
                        </IconButton>
                    }

                    <ListMenu
                        hide={this.state.hideUiList}
                        updateItems={false}
                        items={[
                            {
                                text: 'Run Simulation',
                                iconUrl: '/images/svgs/run-simulation.svg',
                                style: { backgroundColor: '#5050507F', color: '#fff' },
                                className: 'esuwBtn',
                                onClick: () => {
                                    this.setState({
                                        onTransmission: true
                                    })
                                    this.scene.startTransmission();
                                }
                            },
                            {
                                text: 'Increase Speed',
                                iconUrl: '/images/svgs/increase-speed.svg',
                                style: { backgroundColor: '#5050507F', color: '#fff' },
                                className: 'esuwBtn',
                                onClick: () => {
                                    this.scene.increaseDecreaseVel(true);
                                }
                            },
                            {
                                text: 'Decrease Speed',
                                iconUrl: '/images/svgs/decrease-speed.svg',
                                style: { backgroundColor: '#5050507F', color: '#fff' },
                                className: 'esuwBtn',
                                onClick: () => {
                                    this.scene.increaseDecreaseVel(false);
                                }
                            },
                            {
                                text: 'Revert to Start',
                                iconUrl: '/images/svgs/revert-to-start.svg',
                                style: { backgroundColor: '#5050507F', color: '#fff' },
                                className: 'esuwBtn',
                                onClick: () => {
                                    if (this.state.onTransmission) {
                                        this.scene.startTransmission()
                                    }
                                }
                            },
                            {
                                text: 'Planets',
                                iconUrl: '/images/svgs/move-to-planet.svg',
                                style: { backgroundColor: '#5050507F', color: '#fff' },
                                className: 'esuwBtn',
                                onClick: () => {
                                    this.setState({
                                        showPlanets: !this.state.showPlanets
                                    })
                                }
                            }
                        ]}
                    />

                    {/* {this.state.sceneTime > 0 && <p>Scene Time: {new Date(this.state.sceneTime * 1000).toISOString().substring(14, 19)}</p>} */}

                    <Slide
                        direction="right"
                        mountOnEnter unmountOnExit
                        timeout={1000}
                        // in={this.state.animationTime > 0}
                        in={this.state.onTransmission}
                        style={{
                            marginTop: 10,
                            paddingLeft: 3
                        }}>
                        <p id={"#transmissionTimeText"}>Transmission time: {new Date(this.state.animationTime * 1000).toISOString().substring(14, 19)}</p>
                    </Slide>

                    {/* <p>Slider value: {this.state.sliderValue > 0 ? new Date((this.state.onSliderDown ? this.state.sliderValue : this.state.animationTime) * 1000).toISOString().substring(14, 19) : `00:00`}</p> */}
                    {/* <Slider
                        className="slider-no-track"
                        defaultValue={1}
                        aria-label="timeSlider"
                        value={this.state.onSliderDown ? this.state.sliderValue : this.state.animationTime}
                        max={780}
                        min={0}
                        disabled={!this.state.onTransmission}
                        onPointerDown={() => {
                            this.setState({
                                onSliderDown: true
                            })
                        }}
                        onPointerUp={() => {
                            this.setState({
                                onSliderDown: false
                            });
                            this.scene.setTransmissionTime(this.state.sliderValue);
                        }}
                        onChange={(e) => {
                            this.setState({
                                sliderValue: e.target.value
                            })
                        }}
                    /> */}

                    <div style={{ marginTop: 15 }} className="transitionAll">
                        {this.state.planetsCollisions && this.state.showPlanets && !this.state.hideUiList &&
                            <ListMenu
                                updateItems={false}
                                items={getPlanetsArray()}
                            />

                            //     Object.keys(this.state.planetsCollisions).map((prop, i) => {
                            //         return (
                            // <p
                            //     key={i}
                            //     className={'planet_title pointer'}
                            //     id={prop.toLowerCase()}
                            //     onClick={() => {
                            //         this.scene.setActiveItem(prop.toLowerCase())
                            //     }}>
                            //     {this.state.planetsCollisions[prop].name} {this.state.planetsCollisions[prop].collided ? 'collided' : ''}
                            // </p>
                            // )
                            //     })
                        }
                    </div>

                    <div style={{ marginTop: 15 }}>
                        <p id='debugText' />
                    </div>
                </div>
            </div >
        )

        function getPlanetsArray() {
            let a = [], index = 0;
            for (let key in that.state.planetsCollisions) {
                a.push({
                    id: that.state.planetsCollisions[key].name.toLowerCase() + '_title',
                    text: that.state.planetsCollisions[key].name,
                    iconUrl: `/images/svgs/planet-${that.state.planetsCollisions[key].name.toLowerCase()}.svg`,
                    style: { backgroundColor: '#5050507F', color: '#fff' },
                    className: 'esuwBtn',
                    timeout: utils.randomInteger(1000, index * 500),
                    onClick: () => {
                        that.scene.setActiveItem(that.state.planetsCollisions[key].name.toLowerCase())
                    }
                })
                index++;
            }
            return a;
        }
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
                }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {utils.isMobile &&
                        <IconButton
                            color={'primary'}
                            // disabled={this.state.blockZoomIn}
                            onClick={() => this.makeZoom('in')}>
                            <AddIcon style={{
                                fontSize: (utils.isMobile ? '2rem' : '4rem')
                            }} />
                        </IconButton>
                    }
                    {utils.isMobile &&
                        <IconButton
                            color={'primary'}
                            // disabled={this.state.blockZoomOut}
                            onClick={() => this.makeZoom('out')}>
                            <RemoveIcon style={{
                                fontSize: (utils.isMobile ? '2rem' : '4rem')
                            }} />
                        </IconButton>
                    }

                    <IconButton
                        color={'primary'}
                        disabled={this.state.disableHelp}
                        onClick={this.openHelpDialog}>
                        <HelpIcon style={{ fontSize: utils.isMobile ? '2rem' : '4rem' }} />
                    </IconButton>

                    <IconButton
                        color={'primary'}
                        disabled={this.state.onActiveBox}
                        onClick={() => {
                            this.setState({ onCameraRotation: !this.state.onCameraRotation })
                            this.scene.setCameraRotation(!this.state.onCameraRotation)
                        }
                        }>
                        {this.state.onCameraRotation &&
                            <PauseCircleFilledIcon style={{
                                fontSize: (utils.isMobile ? '2rem' : '4rem')
                            }} />
                        }
                        {!this.state.onCameraRotation &&
                            <PlayCircleFilledIcon style={{
                                fontSize: (utils.isMobile ? '2rem' : '4rem')
                            }} />
                        }
                    </IconButton>

                    <IconButton
                        color={'primary'}
                        disabled={this.state.disableSettings}
                        onClick={() => this.openSettingsDialog()}>
                        <SettingsIcon style={{
                            fontSize: (utils.isMobile ? '2rem' : '4rem')
                        }} />
                    </IconButton>
                </div>
            </Zoom>
        )
    }

    render() {
        console.log('\n** Scene holder render **');
        return (
            <div style={{ width: "100%", height: "100%" }}>

                {this.state.sceneStared && this.state.showUI && this.getBottomMenuView()}
                {/* {this.state.sceneStared && this.state.showUI && this.getUI()} */}

                <ResponsiveDialog
                    dialogObj={this.state.dialogObj}
                    onClose={() => {
                        this.setState({ openDialog: false, dialogObj: null });
                        this.scene.setInteractionState(true, true, 'ResponsiveDialog');
                    }}
                    visible={this.state.openDialog}
                    size={this.state.dialogObj && this.state.dialogObj.size ? this.state.dialogObj.size : 'md'}
                />

                {/* <LoadingDialog
                    visible={!this.state.sceneStared || this.state.showLoadingDialog}
                    animateProgress={true}
                    dialogObj={this.state.loadingDialogObj}
                /> */}

                {this.state.envParams &&
                    <Scene
                        ref={ref => (this.scene = ref)}
                        data={this.state.data}
                        settings={this.state.sceneSettings}
                        updateHolderState={this.updateState}
                        setActiveItem={this.setActiveItem}
                        onHoverItem={this.onHoverItem}
                        onFileDownloaded={this.onFileDownloaded}
                        onDebug={this.props.onDebug}
                        envParams={this.state.envParams}
                        onZoomCallback={this.onZoomCallback}
                    />
                }

            </div >
        )
    }
}

export default SceneHolder;