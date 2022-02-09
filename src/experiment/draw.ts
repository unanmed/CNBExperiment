import { app } from "./main";
import { getFieldList, RoundObject, UniformElectricField } from "..";
import { getObjectList } from "..";

export class Draw {
    static canvases: { [key: string]: HTMLCanvasElement } = {};
    static contexts: { [key: string]: CanvasRenderingContext2D } = {};
    static div: HTMLDivElement;
    static objectList = getObjectList();
    static fieldList = getFieldList();

    /** 创建实例 */
    constructor() {
        this.init();
        Draw.div = document.getElementById('app') as HTMLDivElement;
        this.initDraw();
    }

    /** 初始化画布 */
    init() {
        ['objects', 'fields'].forEach(key => {
            const canvas = document.getElementById(key) as HTMLCanvasElement;
            Draw.canvases[key] = canvas;
            Draw.contexts[key] = canvas.getContext('2d') as CanvasRenderingContext2D;
        });
    }

    initDraw() {
        // 注入绘制函数
        app.addLoop(drawAllObjects);

        // 初始化resize事件
        this.resize();

        window.addEventListener('resize', this.resize);
    }

    /** 窗口大小变化时 */
    resize() {
        const list = Object.values(Draw.canvases);
        for (const canvas of list) {
            canvas.setAttribute('width', `${window.innerWidth}px`);
            canvas.setAttribute('height', `${window.innerHeight}px`);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        }
        Draw.div.setAttribute('width', `${window.innerWidth}px`);
        Draw.div.setAttribute('height', `${window.innerHeight}px`);
        Draw.div.style.width = `${window.innerWidth}px`;
        Draw.div.style.height = `${window.innerHeight}px`;
    }
}

/** 每帧绘制所有的物体 */
export function drawAllObjects(): void {
    const objectsCtx = Draw.contexts.objects;
    if (!(objectsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = Object.values(Draw.objectList);
    objectsCtx.clearRect(0, 0, parseFloat(Draw.canvases.objects.style.width || '0'),
        parseFloat(Draw.canvases.objects.style.height || '0'))
    for (const obj of arr) {
        if (obj instanceof RoundObject) {
            // 绘制圆形物体
            const [x, y] = obj.position;
            const gra = objectsCtx.createRadialGradient(x, y, 0, x, y, obj.radius);
            gra.addColorStop(0, 'white');
            gra.addColorStop(1, 'green');
            objectsCtx.fillStyle = gra;
            objectsCtx.beginPath();
            objectsCtx.arc(obj.position[0], obj.position[1], obj.radius, 0, Math.PI * 2);
            objectsCtx.fill();
        }
    }
}

/** 绘制所有场，重力场除外 */
export function drawAllFields(): void {
    const fieldsCtx = Draw.contexts.fields;
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = Object.values(Draw.fieldList);
    fieldsCtx.clearRect(0, 0, parseFloat(Draw.canvases.fields.style.width || '0'),
        parseFloat(Draw.canvases.fields.style.height || '0'))
    for (const field of arr) {
        // 电场
        if (field.type === 'electric' && field instanceof UniformElectricField) {
            if (field.shape.type === 'circle') {
                const [x, y] = field.shape.center;
                fieldsCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                fieldsCtx.beginPath();
                fieldsCtx.arc(x, y, field.shape.radius, 0, Math.PI * 2);
                fieldsCtx.fill();
            } else if (field.shape.type === 'polygon') {
                fieldsCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                fieldsCtx.beginPath();
                fieldsCtx.moveTo(field.shape.node[0][0], field.shape.node[0][1]);
                for (const [x, y] of field.shape.node) {
                    fieldsCtx.lineTo(x, y);
                }
                fieldsCtx.closePath();
                fieldsCtx.fill();
            }
        }
    }
}

/** 绘制一个电场 */
export function drawField(field: UniformElectricField): void {
    const fieldsCtx = Draw.contexts.fields;
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    if (field.shape.type === 'circle') {
        const [x, y] = field.shape.center;
        fieldsCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        fieldsCtx.beginPath();
        fieldsCtx.arc(x, y, field.shape.radius, 0, Math.PI * 2);
        fieldsCtx.fill();
    } else if (field.shape.type === 'polygon') {
        fieldsCtx.fillStyle = 'rgba(0, 0, 255, 0.5)';
        fieldsCtx.beginPath();
        fieldsCtx.moveTo(field.shape.node[0][0], field.shape.node[0][1]);
        for (const [x, y] of field.shape.node) {
            fieldsCtx.lineTo(x, y);
        }
        fieldsCtx.closePath();
        fieldsCtx.fill();
    }
}