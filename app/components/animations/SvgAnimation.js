import React, { useEffect, useState } from 'react';
import SVG from 'react-inlinesvg';

import AnimData from './data/AnimData';
import './style.css';

const SvgAnimation = ({ data, url }) => {
    const [svg, setSvg] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isErrored, setIsErrored] = useState(false);

    // if (url) {
    //     useEffect(() => {
    //         fetch(url)
    //             .then(res => res.text())
    //             .then(res => {
    //                 // console.log(res);
    //                 setSvg(res)
    //             })
    //             .catch(setIsErrored)
    //             .then(() => setIsLoaded(true))
    //     }, [url]);
    // }

    return (
        <div>
            <SVG src={url} className='pathAnimate' />
        </div>
    )
}

export default SvgAnimation;