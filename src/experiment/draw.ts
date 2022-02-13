import { app } from "./main";
import { Field, FieldList, getFieldList, RoundObject, ScopedField, UniformElectricField } from "..";
import { getObjectList } from "..";

type Arrow = { x1: number, x2: number, y1: number, y2: number };

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
        drawAllFields();
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
        if (obj.position.some(v => !Number.isFinite(v))) continue;
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

/** 场箭头缓存 */
const fieldCache: { [key: string]: Array<Arrow> } = {};

/** 绘制所有场，重力场除外 */
export function drawAllFields(noCache: boolean = false): void {
    const fieldsCtx = Draw.contexts.fields;
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = Object.values(Draw.fieldList);
    fieldsCtx.clearRect(0, 0, parseFloat(Draw.canvases.fields.style.width || '0'),
        parseFloat(Draw.canvases.fields.style.height || '0'))
    for (const field of arr) {
        if (field instanceof ScopedField) drawField(field, noCache);
    }
}

/** 绘制电场|磁场的背景 */
function drawFieldBack<K extends keyof FieldList>(field: ScopedField<K>) {
    const fieldsCtx = Draw.contexts.fields;
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    fieldsCtx.fillStyle = 'rgba(100, 100, 255, 0.3)';
    fieldsCtx.strokeStyle = 'rgba(68, 219, 255, 0.7)';
    fieldsCtx.lineWidth = 2;
    const [px, py] = field.position;
    if (field.shape.type === 'circle') {
        const [x, y] = field.shape.center;
        fieldsCtx.arc(x + px, y + py, field.shape.radius, 0, Math.PI * 2);
    } else if (field.shape.type === 'polygon') {
        fieldsCtx.beginPath();
        fieldsCtx.moveTo(field.shape.node[0][0] + px, field.shape.node[0][1] + py);
        for (const [x, y] of field.shape.node) {
            fieldsCtx.lineTo(x + px, y + py);
        }
        fieldsCtx.closePath();
    }
    fieldsCtx.fill();
    fieldsCtx.stroke();
}

/** 生成电场的箭头起始和结尾坐标 */
function getElectricArrowPoints(field: UniformElectricField): Array<Arrow> {
    // 由电场的强弱获取箭头的密度
    let density = Math.ceil(Math.log10(field.magnitude[0] ** 2 + field.magnitude[1] ** 2)) * 2;
    const res: Array<Arrow> = [];
    let horizonDensity;
    let radius;
    let left;
    let right;
    let top;
    let bottom;
    let node;
    let arr;
    let horizon;
    let vertical;
    // 分情况，圆形还是多边形
    if (field.shape.type === 'circle') {
        radius = field.shape.radius;
        left = field.shape.center[0] - radius;
        right = field.shape.center[0] + radius;
        top = field.shape.center[1] - radius;
        bottom = field.shape.center[1] + radius;
        // 圆形
        if (field.magnitude[1] > field.magnitude[0]) {
            horizonDensity = density;
            density = (right - left) / (bottom - top) * density
                * field.magnitude[0] / field.magnitude[1];
        } else {
            horizonDensity = (right - left) / (bottom - top) * density
                * field.magnitude[1] / field.magnitude[0];
        }
    } else {
        // 多边形
        node = field.shape.node;
        arr = node.slice();
        horizon = arr.map(item => item[0]);
        vertical = arr.map(item => item[1]);
        left = Math.min(...horizon);
        right = Math.max(...horizon);
        top = Math.min(...vertical);
        bottom = Math.max(...vertical);
        if (field.magnitude[1] > field.magnitude[0]) {
            horizonDensity = density;
            density = (right - left) / (bottom - top) * density
                * field.magnitude[0] / field.magnitude[1];
        } else {
            horizonDensity = (right - left) / (bottom - top) * density
                * field.magnitude[1] / field.magnitude[0];
        }
    }
    // 生成箭头的起始和结束点
    if (field.magnitude[0] !== 0) {
        for (let i = 0; i <= density; i++) {
            const [x1, y1] = [left, top + (bottom - top) * i / density];
            const [x2, y2] = [right, y1 + (right - left) * field.magnitude[1] / field.magnitude[0]];
            res.push({ x1, x2, y1, y2 });
        }
    }
    if (field.magnitude[1] !== 0) {
        for (let i = 0; i <= horizonDensity; i++) {
            const [x3, y3] = [left + (right - left) * i / horizonDensity, top];
            const [x4, y4] = [x3 + (bottom - top) * field.magnitude[0] / field.magnitude[1], bottom];
            res.push({ x1: x3, x2: x4, y1: y3, y2: y4 });
        }
    }
    return res;
}

/** 检测箭头与多边形的交点 */
function intersectPolygon(node: Array<[number, number]>, arrow: Arrow): Arrow[] {
    let intersection: Array<[number, number]> = []
    // 依次遍历求交点
    const [x3, y3] = [arrow.x1, arrow.y1];
    const [x4, y4] = [arrow.x2, arrow.y2];
    node.forEach((v, i) => {
        // 判断是否有交点
        const [x1, y1] = v;
        const [x2, y2] = node[i === node.length - 1 ? 0 : i + 1];
        if ((x1 === x3 && x2 === x4 && y1 === y3 && y2 === y4) ||
            (x1 === x4 && x2 === x3 && y1 === y4 && y2 === y3)) return;
        // 如果箭头两端在线段上，则也算是交点
        if (intersectBoundary({ x1, x2, y1, y2 }, [x3, y3])) return intersection.push([x3, y3]);
        if (intersectBoundary({ x1, x2, y1, y2 }, [x4, y4])) return intersection.push([x4, y4]);
        const area1 = (x1 - x3) * (y2 - y3) - (y1 - y3) * (x2 - x3);
        const area2 = (x1 - x4) * (y2 - y4) - (y1 - y4) * (x2 - x4);
        if (area1 * area2 >= 0) return;
        const area3 = (x3 - x1) * (y4 - y1) - (y3 - y1) * (x4 - x1);
        const area4 = area3 + area1 - area2;
        if (area3 * area4 >= 0) return;
        // 计算交点坐标
        const t = area3 / (area2 - area1);
        const x = x1 + t * (x2 - x1);
        const y = y1 + t * (y2 - y1);
        intersection.push([x, y]);
    });
    // 有序化
    const sign = Math.sign(arrow.x1 - arrow.x2)
    intersection.sort((a, b) => sign * (b[0] - a[0]));
    // 相邻去重
    intersection = intersection.filter((v, i) => i === 0 ||
        (v[0] !== intersection[i - 1][0] || v[1] !== intersection[i - 1][1]));

    // 偶数索引一定在多边形内部
    return intersection.map(([x1, y1], i, a) =>
        ({ x1, x2: (a[i + 1] || [])[0], y1, y2: (a[i + 1] || [])[1] }))
        .filter((v, i) => i % 2 === 0 && v.x2);
}

/** 检测是否与边界有交点 */
function intersectBoundary(node: Arrow, point: [number, number]): boolean {
    return (node.x1 - point[0]) * (point[1] - node.y2) ===
        (node.y1 - point[1]) * (point[0] - node.x2) &&
        (node.x1 - point[0]) * (node.x2 - point[0]) <= 0 &&
        (node.y1 - point[1]) * (node.y2 - point[1]) <= 0;
}

/** 检测箭头与圆形的交点 */
function intersectCircle(center: [number, number], radius: number, arrow: Arrow): Arrow | undefined {
    const [x1, y1] = [arrow.x1, arrow.y1];
    const [x2, y2] = [arrow.x2, arrow.y2];
    const [x0, y0] = center;
    // 直线方程 y = kx + m
    const k = (y2 - y1) / (x2 - x1);
    const m = y1 - k * x1;
    // 联立求得方程
    // (k ** 2 + 1)x ** 2 + 2(k(b - y0) - x0)x + (x0 ** 2 + (b - y0) ** 2 - r ** 2) = 0
    const a = k * k + 1;
    const b = 2 * (k * (m - y0) - x0);
    const c = x0 * x0 + (m - y0) * (m - y0) - radius * radius;
    // 判别式
    const delta = b * b - 4 * a * c;
    if (delta < 0) return;
    const sqrtDelta = Math.sqrt(delta);
    // 求解
    const _x1 = (-b + sqrtDelta) / (2 * a);
    const _x2 = (-b - sqrtDelta) / (2 * a);
    const _y1 = k * _x1 + m;
    const _y2 = k * _x2 + m;
    return { x1: _x2, x2: _x1, y1: _y2, y2: _y1 };
}

/** 绘制电场的箭头 */
function drawElectricArrow(field: UniformElectricField, noCache: boolean = false) {
    const fieldsCtx = Draw.contexts.fields;
    if (!(fieldsCtx instanceof CanvasRenderingContext2D)) return;
    const arr = getElectricArrowPoints(field);
    const [px, py] = field.position
    let info;
    if (!fieldCache[field.id] || noCache) {
        let cache: Array<Arrow> = [];
        // 判断与边界的交点，仍然将圆形与多边形分开
        if (field.shape.type === 'circle') {
            for (const { x1, x2, y1, y2 } of arr) {
                info = intersectCircle(field.shape.center, field.shape.radius, { x1, x2, y1, y2 });
                if (info) cache.push(info);
            }
        } else if (field.shape.type === 'polygon') {
            for (const { x1, x2, y1, y2 } of arr) {
                info = intersectPolygon(field.shape.node, { x1, x2, y1, y2 });
                if (info.length) cache.push(...info);
            }
        }
        // 去重
        for (let i = 0; i < cache.length; i++) {
            if (cache.some((vv, ii) => ii !== i && JSON.stringify(vv) === JSON.stringify(cache[i]))) {
                cache.splice(i, 1);
                i--;
            }
        }
        fieldCache[field.id] = info = cache;
    } else {
        info = fieldCache[field.id];
    }
    // 绘制箭头体
    fieldsCtx.strokeStyle = 'rgba(68, 219, 255, 0.7)';
    fieldsCtx.lineWidth = 1;
    fieldsCtx.beginPath();
    for (const { x1, x2, y1, y2 } of info) {
        fieldsCtx.moveTo(x1 + px, y1 + py);
        fieldsCtx.lineTo(x2 + px, y2 + py);
        // 绘制箭头的头部
        const sqrt2 = Math.SQRT1_2;
        const [x0, y0] = [(x2 - x1) * sqrt2, (y2 - y1) * sqrt2];
        const [x3, y3] = [x2 - (x0 - y0) * sqrt2 / 15, y2 - (x0 + y0) * sqrt2 / 15];
        const [x4, y4] = [x2 - (x0 + y0) * sqrt2 / 15, y2 + (x0 - y0) * sqrt2 / 15];
        fieldsCtx.moveTo(x2 + px, y2 + py);
        fieldsCtx.lineTo(x3 + px, y3 + py);
        fieldsCtx.moveTo(x2 + px, y2 + py);
        fieldsCtx.lineTo(x4 + px, y4 + py);
    }
    fieldsCtx.closePath();
    fieldsCtx.stroke();
}

/** 绘制一个匀强电场|磁场 */
export function drawField<K extends keyof FieldList>(field: ScopedField<K>, noCache: boolean = false): void {
    drawFieldBack(field);
    if (field instanceof UniformElectricField) drawElectricArrow(field, noCache);
}