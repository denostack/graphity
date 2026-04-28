// deno-lint-ignore-file ban-types no-explicit-any

export type ClassType<T> = { new (...args: any[]): T } & Function;

export interface ScalarTypeMap {
  string: string;
  int: number;
  float: number;
  boolean: boolean;
  id: string | number;
}

export type ScalarTypeString = keyof ScalarTypeMap;

export const LIST_TYPE_SYMBOL = Symbol("list_type");

export interface ListTypeDescriptor {
  [LIST_TYPE_SYMBOL]: true;
  itemType: ScalarTypeString | Function;
  itemNullable: boolean;
}

export function list(
  type: ScalarTypeString | ClassType<any> | ((...args: any[]) => any),
  options?: { nullable?: boolean },
): ListTypeDescriptor {
  return {
    [LIST_TYPE_SYMBOL]: true,
    itemType: typeof type === "string" ? type : type as Function,
    itemNullable: options?.nullable ?? false,
  };
}

export function isListTypeDescriptor(value: any): value is ListTypeDescriptor {
  return value != null && value[LIST_TYPE_SYMBOL] === true;
}
