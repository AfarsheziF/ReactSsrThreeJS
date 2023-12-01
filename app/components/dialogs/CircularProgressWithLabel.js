import * as React from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

function CircularProgressWithLabel(props) {
    return props.value ? (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" color='primary'
                size={props.size || 80}
                {...props}
            />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" color="primary" style={props.style}>
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    ) : <></>;
}

export default styled(CircularProgressWithLabel);