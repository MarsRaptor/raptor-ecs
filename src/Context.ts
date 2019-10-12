import Entity from "./Entity";
import { EventManager } from "library-event-manager";
import System from "./System";
import { ComponentAssembly, Component } from "./Component";
import { fastSplice } from "./util/ArrayUtils";
import { LIB_NAME } from ".";

export default class Context {
    private entities: Record<number, Entity>;
    private components: Record<number, Record<number, any>>;
    private systems: System[];
    readonly eventManager: EventManager;

    constructor() {
        this.entities = {};
        this.components = {};
        this.systems = [];
        this.eventManager = new EventManager();
    }

    //#region ENTITY HANDLING 
    public createEntity(componentAssembly?: ComponentAssembly): Entity {
        let entity = new Entity(this);
        this.entities[entity.id] = entity;
        if (componentAssembly) {
            for (let index = 0; index < componentAssembly.components.length; index++) {
                this.setComponent(entity.id, componentAssembly.components[index].component, componentAssembly.components[index].value);
            }
        }
        return entity;
    }

    public hasEntity(entity: Entity): boolean;
    public hasEntity(entityId: number): boolean;
    public hasEntity(e: Entity | number): boolean {
        const entity = (typeof e === "number") ? this.entities[e] : e;
        return this.entities[entity.id] !== undefined;
    }

    public getEntity(entityId: number): Entity {
        return this.entities[entityId];
    }

    public removeEntity(entity: Entity): void;
    public removeEntity(entityId: number): void;
    public removeEntity(e: Entity | number): void {
        const entity = (typeof e === "number") ? this.entities[e] : e;
        let allComponents = Component.getComponentsForMask(entity.componentMask);
        for (let index = 0; index < allComponents.length; index++) {
            this.unsetComponent(entity.id, allComponents[index]);
        }
        delete this.entities[entity.id];
    }
    //#endregion

    //#region COMPONENT HANDLING
    public setComponent<T>(entity: Entity, component: Component<T>, value: T): T;
    public setComponent<T>(entityId: number, component: Component<T>, value: T): T;
    public setComponent<T>(e: Entity | number, component: Component<T>, value: T): T {
        const entity = (typeof e === "number") ? this.entities[e] : e;
        if (entity.componentMask.get(component.id) == 1) {
            (<any>this.getComponents(component))[entity.id] = value;
        } else {
            (<any>this.getComponents(component))[entity.id] = value;
            entity.componentMask.set(component.id, 1)
            this.eventManager.event(LIB_NAME, `UPDATE[${component.name}]`, entity);
        }
        return this.getComponent(entity.id, component);
    }

    public unsetComponent<T>(entity: Entity, component: Component<T>): T;
    public unsetComponent<T>(entityId: number, component: Component<T>): T;
    public unsetComponent<T>(e: Entity | number, component: Component<T>): void {
        const entity = (typeof e === "number") ? this.entities[e] : e;
        if (!!this.components[component.id]) {
            delete (<any>this.components[component.id])[entity.id];
            entity.componentMask.set(component.id, 0);
            this.eventManager.event(LIB_NAME, `UPDATE[${component.name}]`, entity);
        }
    }

    public getComponent<T>(entity: Entity, component: Component<T>): T;
    public getComponent<T>(entityId: number, component: Component<T>): T;
    public getComponent<T>(e: Entity | number, component: Component<T>): T {
        const entity = (typeof e === "number") ? this.entities[e] : e;
        return (<any>this.getComponents(component))[entity.id];
    }

    public getComponents<T>(component: Component<T>): Record<number, T> {
        if (!this.components[component.id]) {
            this.components[component.id] = {};
        }
        return this.components[component.id];
    }
    //#endregion

    //#region SYSTEM HANDLING
    public addSystem<T extends System>(system: T): T {
        this.systems.push(system);
        return system;
    }

    public removeSystem<T extends System>(system: T): T {
        let index = this.systems.indexOf(system);
        if (index !== -1) {
            fastSplice(this.systems, index, 1);
            system.dispose();
        }
        return system;
    }

    public update(deltaTime: number) {
        for (let sysIndex = 0; sysIndex < this.systems.length; sysIndex++) {
            this.systems[sysIndex].update(deltaTime);
        }
    }
    //#endregion

    toJSON(): [Component<any>, any][][]{
        var entities:[Component<any>,any][][] = [];
        Object.values(this.entities).forEach((entity)=>{
            entities.push(entity.toJSON())
        })
        return entities;
    }

    parseString(raw:string){
        let rawComponentAssembly=JSON.parse(raw) as [string, any][][];
        rawComponentAssembly.map((item)=>{
            return ComponentAssembly.parse(item)
        }).forEach((ca)=>{
            this.createEntity(ca)
        })        
        
    }
}