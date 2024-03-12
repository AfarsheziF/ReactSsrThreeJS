import React, { Component } from 'react';
import parse, { attributesToProps, domToReact } from 'html-react-parser';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import NativeSelect from '@mui/material/NativeSelect';

import CancelIcon from '@mui/icons-material/Cancel';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import InputBase from '@mui/material/InputBase';

import appUtils from '../../utils/appUtils';

const BootstrapInput = styled(InputBase)(({ theme, input }) => ({
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        // backgroundColor: theme.palette.background.paper,
        backgroundColor: input.disabled ? '#ced1da' : '#000',
        // border: '1px solid #ced4da',
        border: 'solid 1px white',
        color: theme.palette.primary.main,
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 4,
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
}));

class MaterialInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            input: props.input
        };
    }

    onChange = (event, newValue) => {
        let input = this.state.input;
        input.value = newValue;
        this.setState({
            input: input
        });
        if (this.props.onChange) {
            this.props.onChange(input);
        }
    }

    render() {
        if (this.state.input.type) {
            return (
                <div>
                    {this.state.input.type === 'button' &&
                        <Button>{this.state.input.bthText}</Button>}
                    {this.state.input.type === 'switch' &&
                        <Switch
                            color="warning"
                            checked={this.state.input.value}
                            onChange={this.onChange}
                            disabled={this.state.input.disabled}>
                        </Switch>}
                    {this.state.input.type === 'slider' &&
                        <Slider
                            disabled={this.state.input.disabled}
                            style={{ marginTop: 10 }}
                            value={this.state.input.value}
                            onChange={this.onChange}
                            valueLabelFormat={(value, index) => {
                                value = value * 100 / this.state.input.max;
                                return Math.round(value);
                            }}
                            aria-labelledby="discrete-slider"
                            valueLabelDisplay="auto"
                            marks
                            min={this.state.input.min}
                            max={this.state.input.max} />
                    }
                    {
                        (this.state.input.type.toLowerCase() === 'dropdown' || this.state.input.type.toLowerCase() === 'select') &&
                        <FormControl variant="standard">
                            <NativeSelect
                                style={{
                                    textAlign: 'center'
                                }}
                                disabled={this.state.input.disabled}
                                value={this.state.input.value}
                                onChange={event => this.onChange(event, event.target.value)}
                                input={<BootstrapInput input={this.state.input} />}>
                                {this.state.input.values.map((prop, i) => {
                                    return (
                                        <option
                                            value={prop.value}
                                            key={i}
                                            style={{ backgroundColor: '#000' }}
                                            disabled={prop.disabled}>
                                            {prop.title}
                                        </option>
                                    )
                                })}
                            </NativeSelect>
                        </FormControl>
                    }
                </div >
            );
        } else {
            return <></>
        }
    }
}

class ResponsiveDialog extends React.Component {

    constructor(props) {
        super(props);
        if (props.dialogObj && !props.dialogObj.id) {
            props.dialogObj.id = appUtils.createId();
        }
        this.state = {
            dialogObj: props.dialogObj,
            visible: props.visible,
            update: false,
            updateDialog: props.dialogObj != null,
            onClosingDialog: false,
            timeout: 1000
        }
    }

    componentDidMount() {
        console.log('ResponsiveDialog mount');
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.updateDialog || nextState.update || nextState.onClosingDialog;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.updateDialog && this.state.visible) {
            this.setState({
                visible: false,
                updateDialog: false
            })
            setTimeout(() => {
                this.setState({
                    visible: true,
                    dialogObj: this.state.newDialogObj || this.state.dialogObj,
                    update: true,
                    updateDialog: false,
                    timeout: 1000
                })
            }, this.state.timeout);
        }
        else if (this.state.update) {
            this.setState({
                update: false
            });
        }
        else if (this.state.onClosingDialog) {
            this.setState({
                onClosingDialog: false,
                dialogObj: null,
                newDialogObj: null
            })
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (!state.update && !state.updateDialog && !state.onClosingDialog) {
            if (props.dialogObj && !state.dialogObj) {
                if (!props.dialogObj.id) {
                    props.dialogObj.id = appUtils.createId();
                }
                return {
                    dialogObj: props.dialogObj,
                    updateDialog: true,
                    visible: props.visible
                }
            }
            else if (
                state.dialogObj &&
                props.dialogObj &&
                state.dialogObj.id === props.dialogObj.id &&
                props.visible !== state.visible) {
                return {
                    visible: props.visible,
                    update: true
                }
            }
            else if (props.dialogObj && props.dialogObj.id !== state.dialogObj.id) {
                if (state.newDialogObj && props.dialogObj.id === state.newDialogObj.id) {
                    return null;
                }
                else {
                    if (!props.dialogObj.id) {
                        props.dialogObj.id = appUtils.createId();
                    }
                    return {
                        newDialogObj: props.dialogObj,
                        updateDialog: true,
                        visible: props.visible,
                        timeout: 0
                    }
                }
            }
            else if (
                !props.dialogObj &&
                props.visible !== state.visible) {
                return {
                    visible: props.visible,
                    update: true
                }
            }
            else {
                return null;
            }
        } else {
            return null;
        }
    }

    onClose = () => {
        if (this.state.dialogObj && this.state.dialogObj.onClose) {
            this.state.dialogObj.onClose(this.state.dialogObj);
        }
        else if (this.props.onClose) {
            this.props.onClose();
        }
        this.setState({
            onClosingDialog: true,
            updateDialog: false
        })
    }

    onChange = (input) => {
        this.state.dialogObj.onChange(input);
        if (input.closeDialogOnChange) {
            this.onClose();
        }
    }

    getIcon = icon => {
        var iconView;
        switch (icon.icon) {
            case "instagram":
                iconView = <InstagramIcon fontSize="large" />;
                break;
            case "facebook":
                iconView = <FacebookIcon fontSize="large" />;
                break;
        }

        return (
            <IconButton onClick={() => { if (icon.url) appUtils.openInNewTab(icon.url) }}>
                {iconView}
            </IconButton>
        );
    }

    render() {
        let visible = this.state.visible;
        let dialogObj = this.state.dialogObj || {};
        let subtitle = dialogObj.subtitle;
        if (appUtils.isMobile) {
            subtitle = dialogObj.subtitle_mobile ? dialogObj.subtitle_mobile : subtitle;
        }
        if (visible) {
            visible = dialogObj.title != null || dialogObj.text != null || dialogObj.inputs != null || dialogObj.icons != null;
        }
        console.log(`$ ResponsiveDialog. Visible: ${visible} $`);
        return (
            <div>
                <Dialog
                    style={this.props.style}
                    maxWidth={this.props.size || 'xl'}
                    open={visible}
                    transitionDuration={{ enter: 500, exit: 500 }}
                    onClose={this.onClose}
                    PaperProps={{
                        style: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}
                    aria-labelledby="responsive-dialog-title">
                    <DialogContent style={{
                        background: 'black',
                        border: 'solid 1px black',
                        borderRadius: 10,
                        padding: 20,
                        overflow: 'hidden'
                    }}>
                        <Grid container alignItems='center'>
                            {dialogObj.title &&
                                <Grid item xs={12} style={{ marginBottom: 10 }}>
                                    <Grid container direction={'row'}>
                                        <Grid item xs={10} >
                                            <h1 className={`white noShadow ${dialogObj.titleClass}`}>{dialogObj.title}</h1>
                                        </Grid>
                                        <Grid item xs={2} style={{ textAlign: 'end' }}>
                                            <IconButton onClick={() => this.props.closeDialog()}>
                                                <CancelIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            }

                            {subtitle &&
                                <Grid item xs={12} style={{ marginBottom: 10 }}>
                                    <h3 className={`white noShadow ${dialogObj.titleClass}`}>{subtitle}</h3>
                                </Grid>
                            }

                            {dialogObj.inputs && dialogObj.inputs.length > 0 &&
                                <Grid item xs={12} style={{ marginBottom: 10 }}>
                                    {dialogObj.inputs.map((prop, key) => {
                                        return !prop.hide && (
                                            <Grid container
                                                // justifyContent="center"
                                                alignItems="center"
                                                spacing={1}
                                                key={key}>
                                                <Grid item xs={6}>
                                                    <h3 className='white noShadow'>{prop.text}</h3>
                                                    {prop.subText && <p style={{ marginTop: 2, fontStyle: 'italic' }} className={"noShadow " + Typography.subtitle2}>{prop.subText}</p>}
                                                </Grid>
                                                <Grid item xs={6}
                                                    style={{ textAlign: 'end' }}>
                                                    <MaterialInput input={prop} onChange={this.onChange} />
                                                </Grid>
                                            </Grid>
                                        )
                                    })}
                                </Grid>
                            }

                            {dialogObj.text &&
                                <Grid item xs={12}>
                                    {parse(dialogObj.text, {
                                        replace: (domNode) => {
                                            if (domNode.attribs && domNode.attribs.onclick) {
                                                const props = attributesToProps(domNode.attribs);
                                                domNode.attribs.onClickValue = domNode.attribs.onclick;
                                                props.onClick = dialogObj.onClick ?
                                                    (() => dialogObj.onClick(domNode.attribs.onClickValue))
                                                    : null;
                                                delete props.onclick;
                                                delete domNode.attribs.onclick;
                                                if (domNode.name === 'img') {
                                                    return domToReact(domNode);
                                                } else {
                                                    const Tag = domNode.name;
                                                    return <Tag style={{ width: 'fit-content' }} {...props}>{domToReact(domNode.children)}</Tag>;
                                                }
                                            }
                                        }
                                    })
                                    }
                                </Grid>
                            }

                            {dialogObj.icons &&
                                <Grid item xs={12} style={{ marginTop: 10 }}>
                                    <Grid container direction="row" justify="center" alignItems="center">
                                        {dialogObj.icons.map((prop, key) => {
                                            return (<Grid item xs={2} key={key} style={{ textAlign: 'center' }}>{this.getIcon(prop)}</Grid>)
                                        })}
                                    </Grid>
                                </Grid>
                            }

                        </Grid>

                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}

// export default styled(ResponsiveDialog);
export default (ResponsiveDialog);