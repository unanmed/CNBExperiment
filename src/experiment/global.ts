import { Shape } from "cnb-physics";
import * as draw from './draw';

/** 编辑图形时的每个图形的缩放比例 */
export const editScale = new Map<Shape, number>();

const resizeTarget = {
    scale: 1
};
const resizeHandler = {
    set(target: any, key: string, value: number): boolean {
        target[key] = value;
        requestAnimationFrame(() => {
            draw.drawAllFields();
            draw.drawAllObjects();
        })
        return true;
    },
    get(target: any, key: string): any {
        return target[key];
    }
};

/** 界面缩放及位置等 */
export const resize = new Proxy(resizeTarget, resizeHandler);