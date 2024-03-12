import React, { useEffect, useState } from "react";
import { Grid } from '@mui/material';

import './style.css';

const duration = 1.0;

const ImageContainer = ({ urls, style }) => {
    // const [currentUrl, setUrl] = useState(url || urls[0]);
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState();

    const timer = () => {
        setVisible('hide');
        setTimeout(() => {
            if (index + 1 === urls[0].length) {
                setIndex(0);
            } else {
                setIndex(index + 1);
            }
            setVisible('show');
        }, 4000);
    };

    useEffect(
        () => {
            const id = setInterval((timer), 12000);
            return () => clearInterval(id);
        },
        [index]
    );

    return (
        // <Grid container direction={'row'} style={style} spacing={2}>
        <div style={style} className="image-container">
            {
                urls.map((v, i) => {
                    return (
                        // <Grid item key={i} xs={6}>
                        <div key={i} className="image-item">
                            <img src={v[index]} className={"image-transition " + visible}
                                style={{
                                    transitionDuration: duration + 's',
                                    transitionDelay: i * duration + 's'
                                }}></img>
                            {/* // </Grid> */}
                        </div>
                    )
                })
            }
            {/* / </Grid > */}
        </div>
    )
}

export default ImageContainer;