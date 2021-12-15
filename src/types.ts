export type PrimitiveType = string | number | boolean;

export type ValueType = PrimitiveType | PrimitiveType[];

export type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'tags';

export type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};

export type Document = {
    id?: number;
    values: {
        [key: string]: ValueType;
    };
};

export interface Index<T> {
    add(id: number, values: T[]): void;
    find(value: T): Set<number>;
    remove(id: number): void;
    size(): number;
}

export type Query = {
    [key: string]: ValueType;
};
