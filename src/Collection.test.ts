import { Collection } from './Collection';

describe('Collection', ()=> {

    let collection: Collection;

    beforeEach(() => {
        collection = new Collection([{
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
    });

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

    it('find works with single document', () => {
        const collection = new Collection([
            {name: 'str', type: 'string', indexed: true},
            {name: 'str-arr', type: 'string[]', indexed: true},
            {name: 'num', type: 'number', indexed: true},
            {name: 'num-arr', type: 'number[]', indexed: true},
            {name: 'bool', type: 'boolean', indexed: true},
            {name: 'tags', type: 'tags', indexed: true},
            {name: 'noindex', type: 'string', indexed: false},
        ]);
        collection.add({values: {
            'str': 'aaaaaa',
            'str-arr': ['bbbbbb', 'cccccc'],
            'num': 10,
            'num-arr': [100, 200],
            'bool': false,
            'tags': ['abc', 'bcd', 'def']
        }});

        expect(() => {
            collection.find({
                'unknown': [-1]
            });
        }).toThrowError('Unknown field:');

        expect(() => {
            collection.find({
                'noindex': [-1]
            });
        }).toThrowError('No index:');

        expect(collection.find({}).size).toBe(0);

        expect(collection.find({'str': 'aaaa'}).size).toBe(1);
        expect(collection.find({'str': 'bbbb'}).size).toBe(0);
        expect(collection.find({'str': ['aaaa', 'bbbb']}).size).toBe(0);

        expect(collection.find({'str-arr': 'bbbb'}).size).toBe(1);
        expect(collection.find({'str-arr': ['bbbb', 'cccc']}).size).toBe(1);
        expect(collection.find({'str-arr': 'dddd'}).size).toBe(0);

        expect(collection.find({'num': 10}).size).toBe(1);
        expect(collection.find({'num': 100}).size).toBe(0);
        expect(collection.find({'num': [10, 20]}).size).toBe(0);

        expect(collection.find({'num-arr': 100}).size).toBe(1);
        expect(collection.find({'num-arr': [100, 200]}).size).toBe(1);
        expect(collection.find({'num-arr': 1000}).size).toBe(0);

        expect(collection.find({'bool': false}).size).toBe(1);
        expect(collection.find({'bool': true}).size).toBe(0);

        expect(collection.find({'tags': 'abc'}).size).toBe(1);
        expect(collection.find({'tags': 'ab'}).size).toBe(0);
        expect(collection.find({'tags': ['abc', 'bcd']}).size).toBe(1);

        expect(collection.find({
            'str': 'aaaa',
            'str-arr': ['bbbb', 'cccc'],
            'num': 10,
            'num-arr': [100, 200],
            'bool': false,
            'tags': ['bcd', 'def'],
        }).size).toBe(1);
        expect(collection.find({
            'str': 'aaaa',
            'str-arr': ['bbbb', 'cccc'],
            'num': 10,
            'num-arr': [100, 200],
            'bool': false,
            'tags': ['bcd', 'ef'],
        }).size).toBe(0);
    });

    it('find works with multiple documents', () => {
        const collection = new Collection([
            {name: 'str', type: 'string', indexed: true},
            {name: 'str-arr', type: 'string[]', indexed: true},
            {name: 'num', type: 'number', indexed: true},
            {name: 'num-arr', type: 'number[]', indexed: true},
        ]);

        collection.add({values: {'str': 'aaa'}});
        collection.add({values: {'str': 'bbb'}});
        collection.add({values: {'num': 10}});
        collection.add({values: {'num': 20}});
        collection.add({values: {'str': 'aaa'}});
        collection.add({values: {'str': 'bbb', 'num': 10}});
        collection.add({values: {'str': 'bbb', 'num': 20}});

        expect(collection.find({'str': 'aaa'}).size).toBe(2);
        expect(collection.find({'str': 'bbb'}).size).toBe(3);
        expect(collection.find({'num': 10}).size).toBe(2);
        expect(collection.find({'str': 'bbb', 'num': 10}).size).toBe(1);
        expect(collection.find({'str': 'aaa', 'num': 10}).size).toBe(0);

        collection.add({values: {'str-arr': ['aaa', 'bbb'], 'num-arr': [10, 20]}});
        collection.add({values: {'str-arr': ['bbb', 'ccc'], 'num-arr': [20, 30]}});

        expect(collection.find({'str-arr': 'aaa'}).size).toBe(1);
        expect(collection.find({'str-arr': 'bbb'}).size).toBe(2);
        expect(collection.find({'str-arr': 'bbb', 'num-arr': 10}).size).toBe(1);
        expect(collection.find({'str-arr': 'bbb', 'num-arr': 20}).size).toBe(2);
        expect(collection.find({'str-arr': ['bbb', 'ccc'], 'num-arr': 20}).size).toBe(1);
        expect(collection.find({'str-arr': 'bbb', 'num-arr': [10, 20]}).size).toBe(1);
    });
});
