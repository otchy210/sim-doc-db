import { ExactMatchIndex } from './ExactMatchIndex';
import { PartialMatchIndex } from './PartialMatchIndex';
import { Document, Field, FieldType, Index, Json, prefferedFieldTypeSortOrder, PrimitiveType, Query, Values } from './types';

type ExportType = {
    c: number;
    i: { [key: string]: Json };
    d: { [key: number]: { i: number; v: Json } };
};

export class Collection {
    private counter = 0;
    private fields = new Map<string, Field>();
    private indexes = new Map<string, Index<PrimitiveType>>();
    private documents = new Map<number, Document>();

    constructor(fields: Field[]) {
        this.init(fields);
    }

    private init(fields: Field[]) {
        fields.forEach((field) => {
            const { name, type, indexed } = field;
            this.fields.set(name, field);
            if (!indexed) {
                return;
            }
            this.initIndex(name, type);
        });
    }

    private initIndex(name: string, type: FieldType): Index<PrimitiveType> {
        switch (type) {
            case 'string':
            case 'string[]':
                const sIndex = new PartialMatchIndex();
                this.indexes.set(name, sIndex);
                return sIndex;
            case 'number':
            case 'number[]':
                const nIndex = new ExactMatchIndex<number>();
                this.indexes.set(name, nIndex);
                return nIndex;
            case 'boolean':
                const bIndex = new ExactMatchIndex<boolean>();
                this.indexes.set(name, bIndex);
                return bIndex;
            case 'tag':
            case 'tags':
                const tIndex = new ExactMatchIndex<string>();
                this.indexes.set(name, tIndex);
                return tIndex;
        }
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

    public getKeys(fieldName: string): Map<PrimitiveType, number> {
        const field = this.getField(fieldName);
        if (!field.indexed) {
            throw new Error(`Field is not indexed: ${fieldName}`);
        }
        const index = this.indexes.get(fieldName) as Index<PrimitiveType>;
        return index.keys();
    }

    public add(document: Document): Document {
        if (document.id !== undefined) {
            throw new Error(`Not new Document: ${document.id}`);
        }
        this.validateValues(document);
        document.id = this.counter += 1;
        this.documents.set(document.id, document);
        this.addIndex(document);
        return document;
    }

    public get(id: number): Document {
        if (!this.has(id)) {
            throw new Error(`Unknown id: ${id}`);
        }
        return this.documents.get(id) as Document;
    }

    public update(document: Document): Document {
        if (document.id === undefined) {
            throw new Error('Document has no id');
        }
        this.validateValues(document);
        const id = document.id;
        const existingDocument = this.get(id);
        this.documents.set(id, document);
        this.removeIndex(id);
        this.addIndex(document);
        return existingDocument;
    }

    public has(id: number): boolean {
        return this.documents.has(id);
    }

    public remove(id: number): Document {
        const document = this.get(id);
        this.documents.delete(id);
        this.removeIndex(id);
        return document;
    }

    public removeMatched(query: Query): number {
        const ids = this.findIds(query);
        const size = ids.size;
        if (size === 0) {
            return size;
        }
        ids.forEach((id) => {
            this.remove(id);
        });
        return size;
    }

    get size(): number {
        return this.documents.size;
    }

    private validateValues(document: Document) {
        for (const entry of Object.entries(document.values)) {
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
                case 'tag':
                    if (valueType !== 'string') {
                        throw new Error(`Type mismatched: ${fieldType} -> ${valueType}`);
                    }
                    break;
                default:
                    // array
                    if (!Array.isArray(value)) {
                        throw new Error(`Type mismatched: ${valueType} != array`);
                    }
                    if (value.length === 0) {
                        break;
                    }
                    const arrayFieldType = fieldType === 'tags' ? 'string' : fieldType.substring(0, fieldType.length - 2);
                    const arrayValueType = typeof value[0];
                    if (arrayFieldType !== arrayValueType) {
                        throw new Error(`Type mismatched: ${fieldType} -> ${arrayValueType}[]`);
                    }
            }
        }
    }

    private addIndex(document: Document): void {
        const id = document.id as number;
        Object.entries(document.values).forEach(([fieldName, value]) => {
            const field = this.getField(fieldName);
            if (!field.indexed) {
                return;
            }
            const index = this.indexes.get(fieldName) as Index<PrimitiveType>;
            if (Array.isArray(value)) {
                index.add(id, value);
            } else {
                index.add(id, [value]);
            }
        });
    }

    private removeIndex(id: number): void {
        for (const index of this.indexes.values()) {
            index.remove(id);
        }
    }

    public findIds(query: Query): Set<number> {
        const entries = Object.entries(query)
            .filter(([fieldName]) => {
                if (!this.isField(fieldName)) {
                    throw new Error(`Unknown field: ${fieldName}`);
                }
                return true;
            })
            .map(([fieldName, value]) => {
                const field = this.getField(fieldName);
                return { field, value };
            })
            .filter(({ field }) => {
                if (!field.indexed) {
                    throw new Error(`No index: ${field.name}`);
                }
                return true;
            })
            .map(({ field, value }) => {
                const index = this.indexes.get(field.name) as Index<PrimitiveType>;
                const values = Array.isArray(value) ? value : [value];
                return { field, index, values };
            })
            .sort((left, right) => {
                const sizeL = left.index.size();
                const sizeR = right.index.size();
                if (sizeL !== sizeR) {
                    return sizeR - sizeL; // desc order
                }
                const typeL = left.field.type;
                const typeR = right.field.type;
                if (typeL !== typeR) {
                    const orderL = prefferedFieldTypeSortOrder.get(typeL) as number;
                    const orderR = prefferedFieldTypeSortOrder.get(typeR) as number;
                    return orderL - orderR;
                }
                return left.field.name.localeCompare(right.field.name);
            });

        if (entries.length === 0) {
            return new Set();
        }

        let current: Set<number> | undefined = undefined;
        for (const { index, values } of entries) {
            for (const val of values) {
                if (current === undefined) {
                    current = index.find(val);
                } else {
                    const next = index.find(val);
                    current = new Set([...(current as Set<number>)].filter((id) => next.has(id)));
                }
                if (current.size === 0) {
                    return new Set();
                }
            }
        }
        return current as Set<number>;
    }

    public find(query: Query): Set<Document> {
        const ids = this.findIds(query);
        return new Set([...ids].map((id) => this.documents.get(id) as Document));
    }

    public getAll(): Set<Document> {
        return new Set(this.documents.values());
    }

    public export(): Json {
        const c = this.counter;
        const i: { [key: string]: Json } = {};
        this.indexes.forEach((index, key) => {
            i[key] = index.export();
        });
        const d: { [key: number]: { i: number; v: Json } } = {};
        this.documents.forEach((doc, id) => {
            d[id] = {
                i: doc.id || 0,
                v: doc.values,
            };
        });
        const output: ExportType = {
            c,
            i,
            d,
        };
        return output;
    }

    public import(data: Json): Collection {
        const input = data as ExportType;
        this.counter = input.c;
        this.indexes = new Map<string, Index<PrimitiveType>>();
        Object.entries(input.i).forEach(([name, index]) => {
            const field = this.fields.get(name);
            if (!field?.indexed) {
                return;
            }
            this.initIndex(name, field.type).import(index, field.type);
        });
        this.documents = new Map<number, Document>();
        Object.entries(input.d).forEach(([idStr, { i, v }]) => {
            const id = Number(idStr);
            const doc: Document = {
                id: i,
                values: v as Values,
            };
            this.documents.set(id, doc);
        });
        return this;
    }

    public clear() {
        const fields = Array.from(this.fields.entries()).map((item) => item[1]);
        this.counter = 0;
        this.fields = new Map<string, Field>();
        this.indexes = new Map<string, Index<PrimitiveType>>();
        this.documents = new Map<number, Document>();
        this.init(fields);
    }
}
