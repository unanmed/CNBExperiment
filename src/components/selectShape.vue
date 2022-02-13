<template>
    <div id="root">
        <div id="back">
            <div id="select">选择图形</div>
            <hr>
            <div id="shapes">
                <div v-for="(shape, i) of shapeList" class="shape">
                    <canvas class="shape-canvas" :id="`shape-${shape.id}-${shape.type}-${i}`"></canvas>
                    <span class="shape-text">图形id：{{shape.id}}</span>
                    <span class="shape-text">图形类型：{{getShapeTypeName(shape.type)}}</span>
                    <button class="shape-select" @click="$emit('select', i, index)">选择</button>
                </div>
            </div>
            <hr>
            <div id="tools">
                <button class="tool" @click="$emit('cancel')">取消</button>
                <button class="tool" @click="$emit('cancel')">确定</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import { shapeList } from "../experiment/utils";
import { getShapeTypeName } from "../experiment/utils";
import { drawThumbnail } from "./shapes.vue";

export default defineComponent({
    name: 'ShapeSelector',
    emits: ['select', 'cancel'],
    props: {
        index: String,
    },
    data() {
        return {
            shapeList, getShapeTypeName
        }
    },
    async mounted() {        
        await drawThumbnail('#222');
    },
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

#tools {
    display: flex;
    justify-content: flex-end;
    justify-items: center;
    padding-bottom: 10px;
}

button {
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

button:hover {
    border: 2px solid rgb(2, 39, 247);
}

button:active {
    border: 2px solid rgb(2, 39, 247);
    background-color: cadetblue;
}

.shape {
    display: flex;
    justify-content: space-between;
    justify-items: center;
    padding-bottom: 10px;
    border: 2px solid rgb(0, 82, 50);
    border-radius: 5px;
    margin: 15px;
    padding: 10px;
}

.shape-canvas {
    position: static;
    width: 300px;
    height: 150px;
    border: 1px solid black;
}

#select {
    font-size: 30px;
    text-shadow: 1px 1px 2px rgb(255, 255, 255);
    color: #220;
    text-align: center;
    font-family: '微软雅黑';
    margin-top: 0.8%;
    font-weight: 50;
    user-select: none;
}

.shape-text {
    font-size: 32px;
    color: #222;
    text-align: center;
    font-family: '微软雅黑';
    font-weight: 50;
    user-select: none;
    align-self: center;
}

.shape-select {
    align-self: center;
}

#shapes {
    height: 73%;
    overflow: auto;
}

</style>