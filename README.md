[![Build Status](https://travis-ci.org/MarsRaptor/aries-recs.svg?branch=master)](https://travis-ci.org/MarsRaptor/aries-recs)
# Aries-RECS

Aries-RECS for (Rough Entity Component System) is an Entity-Component-System (ECS) library written in, and mainly for, TypeScript (TS), the aim being to leverage the type safety provided by TS. 

## Entity-Component-System (ECS)

**Entity-Component-System** (ECS) is an architectural pattern (*commonly used in game development*) that consists, as the name entails, of three primary items:

* **Entities:** uniquely identified object to which Components are linked.
* **Components:** raw data (preferably no logic)
* **Systems:** implementation that iteratively operates on a group of entities that share common components.

**Some Advantages :**

* Safe and simple dependency handling, since Components are not inter-dependant.
* No need for complex inheritance trees, ECS uses composition.

*For more see the wikipedia page [here](https://en.wikipedia.org/wiki/Entity-component-system)*.

## Aries-RECS

### Mindset

The main purpose of this library is to provide ease of access to the different components, systems and managers from within the different contexts (global, inside managers and inside systems). Therefor emphasis is made on creating fully typed contexts and using runtime elements (weakly checked) smartly and sparingly.

### What's inside

The library revolves around the following objects :

* **Entity:** contains an unique identifier, generated automatically on instaciation.
* **Manager:** abstract class that can be implemented for utility purposes, Managers observe Entity manipulations in a given Context.
* **ComponentManager:** manages all instances of a given Component, allows for retrieval for a given Entity
* **EntityManager:** manages all Entities in a given Context
* **EntitySystem:** executes logic on Entities of a given Aspect, this meaning Entities that share the same expected, excluded and optional Components.
* **Context:** main object, contains and orchestrates all of the above.

## Usage

### Installation

Installation is available by [NPM](https://npmjs.org):

```bash
npm i @marsraptor/aries-recs --save
```

### Implementation

**Import:**

In the current iteration of the definition file (d.ts), type checking is lack luster. Therefor to counter this it is recommended to use the following import statement:

*Import like this:*

```ts
import {} from '@marsraptor/aries-recs/src'

```

*Instead of the usual:*

```ts
import {} from '@marsraptor/aries-recs'

```

**Component:**

Components are just typed objects

*Example:*

```ts
class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
```

**EntitySystem:**

EntitySystem classes use, in order, the following types: 

* *EXPECTED:* components expected to be present on the evaluated Entity
* *EXCLUDED:* components expected not to be present on the evaluated Entity
* *OPTIONAL:* components expected to be available in the current EntitySystem 
* *MANAGERS:* managers expected to be present in the current EntitySystem 
* *SYSTEMS :* systems expected to be present in the current EntitySystem 

*Example:*

```ts
class ColourLogger extends EntitySystem<{ color: Colour }, { position: Position },{}, any, any>{

    constructor() {
        super({
            expected: {
                color: new AspectHolder<Colour>(),
            },
            excluded: {
                position: new AspectHolder<Position>()
            },
            optional :null
        });
    }

    protected processEntities(entities: Set<Entity>): void {
        entities.forEach(
            entity => {
                this.components.position.set(entity, new Position(1, 2));
                console.log("ColourLogger : ", this.components.color.get(entity.uid).hex);
            }
        )
    }
}
```

*Remark: A priorty can be given as a second parameter to the System for processing order, by default systems are processed in order of instanciation.*

**Context:**

A Context is instaciated with a parameter of the following type :

```ts
type ContextDescriptor<COMPONENTS, MANAGERS, SYSTEMS> = {
    entityManager?: EntityManager;
    componentMgrReg: ComponentManagerDescriptor<COMPONENTS>;
    additionaMrgReg?: ManagerDescriptor<MANAGERS>;
    systemReg:  EntitySystemDescriptor<SYSTEMS,COMPONENTS>;
};
```

*Example:*

```ts
let xc = new Context({
    componentMgrReg: {
        color: new ComponentManager<Colour>(),
        text: new ComponentManager<TextA | TextB>(),
        position: new ComponentManager<Position>(),
        style: new ComponentManager<Style>()
    },
    additionaMrgReg: {
        bonus: new BonusManager()
    },
    systemReg: {
        logger: new ColourLogger() ,
        always: new AspectlessLogger(),
    }
});
```

*Remark: before processing a context **must** be initialized as follows:*

```ts
xc.initialize();
```

It is also possible to add/remove EntitySystems and/or additional Managers at runtime. Type checking applies if the added systems are added to a context object, but be aware that adding a runtime EntitySystem from inside another is restricted by the types given to the System that adds the other. Also runtime systems are unrestricted when added by a manager so it may cause exceptions if certain component managers are not present in the context.

*Example:*

```ts
xc.addRuntimeManager("style", new ComponentManager<Style>());
xc.getRuntimeManager<ComponentManager<Style>>("style").set(eX, new Style("italic"));
xc.addRuntimeSystem("logger2", new TextLogger());
```

### Resources

* TODO

## License

[MIT License] (https://github.com/MarsRaptor/aries-recs/blob/master/LICENSE).