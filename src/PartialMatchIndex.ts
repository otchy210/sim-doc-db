import { toByteArray } from './TextUtils';
import { FieldType, Index, Json } from './types';

type TrieNodeExportType = {
    c: {
        [key: number]: TrieNodeExportType;
    };
    i: number[];
    p: {
        [key: number]: number[];
    };
};

class TrieNode {
    private children = [...Array<TrieNode>(256)];
    private ids = new Set<number>();
    private positions = new Map<number, Set<number>>();

    public getOrNewChild(byte: number): TrieNode {
        if (!this.children[byte]) {
            this.children[byte] = new TrieNode();
        }
        return this.children[byte];
    }

    public add(id: number): number {
        const isFirstId = this.ids.size === 0;
        this.ids.add(id);
        return isFirstId ? 1 : 0;
    }

    public addWithPos(id: number, pos: number): number {
        const isFirstId = this.ids.size === 0;
        this.add(id);
        if (!this.positions.has(id)) {
            this.positions.set(id, new Set());
        }
        this.positions.get(id)?.add(pos);
        return isFirstId ? 1 : 0;
    }

    public get(): Set<number> {
        return this.ids;
    }

    public getPositions(): Map<number, Set<number>> {
        return this.positions;
    }

    public getWithPos(offsetMap: Map<number, Set<number>>, index: number): Set<number> {
        return new Set(
            [...this.ids].filter((id) => {
                const offsets = offsetMap.get(id) ?? [];
                const position = this.positions.get(id);
                for (const offset of offsets) {
                    if (position?.has(offset + index)) {
                        return true;
                    }
                }
                return false;
            })
        );
    }

    public remove(id: number): number {
        if (this.ids.has(id)) {
            this.ids.delete(id);
            this.positions.delete(id);
            if (this.ids.size === 0) {
                return 1;
            }
        }
        return 0;
    }

    public removeRecursively(id: number): number {
        let removed = this.remove(id);
        this.children
            .filter((node) => node)
            .forEach((node) => {
                removed += node.removeRecursively(id);
            });
        return removed;
    }

    public removeChildren(id: number): number {
        let removed = 0;
        for (const child of this.children) {
            if (!child) {
                continue;
            }
            removed += child.remove(id);
        }
        return removed;
    }

    public export(): TrieNodeExportType {
        const output: TrieNodeExportType = {
            i: Array.from(this.ids),
            c: {},
            p: {},
        };
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (!child) {
                continue;
            }
            output.c[i] = child.export();
        }
        this.positions.forEach((value, key) => {
            output.p[key] = Array.from(value);
        });
        return output;
    }

    public import(data: TrieNodeExportType): TrieNode {
        this.ids = new Set(data.i);
        for (let i = 0; i < this.children.length; i++) {
            if (data.c[i]) {
                this.getOrNewChild(i).import(data.c[i]);
            }
        }
        Object.entries(data.p).forEach(([key, value]) => {
            const index = Number(key);
            this.positions.set(index, new Set(value));
        });
        return this;
    }
}

type ExportType = {
    s: number;
    m: TrieNodeExportType;
    b: TrieNodeExportType;
    t: TrieNodeExportType;
};

export class PartialMatchIndex implements Index<string> {
    private monogramRoot = new TrieNode();
    private bigramRoot = new TrieNode();
    private trigramRoot = new TrieNode();
    private totalSize = 0;

    public add(id: number, values: string[]): void {
        values.forEach((value) => this.addSingle(id, value));
    }

    private addSingle(id: number, value: string): void {
        const bytes = toByteArray(value.normalize());
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            this.totalSize += this.monogramRoot.getOrNewChild(byte).add(id);
            if (i < bytes.length - 1) {
                const nextByte = bytes[i + 1];
                this.totalSize += this.bigramRoot.getOrNewChild(byte).getOrNewChild(nextByte).add(id);
                if (i < bytes.length - 2) {
                    const nextnextByte = bytes[i + 2];
                    this.totalSize += this.trigramRoot.getOrNewChild(byte).getOrNewChild(nextByte).getOrNewChild(nextnextByte).addWithPos(id, i);
                }
            }
        }
    }

    public find(query: string): Set<number> {
        const bytes = toByteArray(query.normalize());
        if (bytes.length === 1) {
            return this.monogramRoot.getOrNewChild(bytes[0]).get();
        }
        if (bytes.length === 2) {
            return this.bigramRoot.getOrNewChild(bytes[0]).getOrNewChild(bytes[1]).get();
        }
        const initialNode = this.trigramRoot.getOrNewChild(bytes[0]).getOrNewChild(bytes[1]).getOrNewChild(bytes[2]);
        let current = initialNode.get();
        if (bytes.length === 3) {
            return current;
        }
        const offsetMap = initialNode.getPositions();
        for (let i = 1; i < bytes.length - 2; i++) {
            const next = this.trigramRoot
                .getOrNewChild(bytes[i])
                .getOrNewChild(bytes[i + 1])
                .getOrNewChild(bytes[i + 2])
                .getWithPos(offsetMap, i);
            // intersection
            current = new Set([...current].filter((id) => next.has(id)));
            if (current.size === 0) {
                return current;
            }
        }
        return current;
    }

    public remove(id: number): void {
        this.totalSize -= this.monogramRoot.removeChildren(id);
        this.totalSize -= this.bigramRoot.removeRecursively(id);
        this.totalSize -= this.trigramRoot.removeRecursively(id);
    }

    public size(): number {
        return this.totalSize;
    }

    public keys(): Map<string, number> {
        throw new Error('keys() is not supported in PartialMatchIndex');
    }

    export(): Json {
        const output: ExportType = {
            s: this.totalSize,
            m: this.monogramRoot.export(),
            b: this.bigramRoot.export(),
            t: this.trigramRoot.export(),
        };
        return output;
    }

    import(data: Json, fieldType: FieldType = 'string'): void {
        if (fieldType !== 'string' && fieldType !== 'string[]') {
            throw new Error(`Unexpected fieldType: ${fieldType}`);
        }
        const input = data as ExportType;
        this.totalSize = input.s;
        this.monogramRoot = new TrieNode().import(input.m);
        this.bigramRoot = new TrieNode().import(input.b);
        this.trigramRoot = new TrieNode().import(input.t);
    }
}
