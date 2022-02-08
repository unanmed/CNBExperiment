<template>
    <div id="left-bar" style="z-index: 200;">
        <img @click="triggerFold()" id="settings" class="settings" src="/src/assets/settings.png" style="width: 48px; height: 48px;">
        <span id="hr"></span>
        <img v-if="app.status === 'paused'" @click="triggerPlaying()" class="settings" id="play" src="/src/assets/play.png" style="width: 40px; margin-right: 6px;">
        <img v-else @click="triggerPlaying()" class="settings" id="pause" src="/src/assets/pause.png" style="width: 40px; margin-right: 6px;">
        <img class="settings" @click="changeSpeed('down')" id="speeddown" src="/src/assets/speeddown.png" style="width: 40px; margin-right: 6px;">
        <input type="range" max="10" min="0.1" step="0.1" v-model="app.speed" >
        <img class="settings" @click="changeSpeed('up')" id="speedup" src="/src/assets/speedup.png" style="width: 40px; margin-right: 6px;">
        <span id="hr"></span>
        <span id="speed" style="padding-left: 2px;">×{{app.speed}}</span>
    </div>
</template>

<script lang="ts">

import { defineComponent } from "vue"
import { app } from "../experiment/main";

export default defineComponent({
    name: 'LeftBar',
    data: () => ({
        app,
        folded: false,
    }),
    methods: {
        triggerPlaying() {
            const status = app.status;
            if (status === 'running') app.pause();
            else if (status === 'paused') app.resume();
        },
        triggerFold() {
            const settings = document.getElementById('settings') as HTMLImageElement;
            const now = /rotate\([0-9]+deg\)/.exec(settings.style.transform) || [];
            const angle = parseInt((/[0-9]+/.exec(now[0]) || [])[0] || '0');            
            settings.style.transform = `rotate(${angle + 90}deg)`;
            const root = document.getElementById('left-bar') as HTMLDivElement;
            const hr = document.getElementById('hr') as HTMLSpanElement;
            if (!this.folded) {
                root.style.width = '48px';
                setTimeout(() => {
                    hr.style.display = 'none';
                }, 500);
            } else {
                root.style.width = '375px';
                hr.style.display = 'block';
            }
            this.folded = !this.folded;
        },
        changeSpeed(type: 'up' | 'down') {
            const speed = this.app.speed;
            if (type === 'up') {
                if (speed < 10) this.app.speed = parseFloat((speed + 0.1).toFixed(1));
            } else {
                if (speed > 0.1) this.app.speed = parseFloat((speed - 0.1).toFixed(1));
            }
        }
    }
});
</script>

<style lang="less" scoped>

#left-bar {
    background-color: #666;
    stroke: none;
    border-radius: 10px;
    position: absolute;
    left: 10px;
    top: 10px;
    width: 375px;
    height: 48px;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
    display: flex;
    overflow: hidden;
    align-items: center;
}

#hr {
    border-left: 2px solid #222;
    font-size: 0;
    height: 48px;
    margin-right: 6px;
}

.settings {
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
    cursor: pointer;
}

.settings:hover {
    filter: drop-shadow(0 0 4px #222);
}

#speed {
    font-size: 20px;
    color: white;
    text-align: center;
}

input[type=range] {
    appearance: none;
    width: 114px;
    height: 10px;
    background: linear-gradient(to right, rgb(0, 255, 0), white);
    border-radius: 5px;
    margin-right: 6px;
    transition: all 0.5s ease-out;
    -webkit-transition: all 0.5s ease-out;
}

input[type=range]::-webkit-slider-thumb {
    appearance: none;
    width: 8px;
    height: 20px;
    background: #555;
    border-radius: 5px;
    cursor: pointer;
}

</style>