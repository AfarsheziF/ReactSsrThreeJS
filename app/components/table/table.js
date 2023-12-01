import React from 'react';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';

import TableControls from './tableControls';
import TableItem from './tableItem';

export default class MyTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: props.data
        }
    }

    componentDidMount() {
        global.filterData = this.filterData;
        if (this.props.data) {
            this.getView(this.props.data);
        }
    }

    static getDerivedStateFromProps(props, state) {
        // console.log(props)
        if (props.data && !state.data) {
            return {
                data: props.data,
                update: true
            }
        }

        else if (props.update && !state.update) {
            return {
                update: true,
                // tableView: null
            }
        }

        else {
            return null
        }
    }

    componentDidUpdate() {
        if (this.state.update) {
            this.getView(this.props.data)
        }
    }

    getView = data => {
        // console.log(data);
        var view = [];
        var currentYear = 3000;

        for (var i = 0; i < data.length; i++) {
            var year = parseInt(new Date(data[i].date).getFullYear());
            // console.log(year, currentYear);
            if (year < currentYear) {
                currentYear = year;
                view.push(
                    <Grid key={i} item xs={12}>
                        <h2
                            style={{
                                backgroundColor: 'white',
                                color: 'black',
                                padding: 3
                            }}>
                            {currentYear}
                        </h2>
                        <TableItem item={data[i]} hoverCallback={this.props.hoverCallback} update={data[i] === this.props.activeItem} />
                    </Grid>
                )
            } else {
                view.push(
                    <Grid key={i} item xs={12}>
                        <TableItem item={data[i]} hoverCallback={this.props.hoverCallback} update={data[i] === this.props.activeItem} />
                    </Grid>
                )
            }
        }

        var tableView = (
            < div style={{ height: '100%' }}>
                {global.isMobile ? null : <TableControls data={this.props.data} callback={this.filterData} />}
                <div style={{
                    overflow: 'auto',
                    height: (global.isMobile ? '70%' : '75%'),
                    padding: 10,
                    marginBottom: 50,
                    marginTop: global.isMobile ? 0 : 10
                }}>
                    {view}
                </div>
            </div >
        )
        this.setState({
            tableView: tableView,
            update: false
        })
        this.props.updateCallback();
    }

    filterData = dataStates => {
        // console.log(dataStates);
        var filteredData = [], onFilter = false;

        for (var i in this.props.data) {
            var match = true;
            for (var key in dataStates) {
                if (dataStates[key] !== "all") {
                    onFilter = true;
                    if (match) {
                        if (key === 'year') {
                            if (new Date(this.props.data[i].date).getFullYear() + '' !== dataStates[key]) {
                                match = false;
                            }
                        }
                        else if (key === 'name') {
                            if (this.props.data[i][key].indexOf(dataStates[key]) < 0) {
                                match = false;
                            }
                        }
                        else if (this.props.data[i][key] !== dataStates[key]) {
                            match = false;
                        }
                    }
                }
            }
            if (match) {
                filteredData.push(this.props.data[i]);
            }
        }

        this.getView(onFilter ? filteredData : this.props.data)
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                {this.state.tableView}
            </div>
        )
    }

}