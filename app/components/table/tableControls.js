import React from 'react';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import MySelect from '../inputs/select';

export default class TableControls extends React.Component {

    constructor(props) {
        super(props);
        // console.log(props);
        this.state = {
            data: props.data,
            dataStates: props.dataStates ||
            {
                year: "all",
                name: "all",
                type: "all",
                venue: "all",
                contribution: "all",
                section: "all"
            },
            orgDataStates:
            {
                year: "all",
                name: "all",
                type: "all",
                venue: "all",
                contribution: "all",
                section: "all"

            }
        }
    }

    componentDidMount() {

    }

    // static getDerivedStateFromProps(props, state) {
    //     if (props.data) {
    //         if (props.data !== state.data) {
    //             return {
    //                 data: props.data
    //             }
    //         } else {
    //             return null;
    //         }
    //     } else {
    //         return null;
    //     }
    // }

    getView = data => {
        // console.log("Controls get view", this.state.dataStates);
        var stateData = {
            year: [],
            section: [],
            ["name / Project"]: {
                categories: {
                    projects: [],
                    name: []
                }
            },
            venue: [],
            contribution: [],
            type: [],
        };
        for (var i in data) {
            if (stateData.year.indexOf(new Date(data[i].date).getFullYear()) < 0) {
                stateData.year.push(new Date(data[i].date).getFullYear());
            }

            var name = data[i].name;
            if (name && name.includes("[") > 0) {
                name = name.substring(name.indexOf("[") + 1, name.indexOf("]"));
                if (stateData["name / Project"].categories.projects.indexOf(name) < 0) {
                    stateData["name / Project"].categories.projects.push(name);
                }
            }
            if (stateData["name / Project"].categories.name.indexOf(data[i].name) < 0) {
                stateData["name / Project"].categories.name.push(data[i].name);
            }

            if (data[i].type &&
                stateData.type.indexOf(data[i].type) < 0) {
                stateData.type.push(data[i].type);
            }
            if (data[i].venue &&
                stateData.venue.indexOf(data[i].venue) < 0) {
                stateData.venue.push(data[i].venue);
            }
            if (data[i].contribution &&
                stateData.contribution.indexOf(data[i].contribution) < 0) {
                stateData.contribution.push(data[i].contribution);
            }
            if (data[i].section &&
                stateData.section.indexOf(data[i].section) < 0) {
                stateData.section.push(data[i].section);
            }
        }

        var view = [];
        for (var key in stateData) {
            view.push(
                <Grid item xs={global.isMobile ? 12 : (this.props.vertical ? 12 : 2)} key={key} style={{ padding: 5 }}>
                    <MySelect
                        data={stateData[key]}
                        name={key}
                        value={this.state.dataStates[key]}
                        callback={this.onSelect}
                        disabled={this.props.disabled} />
                </Grid>
            )
        }

        return (
            <Grid container
                spacing={2}
                direction={'row'}
                justify="center"
                alignItems="center"
                style={{ marginTop: 2 }}>
                {view}
                {this.props.onFilter &&
                    <Grid item xs={6}
                        style={{ textAlign: 'center' }}>
                        <IconButton
                            disabled={this.props.disabled}
                            onClick={this.onClear}>
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                }
                <Grid item xs={this.props.onFilter ? 6 : 12}
                    style={{ textAlign: 'center' }}>
                    <IconButton
                        disabled={this.props.disabled || !this.state.valueSelected}
                        onClick={this.onSearch}>
                        <SearchIcon />
                    </IconButton>
                </Grid>
            </Grid>
        );
    }

    onSelect = (attr, value) => {
        var dataStates = this.state.dataStates;
        dataStates[attr] = value;

        var valueSelected = false;
        for (var key in dataStates) {
            if (dataStates[key] !== "all") {
                valueSelected = true;
                break;
            }
        }

        this.setState({
            dataStates: dataStates,
            valueSelected: valueSelected
        })
    }

    onSearch = () => {
        // search fucntion
        var filteredData = [], onFilter = false;
        for (var i in this.state.data) {
            var match = true;
            for (var key in this.state.dataStates) {
                if (this.state.dataStates[key] !== "all") {
                    onFilter = true;
                    if (match) {
                        if (key === 'year') {
                            if (new Date(this.state.data[i].date).getFullYear() + '' !== this.state.dataStates[key]) {
                                match = false;
                            }
                        }
                        else if (key === 'name / Project') {
                            if (this.state.data[i].name.indexOf(this.state.dataStates[key]) < 0) {
                                match = false;
                            }
                        }
                        else if (this.state.data[i][key] !== this.state.dataStates[key]) {
                            match = false;
                        }
                    }
                }
            }
            if (match) {
                filteredData.push(this.state.data[i]);
            }
        }
        this.setState({
            onFilter: onFilter
        })
        if (this.props.callback) {
            this.props.callback(filteredData, this.state.dataStates, onFilter);
        }
    }

    onClear = () => {
        this.setState({
            dataStates: this.state.orgDataStates
        })
        if (this.props.callback) {
            this.props.callback(this.state.data, this.state.orgDataStates);
        }
    }

    render() {
        return (
            <div>
                {this.state.data && this.getView(this.state.data)}
            </div>
        );
    }
}