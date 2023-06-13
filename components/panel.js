
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    MarkerType
} from 'reactflow';
import { Button, Alert } from '@mantine/core';
import { IconAlertCircle } from "@tabler/icons-react"

import User from "../node_types/user"
import DB from "../node_types/db"
import Server from "../node_types/server"

import { createAdjecencyList, isSpof } from "../algorithms/graph"
import { CheckAndMarkSPOF } from "../algorithms/spof_checker"
import constants from '@/constants/constants';

import Sidebar from './sidebar';
import SaveImageModal from './save_image_modal';
import ImportDiagramModal from './import_diagram_modal';


const nodeTypes = {
    user: User,
    server: Server,
    db: DB,
};

let id = 0

const DnDFlow = () => {

    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [imageSaveModalOpen, setImageSaveModalOpen] = useState(false);
    const [importDiagramModalOpen, setImportDiagramModalOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");


    useEffect(() => {
        if (nodes.length === 0 && edges.length === 0) {
            return;
        }
        window.localStorage.setItem(constants.LOCAL_STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }, [nodes, edges]);

    useEffect(() => {
        const data = window.localStorage.getItem(constants.LOCAL_STORAGE_KEY);
        if (data) {
            const parsedData = JSON.parse(data);
            setNodes(parsedData.nodes);
            setEdges(parsedData.edges);
            id = parsedData.nodes.map(node => parseInt(node.id)).reduce((a, b) => Math.max(a, b), 0) + 1;
        }
    }, []);


    const getId = () => {
        return `${id++}`
    }

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: {
            color: "black"
        },
        markerEnd: {
            type: MarkerType.Arrow,
        },
    }, eds)), []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    function isValid() {
        if (nodes.length === 0) {
            setAlertMessage("Please add at least one node");
            return false;
        }
        if (nodes.filter(node => node.type === constants.SERVER).length === 0) {
            setAlertMessage("Please add at least one server");
            return false;
        }
        if (nodes.filter(node => node.type === constants.USER).length === 0) {
            setAlertMessage("Please add at least one user");
            return false;
        }
        if (nodes.filter(node => node.type === constants.DB).length === 0) {
            setAlertMessage("Please add at least one database");
            return false;
        }
        return true;

    }

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
                data: {
                    label: `${component.type} node`,
                    component,
                    isSpof: false,
                    deleteNode: deleteNode,
                },

            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );

    const deleteNode = (nodeId) => {
        setNodes((nds) => nds.filter(node => node.id !== nodeId));
        setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    }




    return (
        <>
            {showAlert && <Alert onClose={() => setShowAlert(false)} withCloseButton className='alert' icon={<IconAlertCircle size="1rem" />} title="Invalid Design" color="red">
                {alertMessage}
            </Alert>}
            <div className='parent'>

                <div className='button-parent'>

                    <h3>Actions</h3>

                    <Button size='md' style={{
                        width: "10rem",
                    }} onClick={() => {
                        CheckAndMarkSPOF({
                            nodes: nodes,
                            edges: edges,
                            isValid: isValid,
                            setNodes: setNodes,
                            setShowAlert: setShowAlert,
                            createAdjecencyList: createAdjecencyList,
                            isSpof: isSpof
                        })
                    }}>Chaos Monkey</Button>

                    <Button size='md' variant='outline' style={{
                        width: "10rem",
                    }} onClick={() => setImageSaveModalOpen(prev => !prev)}>Export Design</Button>

                    <Button size='md' variant='outline' style={{
                        width: "10rem",
                    }} onClick={() => setImportDiagramModalOpen(prev => !prev)}>Import Design</Button>

                    <Button size='md' variant='outline' style={{
                        width: "10rem",
                    }} onClick={() => {
                        setNodes([]);
                        setEdges([]);
                        id = 0
                        window.localStorage.removeItem(constants.LOCAL_STORAGE_KEY);

                    }}>Clear</Button>

                </div>

                <div className="dndflow">

                    <ReactFlowProvider>
                        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: "100vh" }}>
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
                                <SaveImageModal isOpen={imageSaveModalOpen} setOpen={setImageSaveModalOpen} nodes={nodes} edges={edges} />
                                <ImportDiagramModal isOpen={importDiagramModalOpen} setOpen={setImportDiagramModalOpen} setNodes={setNodes} setEdges={setEdges} />

                                <Controls />
                            </ReactFlow>

                        </div>

                    </ReactFlowProvider>

                </div>
                <div style={{
                    width: "100%"
                }}>
                    <Sidebar />

                </div>

            </div>
        </>
    );
};

export default DnDFlow;


