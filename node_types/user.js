import { Handle, Position } from 'reactflow';
import { IconTrash } from '@tabler/icons-react';

export default function User(data) {
    return <div className='user'>
        <Handle
            type='source'
            id="f"
            position={Position.Bottom}
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