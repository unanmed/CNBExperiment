const objects: { [x: string]: { type: string, name: string, img: string, config: Array<string> } } = {
    'ball': {
        type: 'ball', name: '小球', img: 'ball.png',
        // 小球的配置及类型
        config: ['radius:m', 'x:m', 'y:m', 'mass:kg', 'vx:m/s', 'vy:m/s'],
    },
}

export default objects;