import { RoundObject, Shape, UniformElectricField } from "..";
import { drawAllFields, drawAllObjects } from "./draw";

export interface ObjectDict {
    ball: RoundObject
    electricField: UniformElectricField
}

export interface Obj<K extends keyof ObjectDict> {
    type: K;
    x?: number;
    y?: number;
    config: ObjectDict[K];
}

export interface BaseConfig {
    scale: number
    dx: number
    dy: number
}

export interface DrawConfig extends ComputeConfig {
    fillStyle?: string
    strokeStyle?: string
    node?: boolean
    canvas: string
    hover?: number
    noCache?: boolean
}

export interface ComputeConfig extends BaseConfig {
    width: number
    height: number
}

export const shapeList: Shape[] = [
    new Shape('circle', [100, 100], 100),
    new Shape('polygon', [0, 0], [[0, 0], [0, 100], [100, 100], [100, 0]]),
];

const scaleCache = new Map<Shape, { scale: number, center: [number, number] }>();

/** 添加一个圆形物体 */
export function addRoundObject(config: Obj<'ball'>): RoundObject {
    const obj = new RoundObject('ball', config.config);
    drawAllObjects();
    return obj;
}

/** 根据英文名获取中文名 */
export function getName(type: string): string {
    return {
        'mass': '质量',
        'radius': '半径',
        'x': 'x坐标',
        'y': 'y坐标',
        'vx': 'x速度',
        'vy': 'y速度',
        'charge': '电荷',
        'electricMagnitudeX': 'x场强',
        'electricMagnitudeY': 'y场强',
        'scale': '缩放',
        'shape': '形状',
    }[type] || type;
}

/** 居中圆形 */
export function centerCircle(shape: Shape, w: number, h: number) {
    const radius = shape.radius;
    const scale = (Math.min(w, h) - 10) / (radius * 2);
    return { radius: radius * scale }
}

/** 居中多边形 */
export function centerPolygon(shape: Shape, w: number, h: number, noCache?: boolean) {
    let scale = scaleCache.get(shape) as { scale: number, center: number[] };
    const res = getScale(shape, w, h) as { scale: number, center: [number, number] };
    if (!scale) {
        const t = { scale: res.scale, center: res.center }
        if (!noCache) {
            scaleCache.set(shape, t);
            scale = t;
        }
    }
    if (noCache) {
        return shape.node.map(v =>
            [(v[0] - res.center[0]) * res.scale + w / 2,
            (v[1] - res.center[1]) * res.scale + h / 2]
        );
    }
    else return shape.node.map(v =>
        [(v[0] - scale.center[0]) * scale.scale + w / 2,
        (v[1] - scale.center[1]) * scale.scale + h / 2]
    );
}

/** 获得图形相比于原图的比例 */
export function getScale(shape: Shape, w: number, h: number) {
    const aspect = w / h;
    const vertical = shape.node.map(v => v[1]);
    const horizon = shape.node.map(v => v[0]);
    const left = Math.min(...horizon);
    const right = Math.max(...horizon);
    const top = Math.min(...vertical);
    const bottom = Math.max(...vertical);
    const width = right - left;
    const height = bottom - top;
    const center = [left + width / 2, top + height / 2];
    const scale = width > height * aspect ? (w - 10) / width : (h - 10) / height;
    return { center, scale };
}

/** 获得计算后的多边形节点坐标 */
export function getComputedNode(index: number, config: ComputeConfig): Array<[number, number]> {
    return centerPolygon(shapeList[index], config.width, config.height).map(v =>
        [v[0] * config.scale + config.dx, v[1] * config.scale + config.dy]
    );
}

/** 获得形状的类型的中文名 */
export function getShapeTypeName(type: string): string {
    return {
        circle: '圆形',
        polygon: '多边形',
    }[type] || '未知';
}

/** 生成图形节点 */
export function generateNode(index: number) {
    const shape = shapeList[index];
    return shape.type === 'circle' ?
        [shape.center[0], shape.center[1]] :
        shapeList[index].node.slice();
}

/** 初始化画布 */
export function initCanvas(canvas: HTMLCanvasElement) {
    const style = getComputedStyle(canvas);
    canvas.width = parseInt(style.width);
    canvas.height = parseInt(style.height);
}

/** 绘制图形 */
export async function drawShape(index: number, config: DrawConfig): Promise<void> {
    const shape = shapeList[index];
    const canvas = document.getElementById(config.canvas) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const { dx, dy, width, height, scale } = config;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = config.strokeStyle || '#222';
    ctx.lineWidth = 2;
    ctx.fillStyle = config.fillStyle || '#6495ED';
    ctx.beginPath();
    if (shape.type === 'circle') { // 圆形
        const info = centerCircle(shape, width, height);
        ctx.arc(width / 2 * scale + dx, height / 2 * scale + dy, info.radius * scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        if (config.node) {
            if (config.hover === 0) ctx.fillStyle = '#777';
            else ctx.fillStyle = 'black';
            ctx.fillRect(width / 2 * scale + dx - 5, height / 2 * scale + dy - 5, 10, 10);
        }
    } else { // 多边形
        const info = centerPolygon(shape, width, height, config.noCache);
        ctx.moveTo(info[0][0] * scale + dx, info[0][1] * scale + dy);
        for (const [x, y] of info) {
            ctx.lineTo(x * scale + dx, y * scale + dy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (config.node) {
            info.forEach((v, i) => {
                if (config.hover === i) ctx.fillStyle = '#777';
                else ctx.fillStyle = 'black';
                ctx.fillRect(v[0] * scale + dx - 5, v[1] * scale + dy - 5, 10, 10);
            });
        }
    }
}

/** 修改图形的节点 */
export function changeNode(shape: Shape, index: number, dx: number, dy: number, config: ComputeConfig) {
    // 解析出鼠标位置对应的图形位置
    const res = scaleCache.get(shape) as { scale: number, center: [number, number] };
    const [nx, ny] = shape.node[index];
    const { scale } = config;
    const [tx, ty] = [nx + dx / scale / res.scale, ny + dy / scale / res.scale];
    // 修改
    if (shape.type === 'circle') {

    } else {
        shape.node[index] = [tx, ty];
    }
}

/** 添加电场 */
export function addElectricField(config: Obj<'electricField'>) {
    const field = new UniformElectricField('electric',
        config.config.magnitude, config.config.shape, config.config.position);
    drawAllFields();
}

/** 绘制比例尺 */
export function drawScale(shape: Shape, config: DrawConfig) {
    const dict = {
        '1000': 'km',
        '1': 'm',
    }
    let unit = 'm';
    const nums = [1, 10, 100, 500, 1000];
    const canvas = document.getElementById(config.canvas) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const scale = getScale(shape, config.width, config.height).scale;
    const right = config.width - 20;
    const bottom = config.height - 20;
    const length = 100 / scale / config.scale;
    let drawLength = 0;
    let ruler = 100;
    if (length > 10000) unit = 'km';
    for (let i = 4; i >= 0; i--) {
        if (unit === 'm') {
            if (length * 100 / nums[i] > 50 || i === 0) {
                ruler = nums[i];
                drawLength = ruler * 100 / length;
                break;
            }
        } else {
            if (length * 100 / nums[i] > 50000) {
                ruler = nums[i];
                drawLength = ruler * 100000 / length;
                break;
            }
        }
    }
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(right, bottom - 10);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right - drawLength, bottom);
    ctx.lineTo(right - drawLength, bottom - 10);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#222';
    ctx.font = '16px 20 Arial';
    ctx.fillText(`${ruler}${unit}`, right - drawLength / 2, bottom - 10);
    console.log(ruler);

}