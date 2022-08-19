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
