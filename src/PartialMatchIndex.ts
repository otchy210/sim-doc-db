class TrieNode {
    public children = [...Array<TrieNode>(256)];
    public ids = new Set<number>();

    public getChild(byte: number): TrieNode {
        if (!this.children[byte]) {
            this.children[byte] = new TrieNode();
        }
        return this.children[byte];
    }

    public add(id: number): void {
        this.ids.add(id);
    }
}

const encoder = new TextEncoder();

export class PartialMatchIndex {
    private monogramRoot = new TrieNode();

    public add(id: number, values: string[]): void {
        values.forEach(value => this.addSingle(id, value));
    }

    private addSingle(id: number, value: string): void {
        encoder.encode(value).forEach(byte => {
            this.monogramRoot.getChild(byte).add(id);
        });
    }

    public find(query: string): Set<number> {
        const bytes = encoder.encode(query);
        if (bytes.length === 1) {
            return this.monogramRoot.getChild(bytes[0]).ids;
        }
        throw new Error('No multi-bytes support yet.');
    }

    public remove(id: number): void {
        this.monogramRoot.children
            .filter(node => node)
            .forEach(node => node.ids.delete(id));
    }
}