import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
} from 'reactflow';

import User from "../node_types/user"
import DB from "../node_types/db"
import Server from "../node_types/server"

import { createAdjecencyList, isSpof } from "../algorithms/graph"
import constants from '@/constants/constants';

import Sidebar from './sidebar';


const nodeTypes = {
    user: User,
    server: Server,
    db: DB,
};

let id = 0;
const getId = () => `dndnode_${id++}`;

const DnDFlow = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const component_ = event.dataTransfer.getData(constants.TRANSFER_LABEL);

            const component = JSON.parse(component_)

            if (typeof component.type === 'undefined' || !component.type) {
                return;
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });
            const newNode = {
                id: getId(),
                type: component.type,
                position,
                data: { label: `${component.type} node`, component },

            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );


    const checkSPOF = () => {
        let adjList = createAdjecencyList(nodes, edges);
        const potentialSPOF = nodes.filter(node => {
            return node.type === constants.SERVER
        })

        const unreachableNodes = new Map();

        for (let i = 0; i < potentialSPOF.length; i++) {
            const ret = isSpof(adjList, nodes, potentialSPOF[i]);

            if (ret.isSpof) {
                for (let j = 0; j < ret.unreachableNodes.length; j++) {
                    unreachableNodes.set(ret.unreachableNodes[j].id, potentialSPOF[i].id);
                }

                setNodes((nds) => nds.map(node => {
                    if (node.id === potentialSPOF[i].id) {
                        node.style = { boxShadow: constants.SPOF_BOX_SHADOW }
                        node.meta = { label: constants.SPOF_LABEL }
                    }
                    return node;
                }))

            } else {
                setNodes((nds) => nds.map(node => {
                    if (node.id === potentialSPOF[i].id) {
                        node.style = { boxShadow: constants.REACHABLE_BOX_SHADOW }
                    }
                    return node;
                }))
            }
        }

        setNodes((nds) => {
            return nds.map(node => {

                if (node.type !== "db") {
                    return node;
                }

                if (unreachableNodes.has(node.id)) {
                    node.style = { boxShadow: constants.UNREACHABLE_BOX_SHADOW }
                    node.meta = { label: "Unreachable from SPOF: " + unreachableNodes.get(node.id) }
                } else {
                    node.style = { boxShadow: constants.REACHABLE_BOX_SHADOW }
                    node.meta = { label: "Reachable" }
                }
                return node;
            })
        })

    }

    return (
        <div className="dndflow" style={{ height: "100%", width: "100%" }}>
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "100vh", width: "100%" }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls />
                    </ReactFlow>
                </div>
                <Sidebar />
                <button onClick={checkSPOF}>Chaos Monkey</button>
            </ReactFlowProvider>
        </div>
    );
};

export default DnDFlow;


