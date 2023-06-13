import { Handle, Position } from 'reactflow';
import { IconTrash } from '@tabler/icons-react';

export default function Server(data) {

    return <div className='server'>

        <Handle
            type='target'
            id="a"
            position={Position.Top}
        ></Handle>

        <Handle
            type='source'
            id="b"
            position={Position.Bottom}
        ></Handle>

        {data.data.isSpof ?
            <img height={100} width={100} src={"https://media.tenor.com/-LlG5WSoK74AAAAi/monkey.gif"}></img> :
            <img height={100} width={100} src={data.data.component.icon}></img>
        }
        <p>
            {data.data.component.name}{" "}{data.id}
        </p>

        <IconTrash style={{
            cursor: 'pointer',
            scale: "0.7"
        }} color='red' onClick={() => data.data.deleteNode(data.id)}></IconTrash>

    </div>
}