import { Handle, Position } from 'reactflow';
import { IconTrash } from '@tabler/icons-react';

export default function DB(data) {
    return <div className='db'>
        <Handle
            type="target"
            id="e"
            position={Position.Top}
        ></Handle>
        <img height={100} width={100} src={data.data.component.icon}></img>
        <p>
            {data.data.component.name}{" "}{data.id}
        </p>
        <IconTrash style={{
            cursor: 'pointer',
            scale: "0.7"
        }} color='red' onClick={() => data.data.deleteNode(data.id)}></IconTrash>
    </div>
}

