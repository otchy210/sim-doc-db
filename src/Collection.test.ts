import { Collection, Document } from './Collection';

describe('Collection', ()=> {
    const collection = new Collection([{
        name: 'indexed-string',
        type: 'string',
        indexed: true
    }, {
        name: 'noindexed-boolean',
        type: 'boolean',
        indexed: false
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

    it('add / get works', () => {
        expect(() => {
            collection.add({id: 99, values: {}});
        }).toThrow('Not new Document:');
        expect(collection.add({values: {}}).id).toBe(1);

        expect(() => {
            collection.get(99);
        }).toThrow('Unknown id:');
        expect(collection.get(1).id).toBe(1);
    })
});
