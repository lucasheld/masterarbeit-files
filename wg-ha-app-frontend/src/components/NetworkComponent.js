import React, {useCallback} from "react";
import ReactFlow, {addEdge, Background, Controls, EdgeTypes, useEdgesState, useNodesState} from "reactflow";
import ELK from "elkjs";

import "reactflow/dist/style.css";
import {useStoreClients, useStoreCustomRules} from "../store";
import CustomEdge from "./CustomEdge";
import {generateNodesAndEdges} from "../graphUtils";

const elkLayout = (nodes, edges) => {
    const nodesForElk = nodes.map((node) => {
        return {
            id: node.id,
            width: 400,
            height: 150
        };
    });
    const graph = {
        id: "root",
        layoutOptions: {
            "elk.algorithm": "layered",
            "elk.direction": "DOWN",
            "nodePlacement.strategy": "SIMPLE"
        },

        children: nodesForElk,
        edges: edges
    };
    const elk = new ELK();
    return elk.layout(graph);
};

const edgeTypes: EdgeTypes = {
    custom: CustomEdge,
};

const NetworkComponent = () => {
    const customRules = useStoreCustomRules(state => state.customRules);
    const clients = useStoreClients(state => state.clients);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    React.useEffect(() => {
        let nodesEdges = generateNodesAndEdges(clients, customRules);
        let newNodes = nodesEdges.nodes;
        let newEdges = nodesEdges.edges;

        // layout new nodes and edges with elk and save them
        elkLayout(newNodes, newEdges).then((graph) => {
            setNodes([
                ...graph.children.map((node) => {
                    return {
                        ...newNodes.find((n) => n.id === node.id),
                        position: { x: node.x, y: node.y }
                    };
                })
            ]);
            setEdges(graph.edges);
        });
    }, [clients, customRules]);

    return (
        <div
            style={{
                display: "flex",
                height: "calc(100vh - 112px)"
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                edgeTypes={edgeTypes}
            >
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
}

export default NetworkComponent;
