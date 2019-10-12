import Context from "./Context";
import { Component, ComponentAssembly } from "./Component";
import BitSet from "@marsraptor/bitset";

export default class Entity {
    private static count : number = 0;
    readonly id: number;
    readonly componentMask: BitSet;
    readonly systemMask: BitSet;
    readonly ctx: Context;
    constructor(ctx: Context) {
        this.id = Entity.count++;
        this.componentMask = new BitSet();
        this.systemMask = new BitSet();
        this.ctx = ctx;
    }

    set<T>(component: Component<T>,value: T) {
        this.ctx.setComponent(this.id, component, value);
        return this;
    }

    del(...component: Component<any>[]) {
       for (let index = 0; index < component.length; index++) {
           this.ctx.unsetComponent(this.id, component[index]);
       }
    }

    get<T>(component: Component<T>): T {
        return this.ctx.getComponent(this.id,component);
    }

    has<T>(component: Component<T>): boolean {
        return this.componentMask.get(component.id) == 1;
    }

    toJSON(): [Component<any>, any][]{
        let componentAssembly = new ComponentAssembly();
        let allComponents = Component.getComponentsForMask(this.componentMask);
        for (let index = 0; index < allComponents.length; index++) {
            componentAssembly.add( allComponents[index], this.get( allComponents[index]))
        }
        return componentAssembly.toJSON();
    }
}