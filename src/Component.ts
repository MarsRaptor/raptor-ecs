import BitSet from "@marsraptor/bitset";

export class Component<T> {

    private static count: number = 0;
    private static readonly registeredByIndex: Record<number, Component<any>> = {}
    private static readonly registeredByName: Record<string, Component<any>> = {}

    readonly id: number;
    readonly name: string;
    private constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }

    toJSON() {
        return this.name;
    }

    static new<T>(name: string): Component<T> {
        if ( Component.registeredByName[name] !== undefined) {
            throw Error(`Component \"${name}\" already registered`)
        }
        const index = Component.count++;
        const value = new Component(index, name);
        Component.registeredByIndex[index] = value;
        Component.registeredByName[name] = value;
        return value
    }

    static getComponentsForMask(mask: BitSet): Component<any>[] {
        let components: Component<any>[] = [];
        let indices = mask.toArray();
        for (let index = 0; index < indices.length; index++) {
            components.push(Component.registeredByIndex[indices[index]]);
        }
        return components;
    }

    static forName(name: string): Component<any> ;
    static forName(...name:  string[]):  Component<any>[] ;
    static forName(n: string | string[]): Component<any> | Component<any>[] {
        if (Array.isArray(n)) {
            let components: Component<any>[] = [];
            for (let index = 0; index < n.length; index++) {
                components.push(Component.forName(n[index]));
            }
            return components;
        } else {         
            if (Component.registeredByName[n] === undefined) {
                throw Error(`Component \"${n}\" is not registered`)
            }   
            return Component.registeredByName[n];
        }
    }
}

export type aspect = { allOf?: Component<any>[], noneOf?: Component<any>[], oneOf?: Component<any>[] }

export class ComponentAssembly {
    private _components: { component: Component<any>, value: any }[] = [];
    constructor(...components: [Component<any>, any][]) {
        this._components = components.map((value) => {
            return {
                component: value[0], value: value[1]
            }
        });
    }
    get components(): { component: Component<any>, value: any }[] { return this._components };
    add<T extends Object>(component: Component<T>, value: T): ComponentAssembly {
        this._components.push({ component: component, value: value })
        return this;
    }

    toJSON(): [Component<any>, any][]{
        return this.components.map((item)=>{
            return [item.component,item.value];
        });
    }

    static parseString(raw:string){
        let rawComponentAssembly=JSON.parse(raw) as [string, any][];
        return new ComponentAssembly(
            ...rawComponentAssembly.map((item)=>{
                return [
                    Component.forName(item[0]),
                    item[1]
                ] as [Component<any>, any]
            })
        );
    }
    static parse(rawComponentAssembly: [string, any][]){
        return new ComponentAssembly(
            ...rawComponentAssembly.map((item)=>{
                return [
                    Component.forName(item[0]),
                    item[1]
                ] as [Component<any>, any]
            })
        );
    }
}