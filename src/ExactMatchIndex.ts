import { Index } from './types';

export class ExactMatchIndex<T> implements Index<T> {
    private map = new Map<T, Set<number>>();
    private totalSize = 0;

    public add(id: number, values: T[]): void {
        values.forEach((value) => {
            if (!this.map.has(value)) {
                this.map.set(value, new Set());
            }
            const idSet = this.map.get(value) as Set<number>;
            if (idSet.size === 0) {
                this.totalSize++;
            }
            idSet.add(id);
        });
    }

    public find(value: T): Set<number> {
        if (this.map.has(value)) {
            return this.map.get(value) as Set<number>;
        }
        return new Set();
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
