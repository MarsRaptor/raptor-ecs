import { Manager } from "../manager/Manager";
import { Entity } from "./Entity";
import { IdPool } from "../util/IdPool";

export class EntityManager extends Manager {
    protected _disabled!: Set<number>;
    protected instances!: { [uid: number]: Entity };
    private _idPool!:IdPool;

    constructor() {
        super();
        this.initialize();
    }

    initialize(): void {
        this.instances = {};
        this._disabled = new Set<number>();
        this._idPool = new IdPool();
    }

    createEntityInstance(): Entity {
        return new Entity(this._idPool.newID());
    }

    getEntity(uid: number): Entity {
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
        this._idPool.free(entity.uid);
        this._disabled.delete(entity.uid);
    }

    enabled(entity: Entity): void {
        this._disabled.delete(entity.uid);
    }

    disabled(entity: Entity): void {
        this._disabled.add(entity.uid);
    }

    isEnabled(uid: number): boolean {
        return !this._disabled.has(uid);
    }
}