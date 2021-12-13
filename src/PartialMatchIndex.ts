import { toByteArray } from "./TextUtils";

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

    public add(id: number): void {
        this.ids.add(id);
    }

    public addWithPos(id: number, pos: number): void {
        this.add(id);
        if (!this.positions.has(id)) {
            this.positions.set(id, new Set());
        }
        this.positions.get(id)?.add(pos);
    }

    public get(): Set<number> {
        return this.ids;
    }

    public getPositions(): Map<number, Set<number>> {
        return this.positions;
    }

    public getWithPos(offsetMap: Map<number, Set<number>>, index: number): Set<number> {
        return new Set([...this.ids].filter(id => {
            const offsets = offsetMap.get(id) ?? [];
            const position = this.positions.get(id);
            for(let offset of offsets) {
                if (position?.has(offset + index)) {
                    return true;
                }
            }
            return false;
        }));
    }

    public removeRecursively(id: number): void {
        this.ids.delete(id);
        this.positions.delete(id);
        this.children
            .filter(node => node)
            .forEach(node => node.removeRecursively(id));
    }

    public toJson(): object {
        const json = {} as any;
        json['___ids___'] = Array.from(this.ids);
        for(let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            if (!child) {
                continue;
            }
            json[i] = child.toJson();
        }
        return json;
    }
}

export class PartialMatchIndex {
    private monogramRoot = new TrieNode();
    private bigramRoot = new TrieNode();
    private trigramRoot = new TrieNode();

    public add(id: number, values: string[]): void {
        values.forEach(value => this.addSingle(id, value));
    }

    private addSingle(id: number, value: string): void {
        const bytes = toByteArray(value);
        for(let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            this.monogramRoot.getOrNewChild(byte).add(id);
            if (i < bytes.length - 1) {
                const nextByte = bytes[i + 1];
                this.bigramRoot
                    .getOrNewChild(byte)
                    .getOrNewChild(nextByte)
                    .add(id);
                if (i < bytes.length - 2) {
                    const nextnextByte = bytes[i + 2];
                    this.trigramRoot
                        .getOrNewChild(byte)
                        .getOrNewChild(nextByte)
                        .getOrNewChild(nextnextByte)
                        .addWithPos(id, i);
                }
            }
        }
    }

    public find(query: string): Set<number> {
        const bytes = toByteArray(query);
        if (bytes.length === 1) {
            return this.monogramRoot.getOrNewChild(bytes[0]).get();
        }
        if (bytes.length === 2) {
            return this.bigramRoot
                .getOrNewChild(bytes[0])
                .getOrNewChild(bytes[1]).get();
        }
        const initialNode = this.trigramRoot
            .getOrNewChild(bytes[0])
            .getOrNewChild(bytes[1])
            .getOrNewChild(bytes[2]);
        let current = initialNode.get();
        if (bytes.length === 3) {
            return current;
        }
        const offsetMap = initialNode.getPositions();
        for(let i = 1; i < bytes.length - 2; i++) {
            const next = this.trigramRoot
                .getOrNewChild(bytes[i])
                .getOrNewChild(bytes[i+1])
                .getOrNewChild(bytes[i+2]).getWithPos(offsetMap, i);
            // intersection
            current = new Set([...current].filter(id => next.has(id)));
            if (current.size === 0) {
                return current;
            }
        }
        return current;
    }

    public remove(id: number): void {
        this.monogramRoot.removeRecursively(id);
        this.bigramRoot.removeRecursively(id);
        this.trigramRoot.removeRecursively(id);
    }

    public toJsonString(): string {
        return JSON.stringify({
            monogram: this.monogramRoot.toJson(),
            bigram: this.bigramRoot.toJson()
        });
    }
}