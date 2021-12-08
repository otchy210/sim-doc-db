import { NumberIndex } from './NumberIndex';

describe('NumberIndex', () => {
    const index = new NumberIndex();

    it('works', () => {
        index.add(1, [100, 200, 300]);
        index.add(2, [100, 200]);
        index.add(3, [100, 300, 400]);

        expect(index.find(100).size).toBe(3);
        expect(index.find(200).size).toBe(2);
        expect(index.find(300).size).toBe(2);
        expect(index.find(400).size).toBe(1);

        expect(index.remove(1)).toBe(3);

        expect(index.find(100).size).toBe(2);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(1);
        expect(index.find(400).size).toBe(1);

        expect(index.remove(3)).toBe(3);

        expect(index.find(100).size).toBe(1);
        expect(index.find(200).size).toBe(1);
        expect(index.find(300).size).toBe(0);
        expect(index.find(400).size).toBe(0);
    })
});