import {BaseEdge, EdgeLabelRenderer, getBezierPath} from "reactflow";
import React from "react";

const CustomEdge = (props) => {
    const [path, labelX, labelY] = getBezierPath(props);

    return (
        <>
            <BaseEdge path={path} labelX={labelX} labelY={labelY} {...props} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        background: 'white',
                        padding: 10,
                        borderRadius: 5,
                        fontSize: 12,
                        fontWeight: props.selected ? "bold" : "unset",
                        pointerEvents: "all",
                        zIndex: props.selected ? 1000 : "unset",
                        whiteSpace: "pre-line",
                        textAlign: "center",
                        opacity: 0.9
                    }}
                    className="nodrag nopan"
                >
                    {props.data.text}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;
