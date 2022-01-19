import { toByteArray } from './TextUtils';

describe('toByteArray', () => {
    it('works', () => {
        const aBytes = toByteArray('a');
        expect(aBytes[0]).toBe(97);

        const aiuBytes = toByteArray('あいう');
        expect(aiuBytes.length).toBe(9);
        expect(aiuBytes[0]).toBe(227);
        expect(aiuBytes[1]).toBe(129);
        expect(aiuBytes[2]).toBe(130);

        const smileBytes = toByteArray('😄');
        expect(smileBytes.length).toBe(4);
        expect(smileBytes[0]).toBe(240);
        expect(smileBytes[1]).toBe(159);
        expect(smileBytes[2]).toBe(152);
        expect(smileBytes[3]).toBe(132);

        const separatePa = 'ぱ'; // は＋゜
        const singlePa = 'ぱ'; // ぱ
        const normalizedSeparatePa = separatePa.normalize();
        const separatePaBytes = toByteArray(separatePa);
        const singlePaBytes = toByteArray(singlePa);
        const normalizedSeparatePaBytes = toByteArray(normalizedSeparatePa);
        expect(separatePaBytes.length).toBe(6);
        expect(singlePaBytes.length).toBe(3);
        expect(normalizedSeparatePaBytes).toStrictEqual(singlePaBytes);
    });
});
