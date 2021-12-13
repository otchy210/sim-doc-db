import { toByteArray } from "./TextUtils";

class TrieNode {
    private children = [...Array<TrieNode>(256)];
    private ids = new Set<number>();

    public getOrNewChild(byte: number): TrieNode {
        if (!this.children[byte]) {
            this.children[byte] = new TrieNode();
        }
        return this.children[byte];
    }

    public add(id: number): void {
        this.ids.add(id);
    }

    public get(): Set<number> {
        return this.ids;
    }

    public removeRecursively(id: number): void {
        this.ids.delete(id);
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
        throw new Error('3 or more bytes are not supported yet.');
    }

    public remove(id: number): void {
        this.monogramRoot.removeRecursively(id);
        this.bigramRoot.removeRecursively(id);
    }

    public toJsonString(): string {
        return JSON.stringify({
            monogram: this.monogramRoot.toJson(),
            bigram: this.bigramRoot.toJson()
        });
    }
}