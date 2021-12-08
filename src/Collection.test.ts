import { Collection } from './Collection';

describe('Collection', ()=> {
    const collection = new Collection([{
        name: 'indexed-string',
        type: 'string',
        indexed: true
    }, {
        name: 'noindexed-boolean',
        type: 'boolean',
        indexed: false
    }, {
        name: 'indexed-string-array',
        type: 'string[]',
        indexed: true
    }, {
        name: 'indexed-number-array',
        type: 'number[]',
        indexed: true
    }]);

    it('isField works', () => {
        expect(collection.isField('indexed-string')).toBe(true);
        expect(collection.isField('noindexed-boolean')).toBe(true);
        expect(collection.isField('unknown-field')).toBe(false);
    });

    it('getField works', () => {
        expect(collection.getField('indexed-string').indexed).toBe(true);
        expect(collection.getField('noindexed-boolean').indexed).toBe(false);
        expect(() => {
            collection.getField('unknown-field')
        }).toThrow('Unknown field name:');
    });

    it('add / has / get / update / remove works', () => {
        expect(() => {
            collection.add({id: 99, values: {}});
        }).toThrow('Not new Document:');
        expect(collection.add({values: {'indexed-string': 'initial value'}}).id).toBe(1);

        expect(collection.has(99)).toBe(false);
        expect(() => {
            collection.get(99);
        }).toThrow('Unknown id:');
        expect(collection.has(1)).toBe(true);
        expect(collection.get(1).id).toBe(1);

        expect(() => {
            collection.update({values: {}});
        }).toThrow('Document has no id');
        expect(() => {
            collection.update({id: 99, values: {}});
        }).toThrow('Unknown id:');
        expect(collection.update({
            id: 1, values: {'indexed-string': 'updated value'}
        }).values['indexed-string']).toBe('initial value');
        expect(collection.get(1).values['indexed-string']).toBe('updated value');

        expect(() => {
            collection.remove(99)
        }).toThrow('Unknown id:');
        expect(collection.remove(1).id).toBe(1);
        expect(collection.has(1)).toBe(false);
    });

    it('validateValues works', () => {
        expect(() => {
            collection.add({values: {'unknown-field': true}});
        }).toThrow('Unknown field name:');
        expect(() => {
            collection.add({values: {'indexed-string': true}});
        }).toThrow('Type mismatched: string -> boolean');
        expect(() => {
            collection.add({values: {'indexed-string-array': true}});
        }).toThrow('Type mismatched: boolean != array');
        expect(() => {
            collection.add({values: {'indexed-string-array': [true]}});
        }).toThrow('Type mismatched: string[] -> boolean[]');

        expect(collection.add({values: {'indexed-string': ''}})).toBeTruthy();
        expect(collection.add({values: {'noindexed-boolean': false}})).toBeTruthy();
        expect(collection.add({values: {'indexed-string-array': ['a', 'b', 'c']}})).toBeTruthy();
        expect(collection.add({values: {'indexed-number-array': [0, 1, 2]}})).toBeTruthy();
    });
});
