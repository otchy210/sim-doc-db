type PrimitiveType = string | number | boolean;

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
        this.validateValues(document);
        document.id = (this.counter += 1);
        this.documents.set(document.id, document);
        return document;
    }

    private validateValues(document: Document) {
        for(const entry of Object.entries(document.values)) {
            const [fieldName, value] = entry;
            const field = this.getField(fieldName);
            const fieldType = field.type;
            const valueType = typeof value;
            switch (fieldType) {
                case 'string':
                case 'number':
                case 'boolean':
                    if (fieldType !== valueType) {
                        throw new Error(`Type mismatched: ${fieldType} -> ${valueType}`);
                    }
                    break;
                default: // array
                    if (!Array.isArray(value)) {
                        throw new Error(`Type mismatched: ${valueType} != array`);
                    }
                    if (value.length === 0) {
                        break;
                    }
                    const arrayFieldType = fieldType.substring(0, fieldType.length - 2);
                    const arrayValueType = typeof value[0];
                    if (arrayFieldType !== arrayValueType) {
                        throw new Error(`Type mismatched: ${fieldType} -> ${arrayValueType}[]`);
                    }
            }
        }
    }

    public get(id: number): Document {
        if (!this.documents.has(id)) {
            throw new Error(`Unknown id: ${id}`);
        }
        return this.documents.get(id) as Document;
    }
}