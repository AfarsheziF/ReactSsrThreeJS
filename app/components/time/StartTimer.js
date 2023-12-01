import React from "react";
import { useEffect, useCallback, useState } from "react";

export const interval =
    (delay = 0) =>
    /** @param {() => void} callback */ callback =>
            useEffect(() => {
                const id = setInterval(callback, delay);

                return () => clearInterval(id);
            }, [callback]);

const use1Second = interval(1e3);

const useTimer = ({
    seconds: initialSeconds = 0,
    running: initiallyRunning = false
} = {}) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [running, setRunning] = useState(initiallyRunning);
    const tick = useCallback(
        () => (running ? setSeconds(_seconds => _seconds + 1) : undefined),
        [running]
    );
    const start = () => setRunning(true);
    const pause = () => setRunning(false);
    const reset = () => setSeconds(0);
    const stop = () => {
        pause();
        reset();
    };

    use1Second(tick);

    return { pause, reset, running, seconds, start, stop };
};


const StartTimer = () => {
    const { seconds, start, stop } = useTimer();

    return (
        <div className="counter-container">
            <button className="start-button" onClick={start}>
                start
            </button>
            <button className="stop-button" onClick={stop}>
                stop
            </button>
            <p id="counter">{seconds}</p>
        </div>
    );
};

export default StartTimer;