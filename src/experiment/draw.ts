import { app } from "./main";
import { Field, getFieldList, RoundObject, UniformElectricField } from "..";
import { getObjectList } from "..";

const canvases = [
    document.getElementById('objects') as HTMLCanvasElement,
    document.getElementById('fields') as HTMLCanvasElement
]

const objectList = getObjectList();
const fieldList = getFieldList();
const div = document.getElementById('app') as HTMLDivElement;
const objects = canvases[0];
const fields = canvases[1];
const objectsCtx = objects.getContext('2d');
const fieldsCtx = fields.getContext('2d');

// 注入绘制函数
app.addLoop(drawAllObjects);

// 初始化resize事件
resize();

window.addEventListener('resize', resize);

/** 窗口大小变化时 */
export function resize() {
    for (const canvas of canvases) {
        canvas.setAttribute('width', `${window.innerWidth}px`);
        canvas.setAttribute('height', `${window.innerHeight}px`);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
    }
    div.setAttribute('width', `${window.innerWidth}px`);
    div.setAttribute('height', `${window.innerHeight}px`);
    div.style.width = `${window.innerWidth}px`;
    div.style.height = `${window.innerHeight}px`;
}

/** 每帧绘制所有的物体 */
function drawAllObjects(): void {
    if (!(objectsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = Object.values(objectList);
    objectsCtx.clearRect(0, 0, parseFloat(objects.style.width || '0'), parseFloat(objects.style.height || '0'))
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
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = Object.values(fieldList);
    fieldsCtx.clearRect(0, 0, parseFloat(fields.style.width || '0'), parseFloat(fields.style.height || '0'))
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