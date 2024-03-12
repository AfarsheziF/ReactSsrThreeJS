import React, { useState, useEffect } from 'react';

import './style.css';
// import SvgAnimation from '../animations/SvgAnimation';
import SphereLoader from '../animations/SphereLoader/SphereLoader';

const IntroDialog = ({ animationData, visible, opacity, loadingManager }) => {
    const [itemsLoaded, setItemsLoaded] = useState();
    const [itemsTotal, setItemsTotal] = useState();

    loadingManager.onProgress(({ url, itemsLoaded, itemsTotal }) => {
        setItemsLoaded(itemsLoaded);
        setItemsTotal(itemsTotal);
    })

    return (
        <div
            className='introDialog'
            style={{
                position: 'absolute',
                top: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: visible ? 1 : 0
            }}>
            <div className='introDialog' style={{ opacity: visible ? (opacity || 1) : 0 }}></div>
            {/* <SvgAnimation data={animationData} url="public/images/svg/loading32.svg" /> */}
            <SphereLoader />
            <h1 style={{ marginTop: 15 }}>
                L O A D I N G
            </h1>
            {itemsLoaded && itemsTotal &&
                <p>{Math.round(itemsLoaded * 100 / itemsTotal)}%</p>
            }
        </div>
    )
}

export default IntroDialog;