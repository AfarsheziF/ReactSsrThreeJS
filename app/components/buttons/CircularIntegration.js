import * as React from 'react';
import Box from '@mui/core/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';

export default function CircularIntegration(props) {
    const Icon = props.icon;

    const buttonSx = {
        ...(props.loading && {
            bgcolor: 'green',
            '&:hover': {
                bgcolor: 'lightGreen',
            },
        }),
    };

    const handleButtonClick = () => {
        if (props.handleButtonClick) {
            props.handleButtonClick();
        }
        if (props.onClick) {
            props.onClick();
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }} style={props.style}>
            <Box sx={{ m: 1, position: 'relative' }}>
                <Fab
                    disabled={props.disabled}
                    aria-label="save"
                    color="primary"
                    sx={buttonSx}
                    onClick={handleButtonClick}
                >
                    {<Icon />}
                </Fab>
                {props.loading && (
                    <CircularProgress
                        style={{
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            color: props.color
                        }}
                        size={68}
                        sx={{
                            color: 'green',
                            position: 'absolute',
                            top: -6,
                            left: -6,
                            zIndex: 1,
                        }}
                    />
                )}
            </Box>
        </Box >
    );
}