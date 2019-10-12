"use strict";
const chai = require("chai");
const raptor_ecs = require("../.dist/index.js");

describe('Components tests', () => {
    it('Should be able to create a valid component', () => {        
        let test_componentA = raptor_ecs.Component.new("test_componentA");
        chai.expect(test_componentA.id).to.equal(0, "Incorrect component ID");
        chai.expect(test_componentA.name).to.equal("test_componentA", "Incorrect component name");
        chai.expect(JSON.stringify(test_componentA)).to.equal("\"test_componentA\"", "Incorrect component toJSON");
    });
    it('Should be able to create a valid ComponentAssembly', () => {        
        let test_componentB = raptor_ecs.Component.new("test_componentB");
        let ca = raptor_ecs.ComponentAssembly.parseString("[[\"test_componentB\",\"PogChamp\"]]");
        
        chai.expect(JSON.stringify(ca)).to.equal("[[\"test_componentB\",\"PogChamp\"]]", "Incorrect component toJSON");
    });
});

describe('System tests', () => {
   
    it('Should be able to create a valid system', () => {        
        class SystemA extends raptor_ecs.System{
            constructor(ctx) {
                super(ctx);
            }
        }
        let ctx = new raptor_ecs.Context();
        let sysA = new SystemA(ctx);
        chai.expect(sysA.index).to.equal(0, "Incorrect system ID");
        chai.assert.isOk(sysA.entityIdHolder,"entityIdHolder is falsy");
        chai.assert.isOk(sysA.allOfMask,"allOfMask is falsy");
        chai.assert.isOk(sysA.noneOfMask,"noneOfMask is falsy");
        chai.assert.isOk(sysA.oneOfMask,"oneOfMask is falsy");
        chai.assert.isOk(sysA.ctx,"ctx is falsy");

    });

    it('Should be able to test a valid entity', () => {     
        const test_componentC = raptor_ecs.Component.new("cctest_componentC");   
        class SystemA extends raptor_ecs.System{
            constructor(ctx) {
                super(ctx,{allOf:[test_componentC]});
            }
        }
        let ctx = new raptor_ecs.Context();
        let sysA = new SystemA(ctx);
        ctx.addSystem(sysA)
        let entity = ctx.createEntity();
        entity.set(test_componentC,"PogChamp");
        chai.assert(sysA.test(entity)===true,"Entity aspect test failed")
        
    });

    it('Should be able to update correctly', () => {     
        var counter = [];
        const test_componentD = raptor_ecs.Component.new("test_componentD");   
        class SystemA extends raptor_ecs.System{
            constructor(ctx) {
                super(ctx,{allOf:[test_componentD]});
            }
            update(elapsed){
                for (let index = 0; index < this.entityIdHolder.elements.length; index++) {
                    const entityID = this.entityIdHolder.elements[index];
                    this.ctx.getEntity(entityID)
                    counter.push(`[${elapsed}][${entityID}][${this.ctx.getEntity(entityID).get(test_componentD)}]`)
                }
            }

        }
        let ctx = new raptor_ecs.Context();
        let sysA = new SystemA(ctx);
        ctx.addSystem(sysA)
        let entity = ctx.createEntity();
        entity.set(test_componentD,"PogChamp");
        chai.assert(sysA.test(entity)===true,"Entity aspect test failed")
        sysA.update(1);
        sysA.update(2);

        chai.expect(JSON.stringify(counter)).to.equal("[\"[1][1][PogChamp]\",\"[2][1][PogChamp]\"]", "Incorrectly updates");

    });
});

describe('Context tests', () => {
   
    it('Should be able to create a valid context', () => {        
        let ctx = new raptor_ecs.Context();
        chai.assert.isOk(ctx);
        chai.assert.isOk(ctx.entities,"entities is falsy");
        chai.assert.isOk(ctx.components,"components is falsy");
        chai.assert(Array.isArray(ctx.systems), 'systems is not an array');
        chai.assert.isOk(ctx.eventManager,"eventManager is falsy");
    });
    it('Should be able to create a valid entity', () => {        
        let ctx = new raptor_ecs.Context();
        let entity = ctx.createEntity();
        chai.assert.isOk(entity);
        chai.expect(entity.id).to.equal(2, "Incorrect entity ID");
        chai.expect(JSON.stringify(entity)).to.equal("[]", "Incorrect entity toJSON");
        chai.expect(entity.id).to.equal(ctx.entities[entity.id].id, "Incorrect entity ID in context");

    });

    it('Should be able to update correctly', () => {        
        var counter = [];
        const test_component = raptor_ecs.Component.new("test_componentE");   
        class SystemA extends raptor_ecs.System{
            constructor(ctx) {
                super(ctx,{allOf:[test_component]});
            }
            update(elapsed){
                for (let index = 0; index < this.entityIdHolder.elements.length; index++) {
                    const entityID = this.entityIdHolder.elements[index];
                    this.ctx.getEntity(entityID)
                    counter.push(`[${elapsed}][${entityID}][${this.ctx.getEntity(entityID).get(test_component)}]`)
                }
            }

        }
        let ctx = new raptor_ecs.Context();
        let sysA = new SystemA(ctx);
        ctx.addSystem(sysA)
        let entity = ctx.createEntity();
        entity.set(test_component,"PogChamp");
        ctx.update(1);
        ctx.update(2);
        chai.expect(JSON.stringify(counter)).to.equal("[\"[1][3][PogChamp]\",\"[2][3][PogChamp]\"]", "Incorrectly updates");

    });

    it('Should be able to serialize correctly [component depending]', () => {        
        const test_component = raptor_ecs.Component.new("test_componentF");   
        
        let ctx = new raptor_ecs.Context();
        let entityA = ctx.createEntity();
        entityA.set(test_component,"PogChamp");
        let entityB = ctx.createEntity();
        entityB.set(test_component,"Kappa");
        chai.expect(JSON.stringify(ctx)).to.equal("[[[\"test_componentF\",\"PogChamp\"]],[[\"test_componentF\",\"Kappa\"]]]", "Incorrectly serializes");

    });

    it('Should be able to parse correctly [component depending]', () => {        
        const test_component = raptor_ecs.Component.new("test_componentG");   
        let ctx = new raptor_ecs.Context();
        var counter = [];

        class SystemA extends raptor_ecs.System{
            constructor(ctx) {
                super(ctx,{allOf:[test_component]});
            }
            update(elapsed){
                for (let index = 0; index < this.entityIdHolder.elements.length; index++) {
                    const entityID = this.entityIdHolder.elements[index];
                    this.ctx.getEntity(entityID)
                    counter.push(`[${elapsed}][${entityID}][${this.ctx.getEntity(entityID).get(test_component)}]`)
                }
            }

        }
        let sysA = new SystemA(ctx);
        ctx.addSystem(sysA)
        ctx.parseString("[[[\"test_componentG\",\"PogChamp\"]],[[\"test_componentG\",\"Kappa\"]]]");
        chai.expect(JSON.stringify(ctx)).to.equal("[[[\"test_componentG\",\"PogChamp\"]],[[\"test_componentG\",\"Kappa\"]]]", "Incorrectly parses");
        ctx.update(1);
        ctx.update(2);
        chai.expect(JSON.stringify(counter)).to.equal("[\"[1][6][PogChamp]\",\"[1][7][Kappa]\",\"[2][6][PogChamp]\",\"[2][7][Kappa]\"]", "Incorrectly updates");
    });
});