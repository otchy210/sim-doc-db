export class Collection {
    indexed;
    constructor(fields) {
        this.indexed = new Map();
        fields.forEach(field => {
            this.indexed.set(field.name, field.indexed);
        });
    }
    isIndexed(fieldName) {
        if (!this.indexed.has(fieldName)) {
            throw new Error(`Unknown field name: ${fieldName}`);
        }
        return this.indexed.get(fieldName);
    }
}
