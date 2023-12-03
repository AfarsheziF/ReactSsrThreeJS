import React, { Component, Suspense, lazy } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import CircularProgressWithLabel from './CircularProgressWithLabel';

let visible;

class LoadingDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible
        }
    }

    componentDidMount() {
        console.log('LoadingDialog mount');
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     return nextProps.visible !== this.state.visible;
    // }

    static getDerivedStateFromProps(props, state) {
        if (props.visible !== visible && props.visible !== state.visible) {
            visible = props.visible;
            return { update: true };
        } else {
            return null;
        }
    }

    componentDidUpdate() {
        const that = this;
        if (this.state.update) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    visible = that.props.visible;
                    that.setState({
                        visible: that.props.visible,
                        update: false
                    })
                }, 1000);
            } else {
                clearTimeout(this.timeout);
                if (this.props.visible) {
                    this.setState({
                        visible: that.props.visible,
                        update: false
                    })
                }
                this.timeout = setTimeout(() => {
                    visible = that.props.visible;
                    that.setState({
                        visible: that.props.visible,
                        update: false
                    })
                }, 500);
            }
        }
    }

    render() {
        // console.log(`$ render LoadingDialog. Visible: ${this.state.visible} $`)
        return (
            <React.Fragment>
                <Dialog
                    id="loadingDialog"
                    open={this.state.visible ? true : false}
                    transitionDuration={{ enter: 500, exit: 500 }}
                    maxWidth={'xl'}
                    aria-labelledby="responsive-dialog-title"
                    disableAutoFocus={true}
                    PaperProps={{
                        style: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}
                    className={`loadingDialog ${this.state.visible ? 'in' : 'out'}`}>
                    {this.props.dialogObj &&
                        <DialogContent style={{ padding: 15, textAlign: 'center' }} id="loadingDialogContent">
                            <div style={{ color: 'white', textAlign: 'center' }}>
                                <h3>{this.props.dialogObj.title || 'Loading...'}</h3>
                                {this.props.dialogObj.subtitle &&
                                    <p>{this.props.dialogObj.subtitle}</p>
                                }
                            </div>
                            {this.props.animateProgress &&
                                <div style={{ marginTop: 10 }}>
                                    {this.props.dialogObj.percentText &&
                                        <CircularProgressWithLabel
                                            value={parseFloat(this.props.dialogObj.percentText)}
                                            size={65}
                                        />}
                                    {/* {!this.props.dialogObj.text && <CircularProgress color='secondary' />} */}
                                </div>
                            }
                            {this.props.animate && !this.props.animateProgress &&
                                <div style={{ textAlign: 'center', justifyContent: 'center' }}>
                                    {this.props.dialogObj.text && <p style={{ textAlign: 'center', color: 'white' }}>{this.props.dialogObj.text}</p>}
                                    <CircularProgress color='primary' style={{ marginTop: 10 }} />
                                </div>
                            }
                        </DialogContent>
                    }
                    {!this.props.dialogObj && <></>}
                </Dialog>
            </React.Fragment>
        )
    }

}

// export default styled(LoadingDialog);
export default (LoadingDialog);