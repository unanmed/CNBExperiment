<template>
    <div id="root">
        <div id="back">
            <div id="description">
                <span class="text">图形id：{{shapeList[index].id}}</span>
                <span class="text" id="center">图形编辑器</span>
                <span class="text">图形类型：{{getShapeTypeName(shapeList[index].type)}}</span>
            </div>
            <hr id="top">
            <div id="editor">
                <img class="scale" @click="triggerScale('lessen')" id="lessen" src="/src/assets/lessen.png">
                <img class="scale" @click="triggerScale('enlarge')" id="enlarge" src="/src/assets/enlarge.png">
                <canvas @mouseup="listenUp($event, index)" 
                    @mousedown="listenDown($event, index)"
                    @mousemove="listenMove($event, index)" 
                    id="editor-canvas">
                </canvas>
            </div>
            <hr id="bottom">
            <div id="tools">
                <div id="leftTool">
                    <button class="tool">撤销</button>
                    <button class="tool">重做</button>
                </div>
                <div id="middleTool">
                    <button class="tool" id="detail">详细信息</button>
                </div>
                <div id="rightTool">
                    <button class="tool" @click="cancel(index)">取消</button>
                    <button class="tool" @click="$emit('confirm')">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { shapeList, getShapeTypeName, drawShape, changeNode,
    getComputedNode, initCanvas, DrawConfig, drawScale } from "../experiment/utils";
import { editScale } from "../experiment/global";

export type node = {
    radius?: number, 
    center?: [number, number], 
    node?: Array<[number, number]>
}

const originNode: node = {};

const tempNode: node = {};

const saveList = [];

let selected: number = -1;

let clicked: boolean = false;

export default defineComponent({
    emits: ['confirm', 'cancel'],
    name: 'ShapeEditor',
    props: {
        index: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            shapeList,
            scale: 1,
            dx: 0,
            dy: 0,
            width: 0,
            height: 0,
        };
    },
    methods: {
        getShapeTypeName,
        listenMove(ev: MouseEvent, index: number) {
            const shape = shapeList[index];
            const config: DrawConfig = {
                canvas: 'editor-canvas',
                node: true,
                dx: this.dx,
                dy: this.dy,
                scale: this.scale,
                width: this.width,
                height: this.height,
            }
            // 点击时
            if (clicked) {
                if (shape.type === 'circle') {
                    return;
                } else {
                    changeNode(shape, selected, ev.movementX, ev.movementY, config);
                    drawShape(index, config);
                    drawScale(shapeList[this.index], config);
                    return;
                }
            }
            // 未点击时，获得所有节点
            const nodes: Array<[number, number]> = [];
            if (shape.type === 'circle') {
                nodes.push([shape.center[0] + this.dx, shape.center[1] + this.dy]);
            } else {
                nodes.push(...getComputedNode(index, {
                    dx: this.dx,
                    dy: this.dy,
                    scale: this.scale,
                    width: this.width,
                    height: this.height
                }));
            }
            // 检测鼠标是否移动到节点上
            const hover = nodes.findIndex(([x, y], i) => {
                return Math.abs(ev.offsetX - x) <= 10 && Math.abs(ev.offsetY - y) <= 10;
            });
            config.hover = hover;
            if (hover === -1){ 
                if (selected >= 0) {
                    selected = -1;
                    drawShape(index, config);
                    drawScale(shapeList[this.index], config);
                }
                return;
            }
            selected = hover;            
            drawShape(index, config);
            drawScale(shapeList[this.index], config);
        },
        triggerScale(type: 'enlarge' | 'lessen') {
            if (type === "enlarge") {
                this.scale *= 1.1;
            } else {
                this.scale /= 1.1;
            }
        },
        listenDown(ev: MouseEvent, index: number) {
            if (selected !== -1) clicked = true;
        },
        listenUp(ev: MouseEvent, index: number) {
            clicked = false;
        },
        cancel(index: number) {
            this.$emit('cancel', originNode, shapeList[index], this.scale);
        },
    },
    async mounted() {
        const canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
        initCanvas(canvas);
        this.width = canvas.width;
        this.height = canvas.height;
        const shape = shapeList[this.index];
        if (!editScale.get(shape)) editScale.set(shape, 1);
        this.scale = editScale.get(shape) || 1;
        const config = {
            canvas: 'editor-canvas',
            node: true,
            dx: 0,
            dy: 0,
            scale: this.scale,
            width: this.width,
            height: this.height,
        }
        await drawShape(this.index, config);
        drawScale(shapeList[this.index], config);
        if (shape.type === 'circle') {
            tempNode.radius = shape.radius;
            tempNode.center = shape.center.slice() as [number, number];
            originNode.radius = shape.radius;
            originNode.center = shape.center.slice() as [number, number];
        } else {
            tempNode.node = shape.node.slice();
            originNode.node = shape.node.slice() as Array<[number, number]>;
        }
    },
    watch: {
        scale(newScale, oldScale) {
            const translateX = (newScale - oldScale) * this.width / 2;
            const translateY = (newScale - oldScale) * this.height / 2;
            this.dx -= translateX;
            this.dy -= translateY;
            editScale.set(shapeList[this.index], newScale);
            requestAnimationFrame(() => {
                const config = {
                    canvas: 'editor-canvas',
                    node: true,
                    dx: this.dx,
                    dy: this.dy,
                    scale: this.scale,
                    width: this.width,
                    height: this.height,
                }
                drawShape(this.index, config);
                drawScale(shapeList[this.index], config);
            });
        },
    }
});

</script>

<style lang="less" scoped>

#root {
    display: flex;
    justify-content: center;
    justify-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 300;
}

#back {
    width: 75%;
    height: 75%;
    background-color: #eee;
    border-radius: 10px;
    display: block;
    box-shadow: 0px 0px 10px black;
    justify-self: center;
    align-self: center;
    z-index: 400;
}

#description {
    display: flex;
    justify-content: space-between;
    justify-items: center;
    width: 100%;
    height: 10%;
}

#center {
    text-shadow: 1px 1px 2px rgb(255, 255, 255);
    color: #220;
}

.text {
    font-size: 30px;
    color: black;
    text-align: center;
    font-family: '微软雅黑';
    margin-top: 0.8%;
    margin-left: 20px;
    margin-right: 20px;
    font-weight: 50;
    user-select: none;
}

#tools {
    display: flex;
    justify-content: space-between;
    justify-items: center;
    padding-bottom: 10px;
}

.tool {
    width: 100px;
    height: 100%;
    font-size: 25px;
    color: white;
    border-radius: 5px;
    background-color: rgb(20, 167, 235);
    transition: all 0.1s ease-in-out;
    -webkit-transition: all 0.1s ease-in-out;
    box-shadow: 0px 0px 5px black;
    text-shadow: 2px 2px 2px black;
    margin-right: 10px;
    margin-left: 10px;
    cursor: pointer;
    border: 2px solid rgb(20, 167, 235);
}

.tool:hover {
    border: 2px solid rgb(2, 39, 247);
}

.tool:active {
    border: 2px solid rgb(2, 39, 247);
    background-color: cadetblue;
}

hr {
    margin-top: 0.8%;
    margin-bottom: 0.8%;
}

#top {
    margin-bottom: 0;
}

#bottom {
    margin-top: 0;
}

#editor {
    width: 100%;
    height: 76%;
    position: relative;
}

#editor-canvas {
    position: static;
    z-index: 400;
}

#detail {
    width: 140px;
}

.scale {
    width: 40px;
    height: 40px;
    position: absolute;
    z-index: 500;
    cursor: pointer;
    transition: all 0.3s ease-out;
    -webkit-transition: all 0.3s ease-out;
}

.scale:hover {
    filter: brightness(1.5);
}

.scale:active {
    filter: drop-shadow(0px 0px 1px black);
}

#enlarge {
    left: 5px;
    bottom: 65px;
}

#lessen {
    left: 5px;
    bottom: 5px;
}

</style>