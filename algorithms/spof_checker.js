import constants from '../constants/constants';

const CheckAndMarkSPOF = ({
    isValid,
    setShowAlert,
    setNodes,
    nodes,
    edges,
    createAdjecencyList,
    isSpof
}) => {

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

export {
    CheckAndMarkSPOF
}