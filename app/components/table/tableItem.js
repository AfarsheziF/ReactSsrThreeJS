import React from 'react';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import IconButton from '@mui/material/IconButton';
import moment from 'moment';

import utils from '../../utils/utils';

export default class TableItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            item: props.item,
            backgroundColor: global.isMobile ? ("rgb" + props.item.color.replace(')', ' ,0.3') + ")") : "(0,0,0,0)"
        }
    }

    static getDerivedStateFromProps(props, state) {
        // console.log(props.update)
        if ((props.item && !state.item) ||
            (props.item && props.item !== state.item)) {
            return {
                item: props.item
            }
        }

        else {
            return null
        }
    }

    onEnter = (e) => {
        // console.log(e);
        this.setState({
            backgroundColor: "rgb" + this.state.item.color,
            active: true
        });
        if (this.props.hoverCallback) {
            this.props.hoverCallback(true, this.state.item);
        }
    }

    onLeave = (e) => {
        // console.log(e);
        const that = this;
        if (this.props.hoverCallback) {
            this.props.hoverCallback(false, this.state.item);
        }
        setTimeout(() => {
            if (that.state.item !== global.activeItem) {
                that.setState({
                    backgroundColor: global.isMobile ? ("rgb" + this.props.item.color.replace(')', ' ,0.3') + ")") : "rgb(0,0,0,0)",
                    active: false
                });
            }
        }, 500);

    }

    onItemClick = link => {
        if (global.isMobile) {
            this.onEnter();
        } else {
            utils.openInNewTab(link);
        }
    }

    getMobileView = () => {
        console.log(this.state.backgroundColor);
        return (
            <Grid container spacing={0}
                direction={"row"}
                className="tableItem"
                style={{
                    background: this.state.backgroundColor,
                    padding: 2,
                    marginTop: 5
                }}
                onMouseEnter={event => this.onEnter(event)}
                onMouseLeave={event => this.onLeave(event)}
                onClick={() => this.onItemClick(this.state.item.link)}>
                <Grid item xs={10}>
                    <Grid container spacing={0}
                        direction={"column"}>                    <Grid item xs={12}>
                            <p className="m-0" style={{ fontSize: 'smaller' }}>{moment(this.state.item.date).format('MMM d')}</p>
                        </Grid>
                        <Grid item xs={12}>
                            <h2 className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.name}</h2>
                        </Grid>
                        <Grid item xs={12}>
                            <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.section}</p>
                        </Grid>
                        <Grid item xs={12}>
                            <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.venue}</p>
                        </Grid>
                        <Grid item xs={12}>
                            <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.contribution}</p>
                        </Grid>
                        <Grid item xs={12}>
                            <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.type}</p>
                        </Grid>
                    </Grid>

                </Grid>
                <Grid item xs={2}>
                    {this.state.active &&
                        <IconButton onClick={() => utils.openInNewTab(this.state.item.link)}
                            style={{ marginTop: 15 }}>
                            <OpenInNewIcon />
                        </IconButton>
                    }
                </Grid>
            </Grid>
        )
    }

    getDesktopView = () => {
        return (
            <Grid container spacing={0}
                direction={'row'}
                className="tableItem"
                style={{ background: this.state.backgroundColor, padding: 2 }}
                onMouseEnter={event => this.onEnter(event)}
                onMouseLeave={event => this.onLeave(event)}
                onClick={() => this.onItemClick(this.state.item.link)}>
                <Grid item xs={1}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{moment(this.state.item.date).format('MMM d')}</p>
                </Grid>
                <Grid item xs={1}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.section}</p>
                </Grid>
                <Grid item xs={3}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.name}</p>
                </Grid>
                <Grid item xs={3}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.venue}</p>
                </Grid>
                <Grid item xs={2}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.contribution}</p>
                </Grid>
                <Grid item xs={2}>
                    <p className="m-0" style={{ fontSize: 'smaller' }}>{this.state.item.type}</p>
                </Grid>
            </Grid>
        )
    }

    getView = () => {
        return global.isMobile ? this.getMobileView() : this.getDesktopView();
    }

    render() {
        return this.getView()
    }

}