<template>
    <div v-for="(obj, i) of objectList" class="object">
        <one-object-vue @choose="choose" :obj="obj" :index="i"></one-object-vue>
    </div>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import OneObjectVue from "./oneObject.vue";
import objectList from '../resource/objects';

export default defineComponent({
    name: "ObjectsVue",
    emits: ['choose'],
    data() {
        return {
            objectList,
        }
    },
    components: {
        OneObjectVue
    },
    methods: {
        choose(index: string): void {
            this.$emit('choose', index);
        }
    }
})

</script>

<style lang="less">

.object {
    margin: 3%;
    padding: 2%;
    border: 2px solid #222;
    border-radius: 10px;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
}

</style>