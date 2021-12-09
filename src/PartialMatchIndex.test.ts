import { PartialMatchIndex } from './PartialMatchIndex'

describe('PartialMatchIndex', () => {
    it('works with single byte case', () => {
        const index = new PartialMatchIndex();

        expect(() => {index.find('あ')}).toThrowError('No multi-bytes support yet.');

        index.add(1, ['abc', 'def']);
        index.add(2, ['ab', 'de']);
        index.add(3, ['a', 'd']);

        expect(index.find('a').size).toBe(3);
        expect(index.find('b').size).toBe(2);
        expect(index.find('c').size).toBe(1);
        expect(index.find('d').size).toBe(3);
        expect(index.find('e').size).toBe(2);
        expect(index.find('f').size).toBe(1);

        index.remove(1);

        expect(index.find('a').size).toBe(2);
        expect(index.find('b').size).toBe(1);
        expect(index.find('c').size).toBe(0);
        expect(index.find('d').size).toBe(2);
        expect(index.find('e').size).toBe(1);
        expect(index.find('f').size).toBe(0);
    });
})