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
        name: "Users",
        type: constants.USER,
        icon: users.src
    },
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




]

export default function Sidebar() {


    const onDragStart = (event, component) => {
        event.dataTransfer.setData(constants.TRANSFER_LABEL, JSON.stringify(component));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <>

            <div
                className="list-container"
            >
                <h3>Components</h3>
                {
                    components.map((component, idx) => {
                        return <div className="c-list" key={idx} onDragStart={(event) => onDragStart(event, component)} draggable>
                            <div><img src={component.icon} height={50} width={50}></img></div>
                            <div>{component.name}</div>
                        </div>
                    })
                }

            </div >
        </>
    );
};
