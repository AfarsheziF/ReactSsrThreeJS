import React, { useState, useEffect, createElement } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const innerFunction = (element, props) => {
    const tagName = element.tagName;
    let key = props ? props.index : Math.random(500000);
    let _props = props || {};

    for (let i = 0; i < element.attributes.length; i++) {
        _props[element.attributes[i].nodeName] = element.attributes[i].nodeValue;
    }

    let children = Array.from(element.children).map(item => innerFunction(item));

    _props.key = key;
    return createElement(tagName, _props, children);
};

const convertDocEleToReact = (element, props) => {
    try {
        return innerFunction(element, props);
    }
    catch (e) {
        console.log(e);
        return new Error('Error loading svg image');
        // return createElement("span", {}, "Error loading svg image");
    }
};

const SvgIcon = ({ ...props }) => {
    const [Svg, setSvg] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true)
        fetch(props.src)
            .then(res => res.text())
            .then(res => {
                const domParser = new DOMParser();
                const ele = domParser.parseFromString(res, "image/svg+xml");
                let svg = convertDocEleToReact(ele.documentElement, props);
                if (svg.type === 'svg') {
                    setSvg(svg);
                    setLoading(false);
                }
            })
            .catch(e => console.log(e));
    }, []);

    console.log('SvgIcon render');
    return loading ? <CircularProgress size={10} color='primary' /> : Svg;
}

export default SvgIcon;