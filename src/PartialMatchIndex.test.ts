import { PartialMatchIndex } from './PartialMatchIndex'

describe('PartialMatchIndex', () => {
    it('works with single byte case', () => {
        const index = new PartialMatchIndex();

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

    it('works with double bytes case', () => {
        const index = new PartialMatchIndex();

        index.add(1, ['aabbcc', 'abcabc']);
        index.add(2, ['aabb', 'bbcc']);
        index.add(3, ['ab', 'bc']);

        expect(index.find('ab').size).toBe(3);
        expect(index.find('aa').size).toBe(2);
        expect(index.find('bb').size).toBe(2);
        expect(index.find('bc').size).toBe(3);
        expect(index.find('cc').size).toBe(2);
        expect(index.find('ca').size).toBe(1);
        expect(index.find('dd').size).toBe(0);

        index.remove(3);

        expect(index.find('ab').size).toBe(2);
        expect(index.find('aa').size).toBe(2);
        expect(index.find('bb').size).toBe(2);
        expect(index.find('bc').size).toBe(2);
        expect(index.find('cc').size).toBe(2);
        expect(index.find('ca').size).toBe(1);
        expect(index.find('dd').size).toBe(0);

        index.remove(1);
        index.remove(2);

        expect(index.find('ab').size).toBe(0);
        expect(index.find('aa').size).toBe(0);
        expect(index.find('bb').size).toBe(0);
        expect(index.find('bc').size).toBe(0);
        expect(index.find('cc').size).toBe(0);
        expect(index.find('ca').size).toBe(0);
        expect(index.find('dd').size).toBe(0);
    });

    it('works with triple bytes case', () => {
        const index = new PartialMatchIndex();

        index.add(1, ['aaabbb', 'bbbccc']);
        index.add(2, ['aaaccc', 'bccc']);
        index.add(3, ['aaab', 'bbbc']);
        index.add(4, ['aa', 'bb']);

        expect(index.find('aaa').size).toBe(3);
        expect(index.find('bbb').size).toBe(2);
        expect(index.find('ccc').size).toBe(2);
        expect(index.find('aab').size).toBe(2);
        expect(index.find('bcc').size).toBe(2);
        expect(index.find('bbc').size).toBe(2);
        expect(index.find('abb').size).toBe(1);
        expect(index.find('ddd').size).toBe(0);

        index.remove(3);

        expect(index.find('aaa').size).toBe(2);
        expect(index.find('bbb').size).toBe(1);
        expect(index.find('ccc').size).toBe(2);
        expect(index.find('aab').size).toBe(1);
        expect(index.find('bcc').size).toBe(2);
        expect(index.find('bbc').size).toBe(1);
        expect(index.find('abb').size).toBe(1);
        expect(index.find('ddd').size).toBe(0);
    });
})