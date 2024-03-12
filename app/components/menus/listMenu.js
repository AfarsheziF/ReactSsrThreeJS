import React from 'react';
import { Grid, Slide, Button, Icon } from '@mui/material';

import appUtils from '../../utils/appUtils';

// import Svg from '../../../images/svgs/run-simulation.svg'
import SvgIcon from '../icons/svgIcon';

export default class ListMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: props.items ? formatItems(props.items) : [],
            activeItem: ''
        };
    }

    componentDidMount() {
        console.log('ListMenu mounted');
    }

    static getDerivedStateFromProps(props, state) {
        if (props.update || props.updateItems) {
            if (props.updateItems && props.items && props.items !== state.items) {
                console.log('ListMenu getDerivedStateFromProps update');
                return {
                    items: formatItems(props.items),
                    activeMenu: 'main',
                    activeItem: props.activeItem
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    componentDidUpdate() {
        // if (!global.mobilecheck() && this.state.activeItem) {
        //     var element = document.getElementById("#" + this.state.activeItem.name);
        //     if (element) {
        //         element.scrollIntoView({ block: 'start', behavior: 'smooth' });
        //     }
        // }
    }

    onItemClick(prop) {
        prop.onClick && prop.onClick(prop);
        this.setState({
            activeItem: prop
        })
    }

    //

    getSvgButton = (prop, key) => {
        return (
            <SvgIcon
                src={prop.iconUrl}
                width="24"
                height="24"
                fill={prop.style ? prop.style.color : null}
                index={key}
                style={{
                    marginRight: 3
                }} />
        );
    }

    render() {
        console.log('ListMenu render');
        return (
            <Grid container spacing={0} direction="column">
                {
                    this.state.items.map((prop, key) => {
                        return (
                            <Grid
                                item
                                xs={12}
                                key={key}
                                style={{
                                    flex: 1
                                }}>
                                <Slide
                                    direction="right"
                                    mountOnEnter unmountOnExit
                                    in={!this.props.hide}
                                    timeout={prop.timeout || 1000}
                                    style={{
                                        marginBottom: 3
                                    }}
                                >
                                    <div>
                                        <Button
                                            variant="contained"
                                            className={prop.className}
                                            id={"#" + prop.id}
                                            style={{
                                                flex: 1,
                                                width: '100%',
                                                justifyContent: 'flex-start',
                                                transition: 'background-color 500ms ease',
                                                ...prop.style
                                            }}
                                            onClick={() => this.onItemClick(prop)}
                                            startIcon={prop.iconUrl && this.getSvgButton(prop, key)}
                                        >
                                            {prop.text}
                                        </Button>
                                    </div>
                                </Slide>
                            </Grid>
                        )
                    })
                }
            </Grid >
        )
    }
}

const formatItems = items => {
    let a = [];
    items.forEach(item => {
        a.push({
            id: appUtils.createId(item.text || item),
            ...item
        })
    });
    return a;
}