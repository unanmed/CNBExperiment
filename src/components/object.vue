<template>
    <div class="object">
        <div id="brief">
            <button id="detail" @click="triggerDetail()">{{detail ? '简略' : '详细'}}</button>
            <img id="image" :src="`/source/${_img}`"/>
            <span class="text">{{_name}}</span>
            <button class="create" @click="create(configs)">创建</button>
        </div>
        <hr v-if="detail" />
        <div v-if="detail" v-for="config in (obj[_type] || {}).config" class="detail">
            <span class="input-prompt">{{getName(config.split(':')[0])}}</span>
            <span id="input-box">
                <input class="input" type="text" v-model.trim="configs[config.split(':')[0]]"/>
                <span id="unit">{{config.split(':')[1]}}</span>
            </span>
        </div>
    </div>
</template>

<script lang="ts">

import { addRoundObject } from "../experiment/utils";
import { Obj, getName } from '../experiment/utils'
import objects from '../resource/objects';
import { defineComponent } from "vue";

interface Config {
    x: string;
    y: string;
    vx: string;
    vy: string;
    radius: string;
    mass: string;
    charge: string;
    [key: string]: string;
}

const config: Config = {
    x: '0',
    y: '0',
    vx: '0',
    vy: '0',
    mass: '1',
    radius: '50',
    charge: '0'
}

export default defineComponent({
    name: 'ObjectsVue',
    props: {
        _name: {
            type: String,
            required: true
        },
        _type: {
            type: String,
            required: true
        },
        _img: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            detail: false,
            obj: objects,
            getName, configs: config,
        }
    },
    methods: {
        createConfig (config: Config): Obj<any> {
            const c: {[x: string]: any} = {}
            for (const key in config) {
                const num = parseFloat(config[key]);
                if (!isNaN(num)) {
                    c[key] = num;
                } else {
                    c[key] = config[key];
                }
            }
            c.position = [c.x, c.y];
            c.velocity = [c.vx, c.vy];
            return {
                type: this._type, config: c
            }
        },
        create(config: Config) {
            const obj = this.createConfig(config);
            return addRoundObject(obj);
        },
        triggerDetail() {
            this.detail = !this.detail;
        }
    },
});

</script>

<style lang="less" scoped>

#detail {
    font-size: 1em;
    color: white;
    text-align: center;
    font-family: '微软雅黑';
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid #222;
    border-radius: 4px;
    justify-self: start;
}

#detail:hover {
    border: 2px solid #555;
}

#detail:active {
    border: 2px solid #222;
}

#brief {
    display: flex;
    justify-items: center;
    justify-content: center;
    width: 100%;
}

.detail {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

#image {
    width: 40px;
    height: 40px;
    align-self: center;
    margin-left: 2%;
}

.create {
    justify-self: end;
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid #222;
    border-radius: 4px;
    color: white;
    width: 20%;
    font-size: 16px;
}

.create:hover {
    border: 2px solid #555;
}

.create:active {
    border: 2px solid #222;
}

.object {
    margin: 3%;
    padding: 2%;
    border: 2px solid #222;
    border-radius: 10px;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
}

.text {
    font-size: 1.5em;
    color: white;
    text-align: center;
    font-family: '微软雅黑';
    align-self: center;
    margin-left: 10%;
    margin-right: 10%;
}

.input-prompt {
    font-size: 1.5em;
    color: white;
    text-align: center;
    font-family: '微软雅黑';
    align-self: center;
    margin-left: 5%;
    margin-right: 5%;
}

.input {
    height: 20px;
    color: white;
    background-color: transparent;
    align-self: center;
    justify-self: right;
    font-size: 18px;
    font-family: '微软雅黑';
    border: none;
    width: 80%;
}

.input:focus {
    outline-style: none;
}

#input-box {
    display: flex;
    align-items: center;
    width: 50%;
    background-color: #222;
    height: 20px;
    justify-content: space-between;
    align-self: center;
}

#unit {
    color: rgba(150, 150, 150, 0.5);
    text-align: right;
}

hr {
    border: 1px solid #222;
}

</style>