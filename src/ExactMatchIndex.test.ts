import { ExactMatchIndex } from './ExactMatchIndex';

describe('ExactMatchIndex', () => {
    it('works with numbers', () => {
        const index = new ExactMatchIndex<number>();

        index.add(1, [100, 200, 300]);
        index.add(2, [100, 200]);
        index.add(3, [100, 300, 400]);

        expect(index.find(100).size).toBe(3);
        expect(index.find(200).size).toBe(2);
        expect(index.find(300).size).toBe(2);
        expect(index.find(400).size).toBe(1);

        expect(index.remove(1));

        expect(index.find(100).size).toBe(2);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(1);
        expect(index.find(400).size).toBe(1);

        expect(index.remove(3));

        expect(index.find(100).size).toBe(1);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(0);
        expect(index.find(400).size).toBe(0);
    });

    it('works with string', () => {
        const index = new ExactMatchIndex<string>();

        index.add(1, ['aaa', 'bbb', 'ccc']);
        index.add(2, ['aa', 'bb', 'cc']);
        index.add(3, ['aaa', 'bb', 'ddd']);

        expect(index.find('aaa').size).toBe(2);
        expect(index.find('aa').size).toBe(1);
    });
});