type PrimitiveType = string | number | boolean | null;

type ValueType = PrimitiveType | PrimitiveType[];

export type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';

export type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};

export type Document = {
    [key: string]: ValueType;
};

export class Collection {
    private indexed: Map<string, boolean>;

    constructor(fields: Field[]) {
        this.indexed = new Map();
        fields.forEach(field => {
            this.indexed.set(field.name, field.indexed);
        });
    }

    public isIndexed(fieldName: string): boolean {
        if (!this.indexed.has(fieldName)) {
            throw new Error(`Unknown field name: ${fieldName}`);
        }
        return this.indexed.get(fieldName) as boolean;
    }
}