import { Component, aspect, ComponentAssembly } from "./Component";
import Context from "./Context";
import Entity from "./Entity";
import System from "./System";
import { fastSplice } from "./util/ArrayUtils";
import { ObjectHolder, SimpleObjectHolder } from "./util/ObjectHolder";

export const LIB_NAME = "raptor-ecs";
export { Component, aspect, ComponentAssembly, Context, Entity, System, fastSplice, ObjectHolder, SimpleObjectHolder } 