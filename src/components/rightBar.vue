<template>
    <div id="right-bar" class="bar">
        <keep-alive>
            <component :is="selected" @edit-shape="editShape" @choose="openSelectShape"></component>
        </keep-alive>
    </div>
    <div id="fold" class="bar" @click="triggerFold()">
        <div id="fold-text">▶</div>
    </div>
    <div id="list" class="bar">
        <div @click="select(one.id)" v-for="one of selectList" class="select" :status="selected === `${one.id}-vue`">{{one.text}}</div>
    </div>
    <ShapeEditorVue @confirm="confirmEdit" @cancel="cancelEdit" v-if="editing" :index="editIndex" ></ShapeEditorVue>
    <ShapeSelectorVue @cancel="selecting = false" @select="selectShape" v-if="selecting" :index="beSelectedIndex"></ShapeSelectorVue>
</template>

<script lang="ts">
import objects from "../resource/objects";
import ObjectsVue from "./object.vue";
import { defineComponent } from "vue";
import { shapeList } from "../experiment/utils";
import ShapesVue, {drawThumbnail} from "./shapes.vue";
import ShapeEditorVue, { node } from "./shapeEditor.vue";
import type { Shape } from "cnb-physics";
import ShapeSelectorVue from "./selectShape.vue";
import { drawAllFields } from "../experiment/draw";
import { shape } from "./oneObject.vue";
import { editScale } from "../experiment/global";

const objectList = Object.values(objects);

const selectList = [
    { id: 'objects', text: '物体' },
    { id: 'shapes', text: '形状' }
];

function initStyle(ele: HTMLElement): void {
    if (ele.id === 'fold' || ele.id === 'list') ele.style.right = '300px';
    else ele.style.right = '0px';
}

export const editorStatus = {
    index: 0,
    showing: false
}

export default defineComponent({
    name: "RightBar",
    data: () => {
        return {
            objectList, shapeList, selectList,
            folded: false,
            selected: 'objects-vue',
            editing: false,
            editIndex: 0,
            selecting: false,
            beSelectedIndex: 'electricField',
        };
    },
    provide() {
        return {
            shapeSelect: 0
        };
    },
    methods: {
        triggerFold() {
            const list = document.getElementsByClassName('bar') as HTMLCollectionOf<HTMLDivElement>;
            const arr = Array.from(list);
            arr.forEach(bar => {
                let now = parseFloat(bar.style.right);
                if (isNaN(now)) {
                    initStyle(bar);
                    now = parseFloat(bar.style.right);
                }
                if (!this.folded) {
                    bar.style.right = bar.id === 'list' ? `${now - 380}px` : `${now - 300}px`;
                } else {
                    bar.style.right = bar.id === 'list' ? `${now + 380}px` : `${now + 300}px`;
                }
            });
            const text = document.getElementById('fold-text') as HTMLDivElement;
            text.style.transform = this.folded ? 'rotateY(0deg)' : 'rotateY(180deg)';            
            this.folded = !this.folded;
        },
        select(id: string) {
            this.selected = `${id}-vue`;
        },
        editShape(index: number) {
            this.editIndex = index;
            this.editing = true;
        },
        async confirmEdit() {
            this.editing = false;
            await drawThumbnail();
            drawAllFields(true);
        },
        cancelEdit(node: node, shape: Shape, scale: number) {            
            this.editing = false;
            if (shape.type === 'circle' && node.radius && node.center) {
                shape.radius = node.radius;
                shape.center = node.center.slice() as [number, number];
            } else {
                if (node.node) shape.node = node.node;
            }
            editScale.set(shape, scale);
        },
        selectShape(index: number, objIndex: string) {
            shape[objIndex] = index;            
        },
        openSelectShape(index: string) {            
            this.beSelectedIndex = index;
            requestAnimationFrame(() => {
                this.selecting = true;
            });
        }
    },
    components: {
        ObjectsVue, ShapesVue, ShapeEditorVue, ShapeSelectorVue
    },
})
</script>

<style lang="less" scoped>

#right-bar {
    position: absolute;
    top: 0px;
    right: 0px;
    width: 300px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 200;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
}

#fold {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    position: absolute;
    top: 0px;
    right: 300px;
    width: 50px;
    height: 45px;
    box-shadow: 0px 0px 5px black, 5px 5px 5px black;
    background-color: rgba(100, 100, 100, 0.5);
    text-align: center;
    cursor: pointer;
    z-index: 200;
    user-select: none;
    transition: background-color 0.3s ease-out, right 0.5s ease-out;
    -webkit-transition: background-color 0.3s ease-out, right 0.5s ease-out;
}

#fold:hover {
    background-color: rgba(100, 100, 100, 0.8);
}

#list {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    position: absolute;
    bottom: 5px;
    right: 300px;
    width: 60px;
    box-shadow: 0px 0px 5px black, 5px 5px 5px black;
    background-color: rgba(100, 100, 100, 0.5);
    padding: 2px;
    z-index: 200;
    user-select: none;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
}

.select {
    margin: 4px;
    background-color: rgba(100, 100, 100, 0.5);
    text-align: center;
    color: #ddd;
    font-size: 20px;
    text-shadow: 1px 1px 3px black;
    box-shadow: 0px 0px 3px black;
    cursor: pointer;
    z-index: 200;
    border: 1px solid black;
    transition: all 0.2s ease-out;
    -webkit-transition: all 0.2s ease-out;
}

.select[status="true"] {
    background-color: rgba(160, 160, 160, 0.8);
}

.select:hover[status='false'] {
    background-color: rgba(130, 130, 130, 0.8);
}

#fold-text {
    font-size: 30px;
    color: white;
    text-shadow: 3px 3px 5px black;
    transition: transform 0.5s linear;
    -webkit-transition: transform 0.5s linear;
}

</style>