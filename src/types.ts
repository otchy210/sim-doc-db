type JsonPrimitive = string | number | boolean | null;

type JsonArray = JsonPrimitive[] | JsonArray[] | JsonObject[];

type JsonObject = {
    [key: string]: JsonPrimitive | JsonArray | JsonObject;
};

export type Json = JsonPrimitive | JsonArray | JsonObject;

export type PrimitiveType = string | number | boolean;

export type ValueType = PrimitiveType | PrimitiveType[];

export type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'tag' | 'tags';

export const prefferedFieldTypeSortOrder = (['string[]', 'string', 'tags', 'tag', 'number[]', 'number', 'boolean'] as FieldType[]).reduce(
    (prev, current, index) => {
        prev.set(current, index);
        return prev;
    },
    new Map<FieldType, number>()
);

export type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};

export type Values = {
    [key: string]: ValueType;
};

export type Document = {
    id?: number;
    values: Values;
};

export interface Index<T> {
    add(id: number, values: T[]): void;
    find(value: T): Set<number>;
    remove(id: number): void;
    size(): number;
    keys(): Map<T, number>;
    // export(): string;
    // import(fieldType: FieldType, data: string): void;
}

export type Query = {
    [key: string]: ValueType;
};
