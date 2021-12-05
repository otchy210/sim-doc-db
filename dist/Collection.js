export class Collection {
    counter;
    fields;
    documents;
    constructor(fields) {
        this.counter = 0;
        this.fields = new Map();
        this.documents = new Map();
        ;
        fields.forEach(field => {
            this.fields.set(field.name, field);
        });
    }
    isField(fieldName) {
        return this.fields.has(fieldName);
    }
    getField(fieldName) {
        if (!this.isField(fieldName)) {
            throw new Error(`Unknown field name: ${fieldName}`);
        }
        return this.fields.get(fieldName);
    }
    add(document) {
        if (document.id !== undefined) {
            throw new Error(`Not new Document: ${document.id}`);
        }
        document.id = (this.counter += 1);
        this.documents.set(document.id, document);
        return document;
    }
    get(id) {
        if (!this.documents.has(id)) {
            throw new Error(`Unknown id: ${id}`);
        }
        return this.documents.get(id);
    }
}
