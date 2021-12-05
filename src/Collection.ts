type PrimitiveType = string | number | boolean | null;

type ValueType = PrimitiveType | PrimitiveType[];

export type FieldType = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]';

export type Field = {
    name: string;
    type: FieldType;
    indexed: boolean;
};

export type Document = {
    id?: number;
    values: {
        [key: string]: ValueType;
    }
};

export class Collection {
    private counter: number;
    private fields: Map<string, Field>;
    private documents: Map<number, Document>;

    constructor(fields: Field[]) {
        this.counter = 0;
        this.fields = new Map();
        this.documents = new Map();;
        fields.forEach(field => {
            this.fields.set(field.name, field);
        });
    }

    public isField(fieldName: string): boolean {
        return this.fields.has(fieldName);
    }

    public getField(fieldName: string): Field {
        if (!this.isField(fieldName)) {
            throw new Error(`Unknown field name: ${fieldName}`);
        }
        return this.fields.get(fieldName) as Field;
    }

    public add(document: Document): Document {
        if (document.id !== undefined) {
            throw new Error(`Not new Document: ${document.id}`);
        }
        document.id = (this.counter += 1);
        this.documents.set(document.id, document);
        return document;
    }

    public get(id: number): Document {
        if (!this.documents.has(id)) {
            throw new Error(`Unknown id: ${id}`);
        }
        return this.documents.get(id) as Document;
    }
}