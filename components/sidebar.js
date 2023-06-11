import constants from "@/constants/constants";
import cache from "@/assets/Cache.svg";
import SqlDB from "@/assets/SqlDB.svg";
import ec2 from "@/assets/ec2.png";
import loadBalancer from "@/assets/load-balancer.svg"
import azureIntance from "@/assets/azureInstance.svg"
import mobile from "@/assets/mobile.svg"
import prodDb from "@/assets/prod_db.svg"
import users from "@/assets/Users.svg"

const components = [
    {
        name: "Cache Server",
        type: constants.SERVER,
        icon: cache.src
    },
    {
        name: "SQL DB",
        type: constants.DB,
        icon: SqlDB.src

    },
    {
        name: "EC2 Instance",
        type: constants.SERVER,
        icon: ec2.src
    },
    {
        name: "Load Balancer",
        type: constants.SERVER,
        icon: loadBalancer.src
    },
    {
        name: "Azure Instance",
        type: constants.SERVER,
        icon: azureIntance.src
    },
    {
        name: "Mobile user",
        type: constants.USER,
        icon: mobile.src
    },
    {
        name: "Production Database",
        type: constants.DB,
        icon: prodDb.src
    },
    {
        name: "Users",
        type: constants.USER,
        icon: users.src
    },



]

export default function Sidebar() {
    const onDragStart = (event, component) => {
        event.dataTransfer.setData(constants.TRANSFER_LABEL, JSON.stringify(component));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside>
            <div className="description">You can drag these nodes to the pane on the right.</div>
            {
                components.map((component, idx) => {
                    switch (component.type) {
                        case constants.USER:
                            return <div key={idx} className="dndnode input" onDragStart={(event) => onDragStart(event, component)} draggable>
                                {component.name}
                            </div>
                        case constants.SERVER:
                            return <div key={idx} className="dndnode" onDragStart={(event) => onDragStart(event, component)} draggable>
                                {component.name}
                            </div>
                        default:
                            return <div key={idx} className="dndnode output" onDragStart={(event) => onDragStart(event, component)} draggable>
                                {component.name}
                            </div>
                    }
                })
            }

        </aside>
    );
};
