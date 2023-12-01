import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import utils from '../../utils/utils';

const styles = {
    option: {
        backgroundColor: 'black',
        fontSize: 'small',
        fontFamily: 'monospace'
    },
    category: {
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'monospace',
        textTransform: 'uppercase'
    }
}

export default class MySelect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: props.data,
            value: props.value || ""
        }
    }

    static getDerivedStateFromProps(props, state) {
        // console.log(props.value, state.value);
        if (props.value && props.value !== state.value) {
            return {
                value: props.value
            }
        } else {
            return null;
        }
    }

    handleChange = (e) => {
        this.setState({
            value: e.target.value
        })
        if (this.props.callback) {
            this.props.callback(this.props.name, e.target.value);
        }
    }

    getInputs = () => {
        var inputs = [<option style={{ backgroundColor: 'black', fontSize: 'small' }} value="all" key={1000}>All</option>];
        if (this.props.data.categories) {
            var counter = 1;
            for (var key in this.props.data.categories) {
                counter++;
                inputs.push(
                    <optgroup
                        style={styles.category}
                        label={utils.capitalizeFirstLetter(key)}
                        key={key} />
                )
                var sorted = this.props.data.categories[key].sort();
                for (var i in sorted) {
                    inputs.push(
                        <option
                            style={styles.option}
                            value={sorted[i]}
                            key={counter + i}>
                            {sorted[i]}
                        </option>
                    )
                }
            }
        } else {
            for (var i in this.props.data) {
                inputs.push(<option value={this.props.data[i]} key={i} style={styles.option}>{this.props.data[i]}</option>)
            }
        }

        return inputs;
    }

    render() {
        return (
            <div style={{ width: '100%' }}>
                <FormControl variant="outlined" style={{ width: '100%' }}>
                    <InputLabel id="demo-simple-select-outlined-label">{utils.capitalizeFirstLetter(this.props.name)}</InputLabel>
                    <Select
                        native
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        value={this.state.value}
                        disabled={this.props.disabled}
                        onChange={this.handleChange}
                        label={utils.capitalizeFirstLetter(this.props.name)}>
                        {this.getInputs()}
                    </Select>
                </FormControl>
            </div >
        );
    }
}