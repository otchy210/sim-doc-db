# SimDoc DB

SimDoc DB is a simple in-memory document database (NoSQL) written in TypeScript. Do you think it is reinventing the wheel? Yes, it is, to some extent. But great advantages of what this library has are:

-   It supports full text search for any multibyte characters by default.
    -   Including Japanese (日本語) and emoji (😄).
-   It doesn't have any dependencies of other libraries at all.
-   It works on both Node.js as well as web browsers.
-   It is super lightweight thus super quick.
    -   19KB JS files in total (as of version 0.12.0)

So if you're looking for a simple in-memory DB solution for SPA running on web browsers, it can be a perfect solution.

On the other hand, it doesn't support storing and indexing JSON directly. Meaning, it can't handle multi-layered data structure. This is a tradeoff of keeping this library super lightweight and quick.

## Development

### Initial setup

```
$ git config --local core.hooksPath .githooks
```
