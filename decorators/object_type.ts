import { ENTITY_SYMBOL } from "../metadata/constants.ts";
import type { ObjectTypeMetadata } from "../metadata/types.ts";
import type { ClassType } from "../types.ts";

export interface ObjectTypeOptions {
  name?: string;
  description?: string;
  // implements?: GraphQLInterfaceType | GraphQLInterfaceType[];
}

export function objectType<T>(options: ObjectTypeOptions = {}) {
  return (target: ClassType<T>, ctx: ClassDecoratorContext<ClassType<T>>) => {
    // const implement = options.implements ?? [];
    ctx.metadata[ENTITY_SYMBOL] = {
      target,
      name: options.name ?? target.name,
      // interfaces: Array.isArray(implement) ? implement : [implement],
      description: options.description,
    } satisfies ObjectTypeMetadata;
  };
}
