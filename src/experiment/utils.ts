import { RoundObject, Shape, UniformElectricField } from "..";
import { drawAllFields } from "./draw";

/** 添加一个圆形物体 */
export function addRoundObject(name: string, radius: number, mass: number, x: number, y: number): RoundObject {
    const obj = new RoundObject(name, '', radius, mass);
    obj.setPosition(x, y);
    return obj;
}

/** 添加一个匀强电场 */
export function addUniformElectricField(name: string, magnitude: [number, number], shape: Shape): UniformElectricField {
    const field = new UniformElectricField(name, magnitude, shape);
    drawAllFields();
    return field;
}

export { Shape }