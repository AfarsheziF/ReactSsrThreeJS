import React from 'react';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';

export default class DoubleMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mainItems: ['program', 'contact', 'newsletter'],
            programItems: ['artists', 'events'],
            activeMenu: 'main'
        };
    }

    onMenuClick(prop) {
        this.setState({
            activeMenu: prop === 'program' ? 'program' : 'main'
        })
        if (this.props.callback) {
            this.props.callback(prop);
        }
    }

    resetMenu() {
        this.setState({
            activeMenu: 'main'
        })
        // if (this.props.callback) {
        //     this.props.callback('reset');
        // }
    }

    render() {
        return (
            <Grid container spacing={2} direction="row">
                <Grid item xs={6}>
                    {
                        this.state.mainItems.map((prop, key) => {
                            return (
                                <Slide
                                    key={key}
                                    direction="right"
                                    mountOnEnter unmountOnExit
                                    in={this.state.activeMenu === 'main'}
                                    timeout={1000}>
                                    <h1 className="m-0 pointer capitalize menuItem" onClick={() => this.onMenuClick(prop)}>{prop}</h1>
                                </Slide>
                            )
                        })
                    }

                    {
                        this.state.programItems.map((prop, key) => {
                            return (
                                <Slide
                                    key={key}
                                    direction="right"
                                    mountOnEnter unmountOnExit
                                    in={this.state.activeMenu === 'program'}
                                    timeout={1000}>
                                    <h1 key={key} className="m-0 pointer capitalize menuItem" onClick={() => this.onMenuClick(prop)}>{prop}</h1>
                                </Slide>
                            )
                        })
                    }

                </Grid>
            </Grid>
        )
    }
}