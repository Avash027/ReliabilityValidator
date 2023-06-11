import { Button, Modal } from "@mantine/core";
import { useReactFlow, getRectOfNodes, getTransformForBounds } from 'reactflow';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { TextInput, Select } from "@mantine/core";

import { useState } from "react";

const imageWidth = 1024;
const imageHeight = 768;

export default function SaveImageModal({ isOpen, setOpen, nodes, edges }) {
    const { getNodes } = useReactFlow();

    const [format, setFormat] = useState('toPng')
    const [width, setWidth] = useState(imageWidth)
    const [height, setHeight] = useState(imageHeight)


    const convertToJsonFileAndDownload = (data) => {
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'data.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }




    function downloadImage(dataUrl) {
        const a = document.createElement('a');

        a.setAttribute('download', 'reactflow.png');
        a.setAttribute('href', dataUrl);
        a.click();
    }

    const saveImage = async () => {

        if (format === 'JSON') {
            const data = {
                "nodes": nodes,
                "edges": edges
            }

            convertToJsonFileAndDownload(data)
            return
        }

        let formatConv = toPng

        if (format === "JPEG") {
            formatConv = toJpeg
        } else if (format === "SVG") {
            formatConv = toSvg
        }


        const nodesBounds = getRectOfNodes(getNodes());
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        formatConv(document.querySelector('.react-flow__viewport'), {
            backgroundColor: 'white',
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth,
                height: imageHeight,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        }).then(downloadImage);
    };

    return (
        <Modal opened={isOpen} onClose={() => setOpen(false)} size="xl">
            <Select
                style={{
                    marginBottom: "2rem"
                }}
                label="Pick the file format"
                placeholder="Pick one"
                data={[
                    { value: 'toPNG', label: 'PNG' },
                    { label: 'JEPG', value: 'toJPEG' },
                    { label: 'SVG', value: 'toSvg' },
                    { label: 'JSON', value: 'JSON' }
                ]}
                onSelect={(e) => setFormat(e.target.value)}
            />
            {format !== 'JSON' && <TextInput
                style={{
                    marginBottom: "2rem"
                }}
                placeholder="Width of image"
                value={width}
                label={"Width of image"}
                onChange={(e) => setWidth(e.target.value)} />}
            {format !== 'JSON' && <TextInput
                style={{
                    marginBottom: "2rem"
                }}
                placeholder="Height of image"
                value={height}
                label={"Height of image"}
                onChange={(e) => setHeight(e.target.value)} />}
            <Button onClick={saveImage}>Save {format === 'JSON' ? 'File' : 'Image'}</Button>
        </Modal>)
}