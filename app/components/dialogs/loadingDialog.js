import React from 'react';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import CircularProgressWithLabel from './CircularProgressWithLabel';

class LoadingDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible
        }
        // this.visible = props.visible;
    }

    // static getDerivedStateFromProps = (props, state) => {
    //     // console.log("getDerivedStateFromProps", props);
    //     if (props.visible !== state.visible) {
    //         return { update: true, ...props };
    //     } else {
    //         return null;
    //     }
    // }

    componentDidUpdate() {
        // console.log("componentDidUpdate", this.props);

        // if (this.state.update) {
        //     if (!this.timeout) {
        //         this.timeout = setTimeout(() => {
        //             this.visible = this.props.visible;
        //             this.setState({
        //                 visible: this.props.visible,
        //                 update: false
        //             })
        //         }, 1000);
        //     } else {
        //         clearTimeout(this.timeout);
        //         if (this.props.visible) {
        //             this.setState({
        //                 visible: this.props.visible,
        //                 update: false
        //             })
        //         }
        //         this.timeout = setTimeout(() => {
        //             this.visible = this.props.visible;
        //             this.setState({
        //                 visible: this.props.visible,
        //                 update: false
        //             })
        //         }, 500);
        //     }
        // }
    }

    render() {
        // console.log(`** LoadingDialog: Render. Visible: ${this.state.visible} **`)
        return (
            <Dialog
                id="loadingDialog"
                open={this.props.visible}
                transitionDuration={this.props.transitionDuration || { enter: 500, exit: 500 }}
                maxWidth={'xl'}
                aria-labelledby="responsive-dialog-title"
                disableAutoFocus={true}
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: this.props.backgroundColor || 'inherit',
                        },
                    },
                }}
                className={`loadingDialog ${this.state.visible ? 'in' : 'out'}`}>
                {this.props.dialogObj &&
                    <DialogContent style={{ padding: 15, textAlign: 'center' }} id="loadingDialogContent">

                        {/* <SvgAnimation data={this.props.animationData} /> */}

                        {!this.props.dialogObj.hideTitle &&
                            <div style={{ color: 'white', textAlign: 'center' }}>
                                <Typography variant="h3" gutterBottom style={{ textTransform: 'uppercase' }}>
                                    {this.props.dialogObj.title || 'Loading...'}
                                </Typography>
                                {this.props.dialogObj.subtitle &&
                                    <p>{this.props.dialogObj.subtitle}</p>
                                }
                            </div>
                        }
                        {this.props.animateProgress &&
                            <div style={{ marginTop: 10 }}>
                                {this.props.dialogObj.percentText &&
                                    <CircularProgressWithLabel
                                        value={parseFloat(this.props.dialogObj.percentText)}
                                        size={65}
                                    />}
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
        )
    }

}

// export default styled(LoadingDialog);
export default LoadingDialog;