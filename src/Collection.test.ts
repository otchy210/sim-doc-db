import { Collection } from './Collection';

describe('Collection', ()=> {
    it('isIndexed works', () => {
        const collection = new Collection([{
            name: 'indexed-string',
            type: 'string',
            indexed: true
        }, {
            name: 'noindexed-boolean',
            type: 'boolean',
            indexed: false
        }]);

        expect(collection.isIndexed('indexed-string')).toBe(true);
        expect(collection.isIndexed('noindexed-boolean')).toBe(false);
        expect(() => {
            collection.isIndexed('unknown-field')
        }).toThrow('Unknown field');
    });
});
