import { Handle, Position } from 'reactflow';

export default function DB(data) {
    return <div className='db'>
        <Handle
            type="target"
            id="e"
            position={Position.Top}
        ></Handle>
        <img height={100} width={100} src={data.data.component.icon}></img>
        <p>
            {data.data.component.name}
        </p>
    </div>
}

