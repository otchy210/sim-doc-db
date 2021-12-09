export class ExactMatchIndex<T> {
    private index = new Map<T, Set<number>>();

    public add(id: number, values: T[]): void {
        values.forEach(value => {
            if (!this.index.has(value)) {
                this.index.set(value, new Set());
            }
            this.index.get(value)?.add(id);
        });
    }

    public find(value: T): Set<number> {
        if (this.index.has(value)) {
            return this.index.get(value) as Set<number>;
        }
        return new Set();
    }

    public remove(id: number): number {
        let count = 0;
        this.index.forEach((idSet) => {
            if (idSet.has(id)) {
                idSet.delete(id);
                count++;
            }
        });
        return count;
    }
}