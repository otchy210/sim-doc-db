import { ExactMatchIndex } from './ExactMatchIndex';

describe('ExactMatchIndex', () => {
    it('works with numbers', () => {
        const index = new ExactMatchIndex<number>();

        index.add(1, [100, 200, 300]);
        index.add(2, [100, 200]);
        index.add(3, [100, 300, 400]);
        expect(index.size()).toBe(4);

        expect(index.find(100).size).toBe(3);
        expect(index.find(200).size).toBe(2);
        expect(index.find(300).size).toBe(2);
        expect(index.find(400).size).toBe(1);

        const keys1 = index.keys();
        expect(keys1.get(100)).toBe(3);
        expect(keys1.get(200)).toBe(2);
        expect(keys1.get(300)).toBe(2);
        expect(keys1.get(400)).toBe(1);

        expect(index.remove(1));
        expect(index.size()).toBe(4);

        expect(index.find(100).size).toBe(2);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(1);
        expect(index.find(400).size).toBe(1);

        expect(index.remove(3));
        expect(index.size()).toBe(2);

        expect(index.find(100).size).toBe(1);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(0);
        expect(index.find(400).size).toBe(0);

        const keys2 = index.keys();
        expect(keys2.get(100)).toBe(1);
        expect(keys2.get(200)).toBe(1);
        expect(keys2.get(300)).toBe(0);
        expect(keys2.get(400)).toBe(0);
    });

    it('works with string', () => {
        const index = new ExactMatchIndex<string>();

        index.add(1, ['aaa', 'bbb', 'ccc']);
        index.add(2, ['aa', 'bb', 'cc']);
        index.add(3, ['aaa', 'bb', 'ddd']);
        expect(index.size()).toBe(7);

        expect(index.find('aaa').size).toBe(2);
        expect(index.find('aa').size).toBe(1);

        const keys1 = index.keys();
        expect(keys1.get('aaa')).toBe(2);
        expect(keys1.get('aa')).toBe(1);
        expect(keys1.get('bb')).toBe(2);

        index.remove(1);
        index.remove(2);
        expect(index.size()).toBe(3);

        const keys2 = index.keys();
        expect(keys2.get('aaa')).toBe(1);
        expect(keys2.get('aa')).toBe(0);
        expect(keys2.get('bb')).toBe(1);
    });

    it('works with boolean', () => {
        const index = new ExactMatchIndex<boolean>();

        index.add(1, [true]);
        index.add(2, [false]);
        index.add(3, [false]);
        expect(index.size()).toBe(2);

        expect(index.find(true).size).toBe(1);
        expect(index.find(false).size).toBe(2);

        const keys1 = index.keys();
        expect(keys1.get(true)).toBe(1);
        expect(keys1.get(false)).toBe(2);

        index.remove(1);
        expect(index.size()).toBe(1);

        expect(index.find(true).size).toBe(0);
        expect(index.find(false).size).toBe(2);

        const keys2 = index.keys();
        expect(keys2.get(true)).toBe(0);
        expect(keys2.get(false)).toBe(2);

        index.remove(2);
        expect(index.size()).toBe(1);
        index.remove(3);
        expect(index.size()).toBe(0);

        expect(index.find(true).size).toBe(0);
        expect(index.find(false).size).toBe(0);
    });
});
