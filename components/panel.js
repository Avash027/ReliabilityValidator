
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
        }
    }, []);


    const getId = () => {
        return `${id++}`
    }

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({
        ...params,
        animated: true,
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
                data: { label: `${component.type} node`, component },

            };

            console.log(newNode)

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance]
    );


    const checkSPOF = () => {

        if (!isValid()) {
            setShowAlert(true);
            return;
        }
        setShowAlert(false);

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
                        node.data = { ...node.data, isSpof: true }
                    }
                    return node;
                }))



            } else {

                setNodes((nds) => nds.map(node => {
                    if (node.id === potentialSPOF[i].id) {
                        node.style = { boxShadow: constants.REACHABLE_BOX_SHADOW }
                        node.data = { ...node.data, isSpof: false }
                    }
                    return node;
                }))
            }
        }

        setNodes((nds) => {
            return nds.map(node => {

                if (node.type !== constants.DB) {
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
        <>
            {showAlert && <Alert onClose={() => setShowAlert(false)} withCloseButton className='alert' icon={<IconAlertCircle size="1rem" />} title="Invalid Design" color="red">
                {alertMessage}
            </Alert>}
            <div className='parent'>

                <div className='button-parent'>

                    <h3>Actions</h3>

                    <Button size='md' style={{
                        width: "10rem",
                    }} onClick={checkSPOF}>Chaos Monkey</Button>

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


