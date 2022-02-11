<template>
    <div id="right-bar" class="bar">
        <ObjectsVue v-if="selected === 'objects'" v-for="obj of objectList" :_name="obj.name" :_type="obj.type" :_img="obj.img"></ObjectsVue>
        <ShapesVue v-if="selected === 'shapes'"></ShapesVue>
    </div>
    <div id="fold" class="bar" @click="triggerFold()">{{folded ? '◀' : '▶'}}</div>
    <div id="list" class="bar">
        <div @click="select(one.id)" v-for="one of selectList" class="select" v-bind:status="selected === one.id">{{one.text}}</div>
    </div>
</template>

<script lang="ts">
import objects from "../resource/objects";
import ObjectsVue from "./object.vue";
import { defineComponent } from "vue";
import { shapeList } from "../experiment/utils";
import ShapesVue from "./shapes.vue";
import { drawThumbnail } from "./shapes.vue";

const objectList = Object.values(objects);

const selectList = [
    { id: 'objects', text: '物体' },
    { id: 'shapes', text: '形状' }
];

function initStyle(ele: HTMLElement): void {
    if (ele.id === 'fold' || ele.id === 'list') ele.style.right = '300px';
    else ele.style.right = '0px';
}

export default defineComponent({
    name: "RightBar",
    data: () => {
        return {
            objectList, shapeList, selectList,
            folded: false,
            selected: 'objects'
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
            this.folded = !this.folded;
        },
        select(id: string) {
            this.selected = id;
            if (id === 'shapes') setTimeout(drawThumbnail, 100);
        }
    },
    components: {
        ObjectsVue, ShapesVue
    }
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
    font-size: 30px;
    color: white;
    width: 50px;
    height: 45px;
    box-shadow: 0px 0px 5px black, 5px 5px 5px black;
    text-shadow: 3px 3px 5px black;
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
}

.select[status="true"] {
    background-color: rgba(140, 140, 140, 0.8);
}

</style>