import { Index } from './types';

const normalize = <T>(value: T): T => {
    if (typeof value === 'string') {
        return (value as string).normalize() as unknown as T;
    }
    return value;
};

export class ExactMatchIndex<T> implements Index<T> {
    private map = new Map<T, Set<number>>();
    private totalSize = 0;

    public add(id: number, values: T[]): void {
        values.forEach((value) => {
            const normalizedValue = normalize(value);
            if (!this.map.has(normalizedValue)) {
                this.map.set(normalizedValue, new Set());
            }
            const idSet = this.map.get(normalizedValue) as Set<number>;
            if (idSet.size === 0) {
                this.totalSize++;
            }
            idSet.add(id);
        });
    }

    public find(value: T): Set<number> {
        const normalizedValue = normalize(value);
        return this.map.get(normalizedValue) ?? new Set();
    }

    public remove(id: number): void {
        this.map.forEach((idSet) => {
            if (idSet.has(id)) {
                idSet.delete(id);
                if (idSet.size === 0) {
                    this.totalSize--;
                }
            }
        });
    }

    public size(): number {
        return this.totalSize;
    }

    public keys(): Map<T, number> {
        return Array.from(this.map.entries()).reduce((map, [key, set]) => {
            map.set(key, set.size);
            return map;
        }, new Map<T, number>());
    }
}
