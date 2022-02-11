<template>
    <div class="shape" v-for="(shape, i) of shapeList">
        <canvas width="100" height="50" :id="`shape-${shape.id}-${shape.type}-${i}`" class="shape-canvas"></canvas>
        <button :id="`button-${shape.id}`" class="button">编辑</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Shape, shapeList } from "../experiment/utils";

function center(shape: Shape) {
    if (shape.type === 'circle') {
        const radius = shape.radius;
        const scale = 45 / (radius * 2);
        return { radius: radius * scale }
    } else {
        const vertical = shape.node.map(v => v[1]);
        const horizon = shape.node.map(v => v[0]);
        const left = Math.min(...horizon);
        const right = Math.max(...horizon);
        const top = Math.min(...vertical);
        const bottom = Math.max(...vertical);
        const width = right - left;
        const height = bottom - top;
        const center = [left + width / 2, top + height / 2];
        const scale = width > height * 2 ? 90 / width : 45 / height;
        return shape.node.map(v => 
            [(v[0] - center[0]) * scale + center[0], 
            (v[1] - center[1]) * scale + center[1]]
        );
    }
}

export function drawThumbnail() {
    const canvases = document.getElementsByClassName('shape-canvas') as HTMLCollectionOf<HTMLCanvasElement>;
    const arr = Array.from(canvases);
    arr.forEach(v => {
        const id = v.id;
        const splitted = id.split('-');
        const type = splitted[2];
        const ctx = v.getContext('2d') as CanvasRenderingContext2D;
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 3;
        ctx.fillStyle = '#6495ED';
        const shape = shapeList[parseInt(splitted[3])];
        if (type === 'circle') {
            const info = center(shape);
            ctx.beginPath();
            // @ts-ignore
            ctx.arc(50, 25, info.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
        } else if (type === 'polygon') {
            const info = center(shape);
            ctx.beginPath();
            ctx.moveTo(shape.node[0][0], shape.node[0][1]);
            // @ts-ignore
            for (let i = 1; i < info.length; i++) {
                // @ts-ignore
                ctx.lineTo(info[i][0], info[i][1]);
            }
            ctx.closePath();
            ctx.stroke();
        }
    });
}

export default defineComponent({
    name: 'Shapes',
    data: () => {
        return {
            shapeList,
        };
    },
    methods: {
        drawThumbnail,
    }
});

</script>

<style lang="less" scoped>

.shape {
    display: flex;
    justify-content: space-between;
    justify-items: center;
    border: 2px #222 solid;
    border-radius: 10px;
    margin: 3%;
    padding: 2%;
}

.shape-canvas {
    position: static;
    width: 100px;
    height: 50px;
    border: 1px #888 solid;
}

.button {
    width: 100px;
    height: 30px;
    border-radius: 5px;
    background-color: transparent;
    font-size: 25px;
    cursor: pointer;
    z-index: 200;
    border: 2px solid #222;
    font-size: 16px;
    width: 40%;
    justify-self: end;
    color: white;
    height: 50px;
}

.button:hover {
    border: 2px solid #555;
}

.button:active {
    border: 2px solid #222;
}

</style>