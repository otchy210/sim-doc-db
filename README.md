# SimDoc DB

[日本語](#日本語)

SimDoc DB is a simple in-memory document database (NoSQL) written in TypeScript. Do you think it is reinventing the wheel? Yes, it is, to some extent. But great advantages of what this library has are:

-   It supports full text search for any multibyte characters by default.
    -   Including Japanese (日本語) and emoji (😄).
-   It doesn't have any dependencies of other libraries at all.
-   It works on both Node.js as well as web browsers.
-   It is super lightweight thus super quick.
    -   19KB JS files in total (as of version 0.12.0)

So if you're looking for a simple in-memory DB solution for SPA running on web browsers, it can be a perfect solution.

On the other hand, it doesn't support storing and indexing JSON directly. Meaning, it can't handle multi-layered data structure. Also it doesn't support range search such as "less-than" or "greater-than". This is a tradeoff of keeping this library super lightweight and quick.

## How to use

### Install the library

You can add this library to your TypeScript / JavaScript project by following command.

```
$ npm install --save-dev @otchy/sim-doc-db
```

### Create collection

Once you have the dependency, you can start writing code. What you need to do first is to create a `Collection`.

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field } from '@otchy/sim-doc-db/dist/types';

const SCHEMA: Field[] = [
    {
        name: 'key',
        type: 'tag',
        indexed: true,
    },
    {
        name: 'content',
        type: 'string',
        indexed: true,
    },
    {
        name: 'updatedAt',
        type: 'number',
        indexed: false,
    },
];

const collection = new Collection(SCHEMA);
```

As you can see above, you need to define the schema when you instantiate the `Collection` which is an array of `Field` objects. This schema represents the fields of each document stored in this collection.

Each field has its `type` which is defined as follows.

```ts
export type FieldType = 'string' | 'number' | 'boolean' | 'tag' | 'string[]' | 'number[]' | 'tags';
```

| type     | note                                      |
| -------- | ----------------------------------------- |
| string   | text field supporting full text search    |
| number   | number field supporting only exact match  |
| boolean  | boolean field supporting only exact match |
| tag      | text field supporting only exact match    |
| string[] | array of string type                      |
| number[] | array of number type                      |
| tags     | array of tag type                         |

Each field will be query-able when you set the `indexed` field as `true`. So with this example `SCHEMA`, you can query "key" field by exact match and "content" field by full text search, but you can't query "updatedAt" field.

### Add document

Now that you can start adding your documents to the `collection`. The document you add should follow the schema. But note that the data you want to store has to be defined as "values".

```ts
const doc1 = collection.add({
    values: {
        key: 'doc_key_1',
        content: 'Any text 💯❗️',
        updatedAt: Date.now(),
    },
});
const doc2 = collection.add({
    values: {
        key: 'doc_key_2',
        content: 'Text content 💯❗️',
        updatedAt: Date.now(),
    },
});
/*
doc1 = {
    id: 1,
    values: ...,
};
doc2 = {
    id: 2,
    values: ...,
};
*/
```

You may notice that each document has an `id` field issued by the library automatically. This `id` is the identifier of each document. So you can `get` the document or `remove` the document with this `id`.

```ts
const doc1 = collection.get(1);
const removedDoc1 = collection.remove(1);
```

### Query documents

Okay, finally you can query the documents as follows!

```ts
const result1 = collection.find({ key: 'doc_key_1' });
const result2 = collection.find({ content: '💯' });
```

The Set object `result1` has a document where its key exactly matches with "doc_key_1". The set object `result2` has 2 documents where those contents partially match with "💯".

If you want to sort the result, of course you can do it.

```ts
const sortedResult = Array.from(collection.find({ content: '💯' })).sort((left, right) => left.updatedAt - right.updatedAt);
```

Note that the type of query result is `Set`, so you need to convert it to `Array` if you need to sort it.

### Update docment

When you want to update a document stored in the collection, you first need to know its `id`. Then you can call the `update` method to do so.

```ts
const current = Array.from(collection.find({ key: 'doc_key_1' }))[0];
const updated = {
    id: current.id,
    values: {
        ...current.values,
        content: 'Updated!',
        updatedAt: Date.now(),
    },
};
collection.update(updated);
```

<!--
### Export and import

### Multi-layerd data

### Emulatin range search
-->

# 日本語

SimDoc DB は TypeScript で書かれたシンプルなインメモリドキュメントデータベース (NoSQL) です。ぶっちゃけ車輪の再発明ではありますが、このライブラリには他ではあまり見ない以下のような利点があります。

-   デフォルトであらゆる多バイト文字の全文検索をサポートしています。
    -   日本語や絵文字 (😄) も問題なし。
-   外部ライブラリに一切依存せず単体で動作します。
-   Node.js 上、ウェブブラウザ上のいずれでも動作します。
-   超軽量で超高速。
    -   JS ファイルの合計で 19KB です。(バージョン 0.12.0 現在)

なので、もしウェブブラウザ上で動作する SPA で使うシンプルなインメモリ DB を探しているのなら、このライブラリが完璧にマッチするかもしれません。

一方で、JSON を直接保存したり検索対象にしたりといったことはサポートしていません。つまり、多階層のデータ構造をそのまま扱うことは出来ないという事です。また、「より小さい」「より大きい」のような範囲検索もサポートしていません。これは、このライブラリを超軽量・超高速に保つためのトレードオフです。

## Development

### Initial setup

```
$ git config --local core.hooksPath .githooks
```
