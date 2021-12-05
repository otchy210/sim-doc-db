declare type PrimitiveType = string | number | boolean | null;
declare type ValueType = PrimitiveType | PrimitiveType[];
export declare type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';
export declare type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};
export declare type Document = {
    [key: string]: ValueType;
};
export declare class Collection {
    private indexed;
    constructor(fields: Field[]);
    isIndexed(fieldName: string): boolean;
}
export {};
