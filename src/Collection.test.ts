import { Collection } from './Collection';
import { Field } from './types';

describe('Collection', () => {
    let collection: Collection;

    beforeEach(() => {
        collection = new Collection([
            {
                name: 'indexed-string',
                type: 'string',
                indexed: true,
            },
            {
                name: 'noindexed-boolean',
                type: 'boolean',
                indexed: false,
            },
            {
                name: 'indexed-string-array',
                type: 'string[]',
                indexed: true,
            },
            {
                name: 'indexed-number-array',
                type: 'number[]',
                indexed: true,
            },
            { name: 'indexed-tags', type: 'tags', indexed: true },
        ]);
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
            collection.getField('unknown-field');
        }).toThrow('Unknown field name:');
    });

    it('add / has / get / update / remove / size works', () => {
        expect(() => {
            collection.add({ id: 99, values: {} });
        }).toThrow('Not new Document:');
        expect(collection.add({ values: { 'indexed-string': 'initial value' } }).id).toBe(1);
        expect(collection.size).toBe(1);

        expect(collection.has(99)).toBe(false);
        expect(() => {
            collection.get(99);
        }).toThrow('Unknown id:');
        expect(collection.has(1)).toBe(true);
        expect(collection.get(1).id).toBe(1);
        expect(collection.size).toBe(1);

        expect(() => {
            collection.update({ values: {} });
        }).toThrow('Document has no id');
        expect(() => {
            collection.update({ id: 99, values: {} });
        }).toThrow('Unknown id:');
        expect(
            collection.update({
                id: 1,
                values: { 'indexed-string': 'updated value' },
            }).values['indexed-string']
        ).toBe('initial value');
        expect(collection.get(1).values['indexed-string']).toBe('updated value');
        expect(collection.size).toBe(1);

        expect(() => {
            collection.remove(99);
        }).toThrow('Unknown id:');
        expect(collection.remove(1).id).toBe(1);
        expect(collection.has(1)).toBe(false);
        expect(collection.size).toBe(0);
    });

    it('removeMatched works', () => {
        collection.add({ values: { 'indexed-string': 'aaa' } });
        collection.add({ values: { 'indexed-string': 'aaabbb' } });
        collection.add({ values: { 'indexed-string': 'aaabbbccc' } });
        expect(collection.size).toBe(3);

        expect(collection.removeMatched({ 'indexed-string': 'bbb' })).toBe(2);
        expect(collection.size).toBe(1);
        expect(collection.removeMatched({ 'indexed-string': 'ccc' })).toBe(0);
        expect(collection.size).toBe(1);
        expect(collection.removeMatched({ 'indexed-string': 'aaa' })).toBe(1);
        expect(collection.size).toBe(0);
    });

    it('validateValues works', () => {
        expect(() => {
            collection.add({ values: { 'unknown-field': true } });
        }).toThrow('Unknown field name:');
        expect(() => {
            collection.add({ values: { 'indexed-string': true } });
        }).toThrow('Type mismatched: string -> boolean');
        expect(() => {
            collection.add({ values: { 'indexed-string-array': true } });
        }).toThrow('Type mismatched: boolean != array');
        expect(() => {
            collection.add({ values: { 'indexed-string-array': [true] } });
        }).toThrow('Type mismatched: string[] -> boolean[]');

        expect(collection.add({ values: { 'indexed-string': '' } })).toBeTruthy();
        expect(collection.add({ values: { 'noindexed-boolean': false } })).toBeTruthy();
        expect(collection.add({ values: { 'indexed-string-array': ['a', 'b', 'c'] } })).toBeTruthy();
        expect(collection.add({ values: { 'indexed-number-array': [0, 1, 2] } })).toBeTruthy();
    });

    it('find works with single document', () => {
        const collection = new Collection([
            { name: 'str', type: 'string', indexed: true },
            { name: 'str-arr', type: 'string[]', indexed: true },
            { name: 'num', type: 'number', indexed: true },
            { name: 'num-arr', type: 'number[]', indexed: true },
            { name: 'bool', type: 'boolean', indexed: true },
            { name: 'tag', type: 'tag', indexed: true },
            { name: 'tags', type: 'tags', indexed: true },
            { name: 'noindex', type: 'string', indexed: false },
        ]);
        collection.add({
            values: {
                str: 'aaaaaa',
                'str-arr': ['bbbbbb', 'cccccc'],
                num: 10,
                'num-arr': [100, 200],
                bool: false,
                tag: 'zzz',
                tags: ['abc', 'bcd', 'def'],
            },
        });

        expect(() => {
            collection.find({
                unknown: [-1],
            });
        }).toThrowError('Unknown field:');

        expect(() => {
            collection.find({
                noindex: [-1],
            });
        }).toThrowError('No index:');

        expect(collection.find({}).size).toBe(0);

        expect(collection.find({ str: 'aaaa' }).size).toBe(1);
        expect(collection.find({ str: 'bbbb' }).size).toBe(0);
        expect(collection.find({ str: ['aaaa', 'bbbb'] }).size).toBe(0);

        expect(collection.find({ 'str-arr': 'bbbb' }).size).toBe(1);
        expect(collection.find({ 'str-arr': ['bbbb', 'cccc'] }).size).toBe(1);
        expect(collection.find({ 'str-arr': 'dddd' }).size).toBe(0);

        expect(collection.find({ num: 10 }).size).toBe(1);
        expect(collection.find({ num: 100 }).size).toBe(0);
        expect(collection.find({ num: [10, 20] }).size).toBe(0);

        expect(collection.find({ 'num-arr': 100 }).size).toBe(1);
        expect(collection.find({ 'num-arr': [100, 200] }).size).toBe(1);
        expect(collection.find({ 'num-arr': 1000 }).size).toBe(0);

        expect(collection.find({ bool: false }).size).toBe(1);
        expect(collection.find({ bool: true }).size).toBe(0);

        expect(collection.find({ tag: 'zzz' }).size).toBe(1);
        expect(collection.find({ tag: 'zz' }).size).toBe(0);

        expect(collection.find({ tags: 'abc' }).size).toBe(1);
        expect(collection.find({ tags: 'ab' }).size).toBe(0);
        expect(collection.find({ tags: ['abc', 'bcd'] }).size).toBe(1);

        expect(
            collection.find({
                str: 'aaaa',
                'str-arr': ['bbbb', 'cccc'],
                num: 10,
                'num-arr': [100, 200],
                bool: false,
                tag: 'zzz',
                tags: ['bcd', 'def'],
            }).size
        ).toBe(1);
        expect(
            collection.find({
                str: 'aaaa',
                'str-arr': ['bbbb', 'cccc'],
                num: 10,
                'num-arr': [100, 200],
                bool: false,
                tag: 'zzz',
                tags: ['bcd', 'ef'],
            }).size
        ).toBe(0);
    });

    it('find works with multiple documents', () => {
        const collection = new Collection([
            { name: 'str', type: 'string', indexed: true },
            { name: 'str-arr', type: 'string[]', indexed: true },
            { name: 'num', type: 'number', indexed: true },
            { name: 'num-arr', type: 'number[]', indexed: true },
        ]);

        collection.add({ values: { str: 'aaa' } });
        collection.add({ values: { str: 'bbb' } });
        collection.add({ values: { num: 10 } });
        collection.add({ values: { num: 20 } });
        collection.add({ values: { str: 'aaa' } });
        collection.add({ values: { str: 'bbb', num: 10 } });
        collection.add({ values: { str: 'bbb', num: 20 } });

        expect(collection.find({ str: 'aaa' }).size).toBe(2);
        expect(collection.find({ str: 'bbb' }).size).toBe(3);
        expect(collection.find({ num: 10 }).size).toBe(2);
        expect(collection.find({ str: 'bbb', num: 10 }).size).toBe(1);
        expect(collection.find({ str: 'aaa', num: 10 }).size).toBe(0);

        collection.add({
            values: { 'str-arr': ['aaa', 'bbb'], 'num-arr': [10, 20] },
        });
        collection.add({
            values: { 'str-arr': ['bbb', 'ccc'], 'num-arr': [20, 30] },
        });

        expect(collection.find({ 'str-arr': 'aaa' }).size).toBe(1);
        expect(collection.find({ 'str-arr': 'bbb' }).size).toBe(2);
        expect(collection.find({ 'str-arr': 'bbb', 'num-arr': 10 }).size).toBe(1);
        expect(collection.find({ 'str-arr': 'bbb', 'num-arr': 20 }).size).toBe(2);
        expect(collection.find({ 'str-arr': ['bbb', 'ccc'], 'num-arr': 20 }).size).toBe(1);
        expect(collection.find({ 'str-arr': 'bbb', 'num-arr': [10, 20] }).size).toBe(1);
    });

    it('getAll works', () => {
        expect(collection.getAll().size).toBe(0);
        collection.add({ values: { 'indexed-string': 'value1' } });
        collection.add({ values: { 'indexed-string': 'value2' } });
        collection.add({ values: { 'indexed-string': 'value3' } });
        expect(collection.getAll().size).toBe(3);
        collection.remove(1);
        collection.remove(2);
        collection.remove(3);
        expect(collection.getAll().size).toBe(0);
    });

    it('getKeys works', () => {
        collection.add({ values: { 'indexed-tags': ['tag1', 'tag2', 'tag3'] } });
        collection.add({ values: { 'indexed-tags': ['tag2', 'tag3', 'tag4'] } });
        collection.add({ values: { 'indexed-tags': ['tag2', 'tag4', 'tag6'] } });

        const keys1 = collection.getKeys('indexed-tags');
        expect(keys1.get('tag1')).toBe(1);
        expect(keys1.get('tag2')).toBe(3);
        expect(keys1.get('tag3')).toBe(2);
        expect(keys1.get('tag4')).toBe(2);
        expect(keys1.get('tag5')).toBeUndefined();
        expect(keys1.get('tag6')).toBe(1);

        collection.remove(1);

        const keys2 = collection.getKeys('indexed-tags');
        expect(keys2.get('tag1')).toBe(0);
        expect(keys2.get('tag2')).toBe(2);
        expect(keys2.get('tag3')).toBe(1);
        expect(keys2.get('tag4')).toBe(2);
        expect(keys2.get('tag5')).toBeUndefined();
        expect(keys2.get('tag6')).toBe(1);

        collection.remove(2);

        const keys3 = collection.getKeys('indexed-tags');
        expect(keys3.get('tag1')).toBe(0);
        expect(keys3.get('tag2')).toBe(1);
        expect(keys3.get('tag3')).toBe(0);
        expect(keys3.get('tag4')).toBe(1);
        expect(keys3.get('tag5')).toBeUndefined();
        expect(keys3.get('tag6')).toBe(1);
    });

    it('export / import works', () => {
        const fields = [
            { name: 'str', type: 'string', indexed: true },
            { name: 'str-arr', type: 'string[]', indexed: true },
            { name: 'num', type: 'number', indexed: true },
            { name: 'num-arr', type: 'number[]', indexed: true },
        ] as Field[];
        const collectionToExport = new Collection(fields);

        collectionToExport.add({ values: { str: 'aaa' } });
        collectionToExport.add({ values: { str: 'bbb' } });
        collectionToExport.add({ values: { num: 10 } });
        collectionToExport.add({ values: { num: 20 } });
        collectionToExport.add({ values: { str: 'aaa' } });
        collectionToExport.add({ values: { str: 'bbb', num: 10 } });
        collectionToExport.add({ values: { str: 'bbb', num: 20 } });
        const doc1 = collectionToExport.get(1);
        const doc3 = collectionToExport.get(3);
        const doc6 = collectionToExport.get(6);

        const exportedCollection = collectionToExport.export();
        const collecitonToImport = new Collection(fields);
        collecitonToImport.import(exportedCollection);

        expect(collecitonToImport.find({ str: 'aaa' }).size).toBe(2);
        expect(collecitonToImport.find({ str: 'bbb' }).size).toBe(3);
        expect(collecitonToImport.find({ num: 10 }).size).toBe(2);
        expect(collecitonToImport.find({ str: 'bbb', num: 10 }).size).toBe(1);
        expect(collecitonToImport.find({ str: 'aaa', num: 10 }).size).toBe(0);
        expect(collecitonToImport.get(1)).toStrictEqual(doc1);
        expect(collecitonToImport.get(3)).toStrictEqual(doc3);
        expect(collecitonToImport.get(6)).toStrictEqual(doc6);

        const collectionToImportAsString = new Collection(fields);
        const exportedCollectionString = JSON.stringify(exportedCollection);
        const exportedCollectionJson = JSON.parse(exportedCollectionString);
        collectionToImportAsString.import(exportedCollectionJson);

        expect(collectionToImportAsString.find({ str: 'aaa' }).size).toBe(2);
        expect(collectionToImportAsString.find({ str: 'bbb' }).size).toBe(3);
        expect(collectionToImportAsString.find({ num: 10 }).size).toBe(2);
        expect(collectionToImportAsString.find({ str: 'bbb', num: 10 }).size).toBe(1);
        expect(collectionToImportAsString.find({ str: 'aaa', num: 10 }).size).toBe(0);
        expect(collectionToImportAsString.get(1)).toStrictEqual(doc1);
        expect(collectionToImportAsString.get(3)).toStrictEqual(doc3);
        expect(collectionToImportAsString.get(6)).toStrictEqual(doc6);
    });
});
