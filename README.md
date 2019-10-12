# Raptor-ecs

[![NPM Package](https://nodei.co/npm-dl/@marsraptor/raptor-ecs.png?months=6&height=1)](https://npmjs.org/package/@marsraptor/raptor-ecs)

[![Build Status](https://travis-ci.org/MarsRaptor/raptor-ecs.svg)](https://travis-ci.org/MarsRaptor/raptor-ecs)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Raptor-ecs is an Entity-Component-System (ECS) library written in and mainly for TypeScript, the aim being to leverage the type checking provided by TypeScript. 

## Entity-Component-System (ECS)
Safe and simple dependency handling, since Components are not inter-dependant.
No need for complex inheritance trees, ECS uses composition.

*For more see the wikipedia page [here](https://en.wikipedia.org/wiki/Entity-component-system)*.

### What's inside

The library revolves around the following objects :

* **Entity:** uniquely identified object to which Components are linked.
* **Component:** raw data (preferably no logic).
* **System:** implementation that iteratively operates on a group of entities that share common components.
* **Context:** main object, contains and orchestrates all of the above.

## Usage

### Installation

Installation is available by [NPM](https://npmjs.org):

```bash
npm i @marsraptor/raptor-ecs --save
```

### Implementation

**Import**

```ts
import {} from '@marsraptor/raptor-ecs'
```
**Entity**

An entity comes with the ability to get, set, unset or gauge the ownership of a Component.
Entities are created thusly :

```ts
const context = new Context();
let entity = context.createEntity()
```

*Optionaly a ComponentAssembly object can be given as parameter, see the next section for more information*

**Component**

Components are registered thusly.
*Warning : 2 components cannot share the same name, this will throw a runtime error!*

*Example:*

```ts
const Position2D = Component.new<{x:number,y:number}>("Position2D");
```

ComponentAssembly objects are builders for creating entities with preset components. They can be built with code or can parse a JSON string of an array of tuples ([ComponentName,Value][]). Building component assemblies manually has the advantage of being type checked when adding a component.

*Example:*

```ts
const context = new Context();
let parsedAssembly = ComponentAssembly.parseString("[[\"ColourName\",\"grey\"]]");
let builtAssembly = new ComponentAssembly([Position2D,{x:0,y:0}],[Excludable,{excluded:false}]);
builtAssembly.add(ColourName,"red");
let parsedEntity = context.createEntity(parsedAssembly);
let builtEntity = context.createEntity(builtAssembly);
```
**System**

Systems are where the bulk of the logic resides. They are characterized by an aspect. An aspect consists of 3 lists of component types (registered as mentionned above) :
* *allOf:* components expected to be present on the evaluated Entity
* *noneOf:* components expected not to be present on the evaluated Entity
* *oneOf:* component within a list expected to be present on the evaluated Entity

In addition to the aspect a context object is required to instanciate a System.
The *update* method is required to be implemented, the elapsed time is given for time critical logic.

*Optionaly an object holder (number holder in this instance) can be given to the system class in order to manage the entities that qualify for the system (e.g. for ordering on when an entity is added).*

*Example:*

```ts
const Position2D = Component.new<{x:number,y:number}>("Position2D");
const ColourName = Component.new<string>("ColourName");
const ColourHex = Component.new<string>("ColourHex");
const Excludable = Component.new<{excluded:boolean}>("Excludable");

class ExampleSystem extends System{
    constructor(context:Context) {
        super(context,{allOf:[Position2D],oneOf:[ColourName,ColourHex],noneOf:[Excludable]});        
    }
    update(elapsed: number): void {
        for (let entityIndex = 0; entityIndex < this.entityIdHolder.elements.length; entityIndex++) {
            const entityId = this.entityIdHolder.elements[entityIndex];
            const entity = this.ctx.getEntity(entityId);
            const colourStr = entity.get(ColourName) || entity.get(ColourHex)
            console.log(`${entity.get(Position2D)} ${colourStr} `)
        }
    }

} 
```
*Remark: A priorty is given in order of instanciation.*

**Context**

A Context is the main object, it is what allows for the creation of entities and contains all components and systems.
Contexts are created thusly :

```ts
const context = new Context();
```

Contexts have one major function, *update*, the elapsed time must be given for time critical logic of contained systems.

*Example:*

```ts
const context = new Context();
var t = Date.now();
var loop = (time:number)=>{
    let deltaTime = time - t;
    t = time;
    context.update(deltaTime)
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

A context is able to, components permitting, parse and serialize all entities to JSON. For parsing the JSON string must be of the type [ComponentName,Value][][].

*Example:*

```ts
const context = new Context();
const ColourName = Component.new<string>("ColourName");
const ColourHex = Component.new<string>("ColourHex");
context.parseString("[[[\"ColourName\",\"blue\"]],[[\"ColourHex\",\"#00FF00\"]]]");
let serializedEntities = JSON.stringify(context) // uses context.toJSON()
```

In addition a context contains an EventManager (courtesy of [library-event-manager](https://github.com/emrahgunduz/library-event-manager)). This event manager can be used from anywhere the context is accessible (in the context declaration scope as well as in systems).

### Resources

* TODO

## License

[MIT](https://github.com/MarsRaptor/raptor-ecs/blob/master/LICENSE) License.