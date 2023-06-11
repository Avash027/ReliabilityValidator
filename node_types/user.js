import { Handle, Position } from 'reactflow';

export default function User(data) {
    return <div className='user'>
        <Handle
            type='source'
            id="f"
            position={Position.Bottom}
        ></Handle>
        <img height={100} width={100} src={data.data.component.icon}></img>
        <p>
            {data.data.component.name}
        </p>
    </div>
}