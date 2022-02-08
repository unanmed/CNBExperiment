import { RoundObject, Shape, UniformElectricField } from "..";
import { drawAllFields } from "./draw";

export interface ObjectDict {
    ball: RoundObject
}

export interface Obj<K extends keyof ObjectDict> {
    type: K;
    x?: number;
    y?: number;
    config: ObjectDict[K];
}

/** 添加一个圆形物体 */
export function addRoundObject(config: Obj<'ball'>): RoundObject {
    const obj = new RoundObject('ball', config.config);
    return obj;
}

/** 添加一个匀强电场 */
export function addUniformElectricField(name: string, magnitude: [number, number], shape: Shape): UniformElectricField {
    const field = new UniformElectricField(name, magnitude, shape);
    drawAllFields();
    return field;
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
    }[type] || type;
}

export { Shape }