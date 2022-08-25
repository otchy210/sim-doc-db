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

### Multi-layerd data

As this document describes earlier, this library doesn't handle multi-layered data structure by design. But if you really need such kind of data structure, you can emulate it as follows.

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field } from '@otchy/sim-doc-db/dist/types';

const SCHEMA: Field[] = [
    {
        name: 'groupId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
    {
        name: 'members',
        type: 'string[]',
        indexed: false,
    },
];

type Member = {
    memberId: number;
    name: string;
};

type Group = {
    groupId: number;
    name: string;
    members: Member[];
};

const collection = new Collection(SCHEMA);

const addGroup = ({ groupId, name, members }: Group) => {
    collection.add({
        values: {
            groupId,
            name,
            members: members.map((member: Member) => JSON.stringify(member)),
        },
    });
};

const getGroup = (groupId: number): Group => {
    const doc = Array.from(collection.find({ groupId }))[0];
    return {
        groupId: doc.values.groupId,
        name: doc.values.name,
        members: doc.values.members.map((member) => JSON.parse(member) as Member),
    };
};
```

The downside of this pattern is that you can't query it by the member's name. It is possible to do `` collection.find({ members: `"name":"${name}"` }) `` to search JSON string. But that is pretty hacky and is not recommended.

Alternatively, you can do the following as well.

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field } from '@otchy/sim-doc-db/dist/types';

const GROUP_SCHEMA: Field[] = [
    {
        name: 'groupId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
    {
        name: 'memberIds',
        type: 'number[]',
        indexed: true,
    },
];

const MEMBER_SCHEMA: Field[] = [
    {
        name: 'memberId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'groupId',
        type: 'number',
        indexed: false,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
];

type Member = {
    memberId: number;
    groupId: number;
    name: string;
};

type Group = {
    groupId: number;
    members: Member[];
};

const groupCollection = new Collection(GROUP_SCHEMA);
const memberCollection = new Collection(MEMBER_SCHEMA);

const addGroup = ({ groupId, name, members }: Group) => {
    groupCollection.add({
        values: {
            groupId,
            name,
            memberIds: members.map((member) => member.memberId),
        },
    });
    members.forEach(({ memberId, name }) => {
        memberCollection.add({
            values: {
                memberId,
                groupId,
                name,
            },
        });
    });
};

const getGroup = (groupId: number): Group => {
    const groupDoc = Array.from(groupCollection.find({ groupId }))[0];
    const members = groupDoc.values.memberIds.map((memberId) => {
        return Array.from(memberCollection.find({ memberId }))[0].values as Member;
    });
    return {
        groupId: groupDoc.values.groupId,
        name: groupDoc.values.name,
        members,
    };
};

const findByMemberName = (name: string): Group => {
    const memberDoc = Array.from(memberCollection.find({ name }))[0];
    const groupId = memberDoc.values.groupId;
    return getGroup(groupId);
};
```

This pattern is similar to how RDB handles multi-layered data. But you need to "JOIN" it by yourself since SimDoc DB doesn't support SQL.

### Range search

As this document describes earlier, this library doesn't support range search such as "less-than" or "greater-than" by design. You can't emulate it perfectly, but you can do similar search if you really need it.

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field, Query } from '@otchy/sim-doc-db/dist/types';

const SCHEMA: Field[] = [
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
    {
        name: 'age',
        type: 'number',
        indexed: false,
    },
    {
        name: 'ageCategory',
        type: 'tags',
        indexed: true,
    },
    {
        name: 'isAdult',
        type: 'boolean',
        indexed: true,
    },
];

type Person = {
    name: string;
    age: number;
};

type AgeCategory = '<20' | '20-39' | '40-59' | '>=60';

const getAgeCategory = (age: number): AgeCategory => {
    if (age < 20) {
        return '<20';
    } else if (age < 40) {
        return '20-39';
    } else if (age < 60) {
        return '40-59';
    } else {
        return '>=60';
    }
};

const getIsAdult = (age: number): boolean => {
    return age >= 18;
};

const collection = new Collection(SCHEMA);

const addPerson = ({ name, age }: Person) => {
    const ageCategory = getAgeCategory(age);
    const isAdult = getIsAdult(age);
    collection.add({
        values: {
            name,
            age,
            ageCategory,
            isAdult,
        },
    });
};

const getPeople = (query: Query): Person[] => {
    return Array.from(collection.find(query)).map((doc) => {
        const { name, age } = doc.values;
        return { name, age } as Person;
    });
};

const getPeopleInAgeCategory = (ageCategory: AgeCategory): Person[] => {
    return getPeople({ ageCategory });
};
const getAdultPeople = () => {
    return getPeople({ isAdult: true });
};
```

This is not perfect solution, but can cover a lot of real use cases.

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

### 多階層のデータ構造

最初に述べたように、このライブラリは多階層のデータ構造を扱うことは出来ません。ですがどうしてもそういったデータ構造が必要な場合、以下の方法でエミュレートすることが出来ます。

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field } from '@otchy/sim-doc-db/dist/types';

const SCHEMA: Field[] = [
    {
        name: 'groupId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
    {
        name: 'members',
        type: 'string[]',
        indexed: false,
    },
];

type Member = {
    memberId: number;
    name: string;
};

type Group = {
    groupId: number;
    name: string;
    members: Member[];
};

const collection = new Collection(SCHEMA);

const addGroup = ({ groupId, name, members }: Group) => {
    collection.add({
        values: {
            groupId,
            name,
            members: members.map((member: Member) => JSON.stringify(member)),
        },
    });
};

const getGroup = (groupId: number): Group => {
    const doc = Array.from(collection.find({ groupId }))[0];
    return {
        groupId: doc.values.groupId,
        name: doc.values.name,
        members: doc.values.members.map((member) => JSON.parse(member) as Member),
    };
};
```

このパターンの欠点は、Member の name で検索することが出来ない点です。`` collection.find({ members: `"name":"${name}"` }) `` のように JSON 文字列を検索することは可能ですが、かなりのハックですしお勧め出来ません。

別の案として、下記のような方法もあります。

```ts
import { Collection } from '@otchy/sim-doc-db';
import { Field } from '@otchy/sim-doc-db/dist/types';

const GROUP_SCHEMA: Field[] = [
    {
        name: 'groupId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
    {
        name: 'memberIds',
        type: 'number[]',
        indexed: true,
    },
];

const MEMBER_SCHEMA: Field[] = [
    {
        name: 'memberId',
        type: 'number',
        indexed: true,
    },
    {
        name: 'groupId',
        type: 'number',
        indexed: false,
    },
    {
        name: 'name',
        type: 'string',
        indexed: true,
    },
];

type Member = {
    memberId: number;
    groupId: number;
    name: string;
};

type Group = {
    groupId: number;
    members: Member[];
};

const groupCollection = new Collection(GROUP_SCHEMA);
const memberCollection = new Collection(MEMBER_SCHEMA);

const addGroup = ({ groupId, name, members }: Group) => {
    groupCollection.add({
        values: {
            groupId,
            name,
            memberIds: members.map((member) => member.memberId),
        },
    });
    members.forEach(({ memberId, name }) => {
        memberCollection.add({
            values: {
                memberId,
                groupId,
                name,
            },
        });
    });
};

const getGroup = (groupId: number): Group => {
    const groupDoc = Array.from(groupCollection.find({ groupId }))[0];
    const members = groupDoc.values.memberIds.map((memberId) => {
        return Array.from(memberCollection.find({ memberId }))[0].values as Member;
    });
    return {
        groupId: groupDoc.values.groupId,
        name: groupDoc.values.name,
        members,
    };
};

const findByMemberName = (name: string): Group => {
    const memberDoc = Array.from(memberCollection.find({ name }))[0];
    const groupId = memberDoc.values.groupId;
    return getGroup(groupId);
};
```

このパターンは RDB で多階層のデータ構造を扱う方法と似ています。ただ、SimDoc DB が SQL をサポートするわけでは無いので、"JOIN" 相当のデータ操作を自分で実装する必要があります。

## Development

### Initial setup

```
$ git config --local core.hooksPath .githooks
```
