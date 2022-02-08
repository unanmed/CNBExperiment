<template>
    <div id="right-bar">
        <ObjectsVue v-for="obj of list" :_name="obj.name" :_type="obj.type"></ObjectsVue>
    </div>
</template>

<script lang="ts">
import objects from "../resource/objects";
import ObjectsVue from "./object.vue";
import { defineComponent } from "vue";

const list = Object.values(objects);

export default defineComponent({
    name: "RightBar",
    setup: () => {
        return {
            list
        };
    },
    methods: {

    },
    components: {
        ObjectsVue
    }
})
</script>

<style lang="less" scoped>

#right-bar {
    position: fixed;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 200;
    transition: right 0.5s ease-out;
    -webkit-transition: right 0.5s ease-out;
}

</style>