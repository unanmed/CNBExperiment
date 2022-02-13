<template>
    <div class="shape" v-for="(shape, i) of shapeList">
        <canvas width="100" height="50" :id="`shape-${shape.id}-${shape.type}-${i}`" class="shape-canvas"></canvas>
        <button @click="$emit('editShape', i)" :id="`button-${shape.id}`" class="button">编辑</button>
    </div>
    <button id="create">创建新形状</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { shapeList, drawShape, initCanvas } from "../experiment/utils";

export async function drawThumbnail(strokeStyle?: string) {
    const canvases = document.getElementsByClassName('shape-canvas') as HTMLCollectionOf<HTMLCanvasElement>;
    const arr = Array.from(canvases);
    arr.forEach(async (v) => {
        initCanvas(v);
        const id = v.id;
        const splitted = id.split('-');
        await drawShape(parseInt(splitted[3]), {
            canvas: id,
            node: false,
            dx: 0,
            dy: 0,
            scale: 1,
            strokeStyle: strokeStyle || '#ccc',
            width: v.width,
            height: v.height,
            noCache: true
        });
    });
}

export default defineComponent({
    emits: ['editShape'],
    name: 'Shapes',
    data: () => {
        return {
            shapeList,
        };
    },
    methods: {
        drawThumbnail,
    },
    async mounted() {
        await drawThumbnail();
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

#create {
    width: 94%;
    height: 50px;
    background: transparent;
    border: 2px solid #222;
    font-size: 26px;
    color: #ffd;
    cursor: pointer;
    text-align: center;
    font-weight: bold;
    margin-left: 3%;
    margin-right: 3%;
    border-radius: 5px;
}

#create:hover {
    border: 2px solid #555;
}

#create:active {
    border: 2px solid #222;
}

</style>