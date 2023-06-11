import { Handle, Position } from 'reactflow';

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
        <Handle
            type='target'
            id="c"
            position={Position.Left}
        ></Handle>
        <Handle

            type='target'
            id="d"
            position={Position.Right}
        ></Handle>
        <img height={100} width={100} src={data.data.component.icon}></img>
        <p>
            {data.data.component.name}
        </p>
    </div>
}