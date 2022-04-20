import { Field, GeneralObject } from "cnb-physics";

interface Target {
    electricField: Field<'electric'>[]
    gravityField: Field<'gravity'>[]
    object: GeneralObject[]
}

const handle = {};
const proxyTarget = {};

export const dynamic = new Proxy(proxyTarget, handle);

/** 选择某个物体 */
function select(ev: MouseEvent): void {

}