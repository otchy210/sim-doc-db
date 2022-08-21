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
$ npm install @otchy/sim-doc-db
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
import { Document } from '@otchy/sim-doc-db/dist/types';

const doc1: Document = collection.add({
    values: {
        key: 'doc_key_1',
        content: 'Any text 💯❗️',
        updatedAt: Date.now(),
    },
});
const doc2: Document = collection.add({
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
import { Document } from '@otchy/sim-doc-db/dist/types';

const doc1: Document = collection.get(1);
const removedDoc1: Document = collection.remove(1);
```

### Query documents

Okay, finally you can query the documents as follows!

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const result1: Set<Document> = collection.find({ key: 'doc_key_1' });
const result2: Set<Document> = collection.find({ content: '💯' });
```

The Set object `result1` has a document where its key exactly matches with "doc_key_1". The set object `result2` has 2 documents where those contents partially match with "💯".

If you want to sort the result, of course you can do it.

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const result: Document[] = Array.from(collection.find({ content: '💯' }));
const sortedResult: Document[] = result.sort((left, right) => left.updatedAt - right.updatedAt);
```

Note that the type of query result is `Set`, so you need to convert it to `Array` if you need to sort it.

### Update document

When you want to update a document stored in the collection, you first need to know its `id`. Then you can call the `update` method to do so.

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const current: Document = Array.from(collection.find({ key: 'doc_key_1' }))[0];
const updated: Document = {
    id: current.id,
    values: {
        ...current.values,
        content: 'Updated!',
        updatedAt: Date.now(),
    },
};
collection.update(updated);
```

### Export and import

SimDoc DB itself doesn't have persistence because it is designed as a simple in-memory database. But it supports `export` and `import`, so you can use it if you want to save the database persistently.

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Json } from '@otchy/sim-doc-db/dist/types';

const jsonData: Json = collection.export();
const textData = Json.stringify(jsonData);
// save it somewhere

const copiedCollection = new Collection(SCHEMA);
copiedCollection.import(jsonData);
```

The format of the dumped data is `Json`. So you can `stringify` it to save the data on disk for example. You then of cource can `import` the data as needed.

<!--
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

## 使い方

### ライブラリのインストール

TypeScript あるいは JavaScript のプロジェクトに以下のコマンドでこのライブラリを追加することが出来ます。

```
$ npm install @otchy/sim-doc-db
```

### コレクションの作成

いったんこのライブラリを追加したらコードを書き始めることが出来ます。まず一番最初にしないといけないのは、`Collection` を作成することです。

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

上記を見ると分かるように、`Collection` インスタンスを作成する時は、`Field` オブジェクトの配列からなるスキーマを定義する必要があります。このスキーマは、このコレクションに保存されるドキュメントの各フィールドを表しています。

各フィールドは以下のように定義される `type` を持ちます。

```ts
export type FieldType = 'string' | 'number' | 'boolean' | 'tag' | 'string[]' | 'number[]' | 'tags';
```

| type     | note                                   |
| -------- | -------------------------------------- |
| string   | 全文検索をサポートするテキスト型       |
| number   | 完全一致検索のみサポートする数値型     |
| boolean  | 完全一致検索のみサポートする真偽値型   |
| tag      | 完全一致検索のみサポートするテキスト型 |
| string[] | string 型の配列                        |
| number[] | number 型の配列                        |
| tags     | tag 型の配列                           |

各フィールドは `indexed` を `true` にすると検索可能になります。従って、この例の`SCHEMA` では、"key" フィールドの完全一致検索および "content" フィールドの全文検索 (部分一致検索) を行う事が出来る一方、"updatedAt" フィールドで検索することは出来ません。

### ドキュメントの追加

この段階で `collection` にドキュメントを追加し始めることが出来ます。追加するドキュメントは定義済みのスキーマに沿っている必要があります。保存するデータは "values" プロパティとして定義して下さい。

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const doc1: Document = collection.add({
    values: {
        key: 'doc_key_1',
        content: 'Any text 💯❗️',
        updatedAt: Date.now(),
    },
});
const doc2: Document = collection.add({
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

ライブラリによって `id` フィールドが自動的に発行されていることに気付いたでしょうか。この `id` は各ドキュメントの識別子です。ですので、この `id` を使用してドキュメントを取得 (`get`) したり、削除 (`remove`) したりする事が出来ます。

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const doc1: Document = collection.get(1);
const removedDoc1: Document = collection.remove(1);
```

### ドキュメントの検索

さてついに、以下のようにドキュメントを検索することが出来るようになりました！

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const result1: Set<Document> = collection.find({ key: 'doc_key_1' });
const result2: Set<Document> = collection.find({ content: '💯' });
```

ここで、Set オブジェクトの `result1` は、key が "doc_key_1" に完全一致する 一つのドキュメントを持ちます。Set オブジェクトの `result2` は、content が "💯" に部分一致する二つのドキュメントを持ちます。

検索結果をソートしたい場合も、もちろん可能です。

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const result: Document[] = Array.from(collection.find({ content: '💯' }));
const sortedResult: Document[] = result.sort((left, right) => left.updatedAt - right.updatedAt);
```

検索結果が `Set` である事に留意して下さい。従って、ソートをする場合は `Array` に変換する必要があります。

### ドキュメントの更新

コレクションに保存したドキュメントを更新する場合、まずその `id` を取得する必要があります。その後に、`update` メソッドを呼び出してドキュメントの更新をします。

```ts
import { Document } from '@otchy/sim-doc-db/dist/types';

const current: Document = Array.from(collection.find({ key: 'doc_key_1' }))[0];
const updated: Document = {
    id: current.id,
    values: {
        ...current.values,
        content: 'Updated!',
        updatedAt: Date.now(),
    },
};
collection.update(updated);
```

### エクスポートとインポート

SimDoc DB 自身はシンプルなインメモリデータベースとしてデザインされているため永続性を持ちません。ですが、エクスポート (`export`) とインポート (`import`) をサポートしているため、データベースを永続的に保存することも出来ます。

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Json } from '@otchy/sim-doc-db/dist/types';

const jsonData: Json = collection.export();
const textData = Json.stringify(jsonData);
// これをどこかに保存する

const copiedCollection = new Collection(SCHEMA);
copiedCollection.import(jsonData);
```

ダンプされたデータのフォーマットは `Json` です。従って、文字列化 (`stringify`) した上で例えばディスク上に保存することが出来ます。そしてもちろんそのデータを必要に応じてインポート (`import`) できます。

## Development

### Initial setup

```
$ git config --local core.hooksPath .githooks
```
