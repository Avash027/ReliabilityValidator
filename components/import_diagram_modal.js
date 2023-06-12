import { Button, Modal, Code } from '@mantine/core';
import { useState } from 'react';

export default function ImportDiagramModal({ isOpen, setOpen, setNodes, setEdges }) {

    const [data, setData] = useState(null);
    const [preview, setPreview] = useState(null);

    function handleFileChange(event) {
        const selectedFile = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = JSON.parse(event.target.result);
            if (!data.nodes || !data.edges) {
                alert("Invalid file format");
                return;
            }

            setData(data);
            setPreview(data);

        };
        reader.readAsText(selectedFile);
    }

    return (
        <Modal title="Import Design" opened={isOpen} onClose={() => {
            setOpen(false)
            setPreview(null)
            setData(null)
        }} size="xl">
            <input style={{
                marginBottom: "2rem"
            }} type="file" accept=".json" onChange={handleFileChange} />
            <br></br>
            {preview && <div style={{ maxHeight: "20rem", overflowY: "auto" }}>
                <Code>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </Code>
            </div>}
            {data && <Button fullWidth onClick={() => {
                setNodes(data.nodes);
                setEdges(data.edges);
                setOpen(false);
                setPreview(null);
                setData(null);
            }}>Import</Button>}

        </Modal>
    );
}