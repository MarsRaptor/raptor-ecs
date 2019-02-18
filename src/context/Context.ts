import { Manager, ManagerDescriptor } from "../manager/Manager";
import { EntitySystem, EntitySystemDescriptor } from "../system/EntitySystem";
import { Entity } from "../entity/Entity";
import { EntityManager } from "../entity/EntityManager";
import { ComponentManagerDescriptor } from "../component/ComponentManager";
import { EntityObserver } from "../entity/EntityObserver";

export class Context<COMPONENTS, MANAGERS, SYSTEMS>{

    private _managers: Set<Manager>;
    private _systems: Set<EntitySystem<any, any, any,any, any>>;
    private _registry: Required<ContextDescriptor<COMPONENTS, MANAGERS, SYSTEMS>>;

    private _added: Set<Entity>;
    private _changed: Set<Entity>;
    private _deleted: Set<Entity>;
    private _enable: Set<Entity>;
    private _disable: Set<Entity>;

    private mAddedPerformer: Performer;
    private mChangedPerformer: Performer;
    private mDisabledPerformer: Performer;
    private mEnabledPerformer: Performer;
    private mDeletedPerformer: Performer;

    get entityManager(): EntityManager {
        return this._registry.entityManager;
    }

    get components(): ComponentManagerDescriptor<COMPONENTS> {
        return this._registry.components;
    }

    get managers(): ManagerDescriptor<MANAGERS> {
        return this._registry.managers;
    }

    get systems():EntitySystemDescriptor<SYSTEMS,COMPONENTS>{
        return this._registry.systems;
    }

    constructor(registry: ContextDescriptor<COMPONENTS, MANAGERS, SYSTEMS>) {

        // MGRS
        this._registry = {
            entityManager: registry.entityManager || new EntityManager(),
            components: registry.components,
            managers: registry.managers || {} as ManagerDescriptor<MANAGERS>,
            systems: registry.systems
        };
        this._managers = new Set<Manager>();
        this._registry.entityManager.setContext(this);
        this._managers.add(this._registry.entityManager);
        let componentMgrKeys = Object.getOwnPropertyNames(this._registry.components);
        for (let index = 0; index < componentMgrKeys.length; index++) {
            let mgr = (this._registry.components as any)[componentMgrKeys[index]];
            mgr.setContext(this);
            this._managers.add(mgr);
        }

        let additionalMgrKeys = Object.getOwnPropertyNames(this._registry.managers);
        for (let index = 0; index < additionalMgrKeys.length; index++) {
            let mgr = (this._registry.managers as any)[additionalMgrKeys[index]] as Manager;
            mgr.setContext(this);
            this._managers.add(mgr);
        }
        // SYSS
        let systems = new Array<EntitySystem<any, any,any, MANAGERS, SYSTEMS>>();
        let systemKeys = Object.getOwnPropertyNames(this._registry.systems);
        for (let index = 0; index < systemKeys.length; index++) {
            let sys = (this._registry.systems as any)[systemKeys[index]] as EntitySystem<any, any,any, MANAGERS, SYSTEMS>;
            systems.push(sys)
        }
        this._systems = new Set<EntitySystem<any, any,any, MANAGERS, SYSTEMS>>(systems.sort((a,b)=>{return a.priority -b.priority}));
        //

        this._added = new Set<Entity>();
        this._changed = new Set<Entity>();
        this._deleted = new Set<Entity>();
        this._enable = new Set<Entity>();
        this._disable = new Set<Entity>();

        this.mAddedPerformer = {
            perform(observer: EntityObserver, e: Entity): void {
                observer.added(e);
            }
        };

        this.mChangedPerformer = {
            perform(observer: EntityObserver, e: Entity): void {
                observer.changed(e);
            }
        };

        this.mDisabledPerformer = {
            perform(observer: EntityObserver, e: Entity): void {
                observer.disabled(e);
            }
        };

        this.mEnabledPerformer = {
            perform(observer: EntityObserver, e: Entity): void {
                observer.enabled(e);
            }
        };

        this.mDeletedPerformer = {
            perform(observer: EntityObserver, e: Entity): void {
                observer.deleted(e);
            }
        };

        this.initialize();

    }

    public createEntity(): Entity {
        return this.entityManager.createEntityInstance();
    }

    public initialize(): void {
        this._managers.forEach(mgr => mgr.initialize());
        this._systems.forEach(sys => sys.initialize(this));
    }

    public addEntity(entity: Entity): void {
        this._added.add(entity);
    }

    public changedEntity(entity: Entity): void {
        if (this.entityManager.hasEntity(entity)) {
            this._changed.add(entity);
        }
    }

    public deleteEntity(entity: Entity): void {
        if (this.entityManager.hasEntity(entity)) {
            this._deleted.add(entity);
        }
    }

    public enable(entity: Entity): void {
        if (this.entityManager.hasEntity(entity)) {
            this._enable.add(entity);
        }
    }

    public disable(entity: Entity): void {
        if (this._registry.entityManager.hasEntity(entity)) {
            this._disable.add(entity);
        }
    }

    addRuntimeManager(name: string, mgr: Manager) {
        Object.defineProperty(this.managers, name, { value: mgr });
        this._managers.add(mgr);
        mgr.setContext(this);
        mgr.initialize();
    }

    delRuntimeManager(name: string) {
        let mgr = this.getRuntimeManager(name);
        if (mgr) {
            this._managers.delete(mgr)
        }
        delete (this.managers as any)[name];
    }

    getRuntimeManager<MGR extends Manager>(name: string): MGR {
        return (this.managers as any)[name];
    }

    private notifyManagers(performer: Performer, entity: Entity): void {
        this._managers.forEach(manager => performer.perform(manager, entity));
    }

    // SYSTEMS
    addRuntimeSystem(name: string, system: EntitySystem<Partial<COMPONENTS>, Partial<COMPONENTS>,Partial<COMPONENTS>, any, any>) {
        Object.defineProperty(this.systems, name, { value: system });
        this._systems = new Set<EntitySystem<any, any,any, MANAGERS, SYSTEMS>>(Array.from(this._systems.add(system)).sort((a,b)=>{return a.priority -b.priority}));
        system.initialize(this);
    }

    delRuntimeSystem(name: string) {
        let mgr = this.getRuntimeSystem(name);
        if (mgr) {
            this._systems.delete(mgr)
        }
        delete (this.systems as any)[name];
    }

    getRuntimeSystem<SYS extends EntitySystem<any, any,any, any, any>>(name: string): SYS {
        return (this.systems as any)[name];
    }

    private notifySystems(performer: Performer, entity: Entity): void {
        this._systems.forEach(system => performer.perform(system, entity));
    }

    private check(entities: Set<Entity>, performer: Performer): void {
        if (entities.size > 0) {
            entities.forEach((entity) => {
                this.notifyManagers(performer, entity);
                this.notifySystems(performer, entity);
            }, this)
            entities.clear();
        }
    }

    public process(): void {

        this.check(this._added, this.mAddedPerformer);
        this.check(this._changed, this.mChangedPerformer);
        this.check(this._disable, this.mDisabledPerformer);
        this.check(this._enable, this.mEnabledPerformer);
        this.check(this._deleted, this.mDeletedPerformer);

        this._systems.forEach(system => {
            if (!system.passive) {
                system.process();
            }
        }, this);

    }
}

interface Performer {
    perform(observer: EntityObserver, entity: Entity): void;
}

export type ContextDescriptor<COMPONENTS, MANAGERS, SYSTEMS> = {
    entityManager?: EntityManager;
    components: ComponentManagerDescriptor<COMPONENTS>;
    managers?: ManagerDescriptor<MANAGERS>;
    systems:  EntitySystemDescriptor<SYSTEMS,COMPONENTS>;
};