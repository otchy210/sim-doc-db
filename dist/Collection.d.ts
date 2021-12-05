declare type PrimitiveType = string | number | boolean | null;
declare type ValueType = PrimitiveType | PrimitiveType[];
export declare type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';
export declare type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};
export declare type Document = {
    id?: number;
    values: {
        [key: string]: ValueType;
    };
};
export declare class Collection {
    private counter;
    private fields;
    private documents;
    constructor(fields: Field[]);
    isField(fieldName: string): boolean;
    getField(fieldName: string): Field;
    add(document: Document): Document;
    get(id: number): Document;
}
export {};
