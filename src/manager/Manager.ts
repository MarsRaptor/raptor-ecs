import { EntityObserver } from "../entity/EntityObserver";
import { Entity } from "../entity/Entity";
import { Context } from "../context/Context";

export abstract class Manager implements EntityObserver {
    static count: number = 0;
    readonly id: number = Manager.count++;

    private _context!: Context<any, any, any>;

    setContext<COMPONENTS, MANAGERS, SYSTEMS>(context: Context<COMPONENTS, MANAGERS, SYSTEMS>) {
        this._context = context;
    }

    protected getContext<COMPONENTS, MANAGERS, SYSTEMS>(): Context<COMPONENTS, MANAGERS, SYSTEMS> {
        return this._context;
    }

    public initialize(): void { }

    public added(entity: Entity): void { }

    public changed(entity: Entity): void { }

    public deleted(entity: Entity): void { }

    public enabled(entity: Entity): void { }

    public disabled(entity: Entity): void { }

}

export type ManagerDescriptor<T> = { [P in keyof T]: T[P] extends Manager ? T[P] : never };
