import Entity from "./Entity";
import Context from "./Context";
import { aspect } from "./Component";
import { ObjectHolder, SimpleObjectHolder } from "./util/ObjectHolder";
import BitSet from "@marsraptor/bitset";
import { LIB_NAME } from ".";

export default abstract class System {
    private static counter = 0;
    
    readonly index: number;
    protected readonly entityIdHolder: ObjectHolder<number>;
    private readonly allOfMask: BitSet;
    private readonly noneOfMask: BitSet;
    private readonly oneOfMask: BitSet;
    protected ctx: Context;    
    constructor(ctx: Context, aspect?: aspect, entityHolder: ObjectHolder<number> = new SimpleObjectHolder<number>()) {
        this.ctx = ctx;

        this.index = System.counter++;
        this.entityIdHolder = entityHolder;

        this.allOfMask = new BitSet();
        this.noneOfMask = new BitSet();
        this.oneOfMask = new BitSet();

        if (aspect) {
            if (aspect.allOf && aspect.allOf.length > 0) {
                for (let i = 0; i < aspect.allOf.length; i++) {
                    this.allOfMask.set(aspect.allOf[i].id, 1)
                    this.ctx.eventManager.addEventListener(LIB_NAME, `UPDATE[${aspect.allOf[i].name}]`, this.test.bind(this))
                }
            }
            if (aspect.noneOf && aspect.noneOf.length > 0) {
                for (let i = 0; i < aspect.noneOf.length; i++) {
                    this.noneOfMask.set(aspect.noneOf[i].id, 1)
                    this.ctx.eventManager.addEventListener(LIB_NAME, `UPDATE[${aspect.noneOf[i].name}]`, this.test.bind(this))
                }
            }
            if (aspect.oneOf && aspect.oneOf.length > 0) {
                for (let i = 0; i < aspect.oneOf.length; i++) {
                    this.oneOfMask.set(aspect.oneOf[i].id, 1)
                    this.ctx.eventManager.addEventListener(LIB_NAME, `UPDATE[${aspect.oneOf[i].name}]`, this.test.bind(this))
                }
            }
        }

    }

    /**
   * Add an entity to the system entities.
   *
   * @param {Entity} entity The entity to add to the system.
   */
    protected addEntity(entity: Entity) {
        entity.systemMask.set(this.index, 1);
        this.entityIdHolder.add(entity.id);
        this.enter(entity);
    }
    /**
     * Remove an entity from the system entities. exit() handler is executed
     * only if the entity actually exists in the system entities.
     *
     * @param  {Entity} entity Reference of the entity to remove.
     */
    protected removeEntity(entity: Entity) {

        if (this.entityIdHolder.has(entity.id)) {
            entity.systemMask.set(this.index, 0);
            this.entityIdHolder.del(entity.id);
            this.exit(entity);
        }
    }

    /**
     * dispose the system by exiting all the entities
     *
     * @method  dispose
     */
    dispose() {
        for (let i = 0, entityId; entityId = this.entityIdHolder.elements[i]; i += 1) {
            if (this.ctx.hasEntity(entityId)) {
                const entity = this.ctx.getEntity(entityId);
                entity.systemMask.set(this.index, 0);
                this.exit(entity);
            }
        }
    }

    /**
     * Abstract method to subclass. Should return true if the entity is eligible
     * to the system, false otherwise.
     *
     * @method  test
     * @param  {Entity} entity The entity to test.
     */
    protected test(entity: Entity) {
        let interested = this.ctx.hasEntity(entity);
        let has = this.entityIdHolder.has(entity.id);
        interested = this.allOfMask.and(entity.componentMask).equals(this.allOfMask);
        if (interested) {
            interested = this.noneOfMask.and(entity.componentMask).cardinality() == 0;
        }
        if (interested && this.oneOfMask.lsb() != Infinity) {
            interested = this.oneOfMask.and(entity.componentMask).cardinality() == 1;
        }
        if (interested && !has) {
            this.addEntity(entity);
        } else if (!interested && has) {
            this.removeEntity(entity)
        }
        return interested;
    }
    /**
     * Abstract method to subclass. Called when an entity is added to the system.
     *
     * @method  enter
     * @param  {Entity} entity The added entity.
     */
    protected enter(entity: Entity) { }
    /**
     * Abstract method to subclass. Called when an entity is removed from the system.
     *
     * @method  exit
     * @param  {Entity} entity The removed entity.
     */
    protected exit(entity: Entity) { }

    /**
     * Apply update to each entity of this system.
     *
     * @method  updateAll
     */
    abstract update(elapsed: number): void;
}