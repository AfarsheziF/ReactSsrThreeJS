import React, { useRef, useSyncExternalStore, useMemo } from "react";

function subscribe(callback) {
    window.addEventListener("resize", callback)
    return () => {
        window.removeEventListener("resize", callback)
    }
}

function useDimensions(ref) {
    const dimensions = useSyncExternalStore(
        subscribe,
        () => JSON.stringify({
            width: ref.current?.offsetWidth ?? 0,
            height: ref.current?.offsetHeight ?? 0,
        }),
        () => true
    )
    return useMemo(() => JSON.parse(dimensions), [dimensions])
}

const StretchableText = (props) => {
    const ref = useRef(null)
    const { width, height } = useDimensions(ref)

    const getSpacing = (v, i) => {
        if (ref && ref.current && props.children) {
            const spaceForChar = width / v.length;
            let spacing = (width + 1000) / 100;
            spacing -= spaceForChar / spacing % 1;

            if (!spacing) {
                spacing = 'inherit';
            }

            let view;
            view = (
                <div key={i} style={{ letterSpacing: spacing }}>
                    {v}
                </div>
            )

            return view

            // charWidth =
            //     spaceForChar -
            //     currentCharWidth +
            //     (spaceForChar - currentCharWidth) / currentLength;
            // charWidth = (spaceForChar - currentCharWidth) / currentLength;
        }
    }

    return (
        <div ref={ref} style={props.style}>
            {/* {width} x {height} / {charWidth} {currentLength} */}
            {props.children.map((v, i) => {
                // return getSpacing(v, i);
                return getSpacing(v, i)
            })}

        </div>
    )
}

export default StretchableText;