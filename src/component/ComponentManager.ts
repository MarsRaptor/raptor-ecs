import { Manager } from "../manager/Manager";
import { Entity } from "../entity/Entity";

export class ComponentManager<T> extends Manager {

    protected instances!: { [uid: number]: T };

    public initialize(): void {
        this.instances = {};
    }

    public deleted(entity: Entity): void {
        this.del(entity);
    }

    get(uid: number) {
        return this.instances[uid];
    }

    set(entity: Entity, component: T) {
        this.instances[entity.uid] = component;
        this.getContext().changedEntity(entity);
    }

    del(entity: Entity) {
        delete this.instances[entity.uid];
        this.getContext().changedEntity(entity);
    }

    has(entity: Entity) {
        return this.instances.hasOwnProperty(entity.uid);
    }

    all() {
        return (Object as any).values(this.instances);
    }
}

export type ComponentManagerDescriptor<T> = { [P in keyof T]: ComponentManager<T[P]> };
