function createAdjecencyList(nodes, edges) {
    let adjList = new Map();
    for (let i = 0; i < nodes.length; i++) {
        adjList.set(nodes[i].id, []);
    }
    for (let i = 0; i < edges.length; i++) {
        adjList.get(edges[i].source).push(edges[i].target);
    }
    return adjList;
}


function isSpof(adjList, nodes, potentialSPOFNode) {

    const startingNodes = nodes.filter(node => {
        return node.type === "user"
    })

    let endingNodes = nodes.filter(node => {
        return node.type === "db"
    })

    let visited = new Map();
    for (let i = 0; i < nodes.length; i++) {
        visited.set(nodes[i].id, false);
    }
    let queue = [];


    for (let i = 0; i < startingNodes.length; i++) {
        queue.push(startingNodes[i].id);
    }

    while (queue.length !== 0) {
        let currentNodeId = queue.shift();



        if (visited.get(currentNodeId) === true) {
            continue;
        }

        if (currentNodeId === potentialSPOFNode.id) {
            continue
        }

        visited.set(currentNodeId, true);
        for (let i = 0; i < adjList.get(currentNodeId).length; i++) {
            const nxtNodeId = adjList.get(currentNodeId)[i];
            if (visited.get(nxtNodeId) === true) {
                continue
            }
            queue.push(nxtNodeId);


        }
    }

    let unreachableNodes = [];


    for (let i = 0; i < endingNodes.length; i++) {
        if (visited.get(endingNodes[i].id) === false) {
            unreachableNodes.push(endingNodes[i]);
        }
    }

    if (unreachableNodes.length === 0) {
        return {
            isSpof: false,
            unreachableNodes: unreachableNodes
        }
    }

    return {
        isSpof: true,
        unreachableNodes: unreachableNodes
    }
}



export { createAdjecencyList, isSpof }