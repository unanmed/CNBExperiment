import { Shape } from "..";

const objects: { [x: string]: { type: string, name: string, img: string, config: Array<string>, shape?: Shape } } = {
    'ball': {
        type: 'ball', name: '小球', img: 'ball.png',
        // 小球的配置及类型
        config: ['radius:m', 'x:m', 'y:m', 'mass:kg', 'vx:m/s', 'vy:m/s', 'charge:C'],
    },
    'electricField': {
        type: 'electricField', name: '电场', img: 'electricField.png',
        config: ['x:m', 'y:m', 'scale:', 'electricMagnitudeX:N/C', 'electricMagnitudeY:N/C', 'shape:choose'],
    }
}

export default objects;