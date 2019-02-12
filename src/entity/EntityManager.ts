import { Manager } from "../manager/Manager";
import { Entity } from "./Entity";

export class EntityManager extends Manager {
    protected _disabled!: Set<string>;
    protected instances!: { [uid: string]: Entity };

    constructor() {
        super();
        this.initialize();
    }

    initialize(): void {
        this.instances = {};
        this._disabled = new Set<string>();
    }

    createEntityInstance(): Entity {
        return new Entity();
    }

    getEntity(uid: string): Entity {
        return this.instances[uid];
    }

    hasEntity(entity: Entity) {
        return this.instances.hasOwnProperty(entity.uid);
    }

    added(entity: Entity): void {
        this.instances[entity.uid] = entity;
    }

    deleted(entity: Entity): void {
        delete this.instances[entity.uid];
        this._disabled.delete(entity.uid);
    }

    enabled(entity: Entity): void {
        this._disabled.delete(entity.uid);
    }

    disabled(entity: Entity): void {
        this._disabled.add(entity.uid);
    }

    isEnabled(uid: string): boolean {
        return !this._disabled.has(uid);
    }
}