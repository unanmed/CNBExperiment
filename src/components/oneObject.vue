<template>
    <div id="brief">
        <button id="detail" @click="triggerDetail()">{{detail ? '简略' : '详细'}}</button>
        <img id="image" :src="`/source/${obj.img}`"/>
        <span class="text">{{obj.name}}</span>
        <button class="create" @click="create(configs, obj.type)">创建</button>
    </div>
    <hr v-if="detail" />
    <div v-if="detail" v-for="config in obj.config" class="detail">
        <span class="input-prompt">{{getName(config.split(':')[0])}}</span>
        <span id="input-box" v-if="config.split(':')[1] !== 'choose'">
            <input class="input" type="text" v-model.trim="configs[config.split(':')[0]]"/>
            <span id="unit">{{config.split(':')[1]}}</span>
        </span>
        <div v-else id="select-box">
            <canvas id="select-canvas"></canvas>
            <button @click="$emit('choose', index)" class="select-button">选择</button>
        </div>
    </div>
</template>

<script lang="ts">
import { addElectricField, addRoundObject, drawShape } from "../experiment/utils";
import { Obj, getName, shapeList } from '../experiment/utils'
import objectList from '../resource/objects';
import { defineComponent } from "vue";

interface Config {
    x: string;
    y: string;
    vx: string;
    vy: string;
    radius: string;
    mass: string;
    charge: string;
    shape: string;
    electricMagnitudeX: string;
    electricMagnitudeY: string;
    scale: string;
    [key: string]: string;
}

export let shape: {[x:string]: number} = {}

export default defineComponent({
    name: 'ObjectsVue',
    emits: ['choose'],
    props: {
        obj: {
            type: Object,
            required: true
        },
        index: {
            required: true
        }
    },
    data() {
        return {
            detail: false,
            objectList,
            getName,
            shapeList,
            configs: {
                x: '0',
                y: '0',
                vx: '0',
                vy: '0',
                mass: '1',
                radius: '50',
                charge: '0',
                shape: '1',
                electricMagnitudeX: '100',
                electricMagnitudeY: '100',
                scale: '1',
            } as Config,
            shape,
        }
    },
    methods: {
        /** 由输入内容创建物品的配置项 */
        createConfig (config: Config, type: string): Obj<any> {
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
            if (type === 'electricField')
                c.magnitude = [parseFloat(c.electricMagnitudeX), parseFloat(c.electricMagnitudeY)];
            c.shape = shapeList[parseInt(c.shape)];
            return {
                type, config: c
            }
        },
        /** 创建物品 */
        create(config: Config, type: string) {
            const obj = this.createConfig(config, type);
            switch (type) {
                case 'ball': return addRoundObject(obj);            
                case 'electricField': return addElectricField(obj);
            }
        },
        triggerDetail() {
            this.detail = !this.detail;
            requestAnimationFrame(() => {
                const canvas = document.getElementById('select-canvas') as HTMLCanvasElement;
                if (!canvas) return;
                drawShape(parseInt(this.configs.shape), {
                    dx: 0,
                    dy: 0,
                    canvas: 'select-canvas',
                    scale: 1,
                    width: canvas.width,
                    height: canvas.height,
                    strokeStyle: '#ddd'
                });
            })
        }
    },
    mounted() {
        const target = JSON.parse(JSON.stringify(this.shape));
        const handler = {
            get: (target: any, key: string) => {
                if (key in target) {
                    return target[key];
                } else {
                    return 0;
                }
            },
            set: (target: any, key: string, value: number) => {
                if (key !== this.index) return true;
                target[key] = value;
                this.configs.shape = value.toString();
                const canvas = document.getElementById('select-canvas') as HTMLCanvasElement;
                drawShape(parseInt(this.configs.shape), {
                    dx: 0,
                    dy: 0,
                    canvas: 'select-canvas',
                    scale: 1,
                    width: canvas.width,
                    height: canvas.height,
                    strokeStyle: '#ddd'
                });
                return true;
            }
        }
        shape = this.shape = new Proxy(target, handler);
    }
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

#select-canvas {
    position: static;
    width: 50px;
    height: 25px;
    align-self: center;
    border: 1px solid white;
}

#select-box {
    display: flex;
    align-items: center;
    width: 50%;
    height: 20px;
    justify-content: space-between;
    align-self: center;
}

.select-button {
    background-color: rgba(0, 0, 0, 0.5);
    border: 2px solid #222;
    border-radius: 4px;
    color: white;
    width: 40%;
    font-size: 16px;
}

.select-button:hover {
    border: 2px solid #555;
}

.select-button:active {
    border: 2px solid #222;
}

</style>