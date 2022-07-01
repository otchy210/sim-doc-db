import { FieldType, Index, Json } from './types';

const normalize = <T>(value: T): T => {
    if (typeof value === 'string') {
        return (value as string).normalize() as unknown as T;
    }
    return value;
};

const getExportKey = <T>(key: T): string => {
    if (typeof key === 'string') {
        return key;
    }
    if (typeof key === 'boolean') {
        return key ? 't' : 'f';
    }
    return String(key);
};

const getImportKey = <T>(key: string, fieldType: FieldType): T => {
    switch (fieldType) {
        case 'string':
        case 'string[]':
        case 'tag':
        case 'tags':
            return key as unknown as T;
        case 'number':
        case 'number[]':
            return Number(key) as unknown as T;
        case 'boolean':
            return (key === 't' ? true : false) as unknown as T;
    }
};

type ExportType = { s: number; d: { [key: string]: number[] } };

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

    export(): Json {
        const output: ExportType = { s: this.totalSize, d: {} };
        this.map.forEach((value, key) => {
            const exportKey = getExportKey(key);
            output.d[exportKey] = Array.from(value);
        });
        return output;
    }

    import(fieldType: FieldType, data: Json): void {
        this.map = new Map<T, Set<number>>();
        const input = data as ExportType;
        this.totalSize = input.s;
        Object.entries(input.d).forEach(([key, values]) => {
            const importKey = getImportKey<T>(key, fieldType);
            this.map.set(importKey, new Set(values));
        });
    }
}
