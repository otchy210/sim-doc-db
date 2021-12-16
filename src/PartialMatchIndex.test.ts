import { PartialMatchIndex } from './PartialMatchIndex';

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

    it('works with more than 3 bytes case', () => {
        const index = new PartialMatchIndex();

        index.add(1, ['aaaa']);
        index.add(2, ['aaa']);

        expect(index.find('aaaa').size).toBe(1);

        index.add(3, ['bbbba', 'bbbbb']);
        index.add(4, ['bbbaa', 'bbbbb']);

        expect(index.find('bbbb').size).toBe(2);
        expect(index.find('bbba').size).toBe(2);

        index.add(5, ['aaacc']);
        index.add(6, ['aaccc']);

        expect(index.find('c').size).toBe(2);
        expect(index.find('cc').size).toBe(2);
        expect(index.find('ccc').size).toBe(1);
        expect(index.find('aacc').size).toBe(2);
        expect(index.find('accc').size).toBe(1);
        expect(index.find('aaccc').size).toBe(1);
        expect(index.find('aaaccc').size).toBe(0);

        index.remove(6);

        expect(index.find('c').size).toBe(1);
        expect(index.find('cc').size).toBe(1);
        expect(index.find('ccc').size).toBe(0);
        expect(index.find('aacc').size).toBe(1);
        expect(index.find('accc').size).toBe(0);
        expect(index.find('aaccc').size).toBe(0);
        expect(index.find('aaaccc').size).toBe(0);

        index.remove(5);

        expect(index.find('c').size).toBe(0);
        expect(index.find('cc').size).toBe(0);
        expect(index.find('aacc').size).toBe(0);
    });

    it('works with non ascii char case', () => {
        const index = new PartialMatchIndex();

        index.add(1, ['あ']);
        index.add(2, ['あい']);
        index.add(3, ['あいう']);
        index.add(4, ['あ🙂']);
        index.add(5, ['あ🙂い']);
        index.add(6, ['あ🙂い🙂う']);

        expect(index.find('あ').size).toBe(6);
        expect(index.find('あい').size).toBe(2);
        expect(index.find('あいう').size).toBe(1);
        expect(index.find('🙂').size).toBe(3);
        expect(index.find('🙂い').size).toBe(2);
        expect(index.find('🙂う').size).toBe(1);

        index.remove(3);
        index.remove(6);

        expect(index.find('あ').size).toBe(4);
        expect(index.find('あい').size).toBe(1);
        expect(index.find('あいう').size).toBe(0);
        expect(index.find('🙂').size).toBe(2);
        expect(index.find('🙂い').size).toBe(1);
        expect(index.find('🙂う').size).toBe(0);

        index.remove(2);
        index.remove(5);

        expect(index.find('あ').size).toBe(2);
        expect(index.find('あい').size).toBe(0);
        expect(index.find('🙂').size).toBe(1);
        expect(index.find('🙂い').size).toBe(0);

        index.remove(1);
        index.remove(4);

        expect(index.find('あ').size).toBe(0);
        expect(index.find('🙂').size).toBe(0);
    });

    it('size works', () => {
        const index = new PartialMatchIndex();
        expect(index.size()).toBe(0);

        index.add(1, ['a']); // a
        expect(index.size()).toBe(1);

        index.add(2, ['aa']); // aa
        expect(index.size()).toBe(2);

        index.add(3, ['aaa']); // aaa
        expect(index.size()).toBe(3);

        index.add(4, ['aab']); // aab, ab, b
        expect(index.size()).toBe(6);

        index.add(5, ['bbbb']); // bb, bbb
        expect(index.size()).toBe(8);

        index.add(6, ['abc', 'bcd']); // abc, bc, c, bcd, cd, d
        index.add(7, ['dddddddddd']); // dd, ddd
        expect(index.size()).toBe(16);

        index.remove(6);
        expect(index.size()).toBe(11);
        index.remove(7);
        expect(index.size()).toBe(8);

        index.remove(1);
        index.remove(2);
        expect(index.size()).toBe(8);
        index.remove(3);
        expect(index.size()).toBe(7);

        index.remove(5);
        expect(index.size()).toBe(5);
        index.remove(4);
        expect(index.size()).toBe(0);
    });
});
