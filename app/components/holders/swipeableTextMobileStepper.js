import React, { useRef, useEffect } from 'react';
import { makeStyles, useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const useStyles = makeStyles(theme => ({
    root: {
        // maxWidth: 400,
        width: 'auto',
        // height: '80vh',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        height: 50,
        paddingLeft: theme.spacing(4),
        backgroundColor: theme.palette.background.default,
    },
    img: {
        // height: '100%',
        // width: 'auto',
        display: 'block',
        overflow: 'hidden',
        minHeight: '100px',
        // height: (global.mobilecheck() ? 'inherit' : '50vh'),
        margin: 'auto'
    },
}));

export default function SwipeableTextMobileStepper(props) {
    // console.log(props);

    const classes = useStyles();
    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(props.activeImg || 0);
    const maxSteps = props.data.length;

    // const swipeableViewsRef = useRef();

    // useEffect(() => {
    //     swipeableViewsRef.current
    //         .getChildContext()
    //         .swipeableViews.slideUpdateHeight();
    // });

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const handleStepChange = step => {
        setActiveStep(step);
    };

    var isMobile = props.isMobile;

    return (
        <div className={classes.root}>
            <AutoPlaySwipeableViews
                style={{ margin: 'auto', overflowX: 'hidden', overflowY: 'auto' }}
                axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                index={activeStep}
                onChangeIndex={handleStepChange}
                enableMouseEvents
                autoplay={true}
                interval={5000}
                animateHeight
            >
                {props.data.map((img, index) => (
                    <div key={index}>
                        {Math.abs(activeStep - index) <= 2 ? (
                            <img key={index} className={classes.img} style={isMobile ? { width: '100%' } : {}} src={img.url} alt={img.name} />
                        ) : null}
                    </div>
                ))}
            </AutoPlaySwipeableViews>
            <MobileStepper
                style={isMobile ? { color: 'white' } : {}}
                variant={(isMobile ? "text" : "dots")}
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                    <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} color="primary">
                        Next {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0} color="primary">
                        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                        Back
                    </Button>
                }
            />
        </div >
    );
}