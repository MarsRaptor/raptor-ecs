import { EntityObserver } from "../entity/EntityObserver";
import { Entity } from "../entity/Entity";
import { Aspect, AspectDescriptor } from "./Aspect";
import { EntityManager } from "../entity/EntityManager";
import { ManagerDescriptor } from "../manager/Manager";
import { SharesProps } from "../util/UtilTypes";
import { ComponentManagerDescriptor } from "../component/ComponentManager";
import { Context } from "../context/Context";

export abstract class EntitySystem<EXPECTED, EXCLUDED, OPTIONAL, MANAGERS, SYSTEMS> implements EntityObserver {
    static count: number = 0;
    readonly id: number = EntitySystem.count++;
    readonly priority:number;

    private _actives: Set<Entity>;
    passive: boolean;
    private aspect: Aspect<EXPECTED, EXCLUDED,OPTIONAL>;
    protected context!: Context<EXPECTED & EXCLUDED & OPTIONAL, MANAGERS, SYSTEMS>;

    constructor(aspect: AspectDescriptor<EXPECTED, EXCLUDED, OPTIONAL>,priority?:number) {
        this._actives = new Set<Entity>();
        this.passive = false;
        this.aspect = new Aspect(aspect);
        this.priority = priority || this.id;
    }

    setContext(context: Context<EXPECTED & EXCLUDED & OPTIONAL, MANAGERS, SYSTEMS>) {
        this.context = context;
    }

    get entityManager(): EntityManager {
        return this.context.entityManager;
    }

    get components(): ComponentManagerDescriptor<EXPECTED & EXCLUDED & OPTIONAL> {
        return this.context.components;
    }

    get managers(): ManagerDescriptor<MANAGERS> {
        return this.context.managers;
    }

    get systems(): EntitySystemDescriptor<SYSTEMS, EXPECTED & EXCLUDED &OPTIONAL> {
        return this.context.systems as any;
    }

    get actives(): Set<Entity> {
        return this.actives;
    }

    public initialize(): void {
        // Nothing
    }
    protected inserted(entity: Entity): void { };
    protected removed(entity: Entity): void { };

    public added(entity: Entity): void {
        this.check(entity);
    }

    public changed(entity: Entity): void {
        this.check(entity);
    }

    public deleted(entity: Entity): void {
        if (entity.systemIndexes.has(this.id)) {
            this.removeFromSystem(entity);
        }
    }

    public enabled(entity: Entity): void {
        this.check(entity);
    }

    public disabled(entity: Entity): void {
        if (entity.systemIndexes.has(this.id)) {
            this.removeFromSystem(entity);
        }
    }

    private insertToSystem(entity: Entity): void {
        this._actives.add(entity);
        entity.systemIndexes.add(this.id);
        this.inserted(entity);
    }

    private removeFromSystem(entity: Entity): void {
        this._actives.delete(entity);
        entity.systemIndexes.delete(this.id);
        this.removed(entity);
    }

    protected check(entity: Entity): void {

        let contains: boolean = entity.systemIndexes.has(this.id);
        
        let interested: boolean = this.aspect.validate(this.context.components, entity);
        
        if (interested && !contains) {
            this.insertToSystem(entity);
        } else if (!interested && contains) {
            this.removeFromSystem(entity);
        }

    }

    protected checkProcessing(): boolean {
        return true;
    }

    protected begin(): void { }

    protected abstract processEntities(entities: Set<Entity>): void;

    protected end(): void { }

    public process(): void {
        if (this.checkProcessing()) {
            this.begin();
            this.processEntities(this._actives);
            this.end();
        }
    }

    public dispose(): void { }

}

export type EntitySystemDescriptor<T, COMPONENTS> = {
    [P in keyof T]: ValidEntitySystem<T[P], COMPONENTS>
};

export type ValidEntitySystem<ES, COMPONENTS> = ES extends EntitySystem<infer EXPECTED, infer EXCLUDED,infer OPTIONAL, any, any>
    ? COMPONENTS extends (EXPECTED & EXCLUDED & OPTIONAL) ?
    (
    SharesProps<EXPECTED, EXCLUDED> extends true ? never :
    SharesProps<EXPECTED, OPTIONAL> extends true ? never :
    SharesProps<EXCLUDED, OPTIONAL> extends true ? never :
    ES
    ) : never : never
