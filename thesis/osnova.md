# Osnova

1. Problém
   1. popis problemu
   2. reseni problemu
2. Výzkum a analýza
   1. REST
   2. GraphQL
   3. tRPC
   4. CRUD
   5. API
   6. Typescript
      1. typy (number, string, function, string literals, unions, merge, ...)
      2. type inference (infer)
      3. loops ([K in keyof T])
      4. conditions (extends)
      5. predefined types
      6. generics <K extends string>
      7. function overloading
      8. type-fest a dalsí TS type-only knihovny
      9. Simplify type - zmineni zajimaveho typu
   7. npm
      1. npm registry
      2. yarn
      3. pnpm
      4. bun
   8. komunikace
      1. XMLHttpRequest
      2. Fetch API
         1. promises
         2. ponyfill (nodejs polyfill)
      3. Axios
   9. Server frameworky
      1. node:http
      2. Express
      3. Fastify
      4. Koa
      5. Next.js
      6. Sveltekit
      7. Bun
   10. Klient frameworky
       1. vanillajs
       2. React
       3. Next.js
       4. Sveltekit
   11. whatwg standard
       1. o standardu
       2. Request a Response objekty
          1. Request vs IncommingMessage
          2. Response vs ServerResponse
       3. whatwg-node/server
   12. Monorepo
       1. struktura
       2. Turborepo
       3. NX
   13. Dokumentace
       1. Docusaurus
       2. Nextra
   14. IDE
       1. VS code
   15. Testování
       1. vitest
       2. jest
       3. unit testing
       4. coverage
3. Implementace (možná spíše Knihovna nebo Řešení, chci popisovat tu knihovnu, ne proces implementace knihovny)
   1. Struktura projektu
      1. Turborepo
      2. docs - nextra
      3. eslint
      4. prettier
      5. yarn
      6. vitest
   2. Server
      1. Resolver
         1. query
         2. mutation
         3. validace
            1. args
            2. output
            3. chaining
            4. transformace
            5. validační schémata
               1. Typebox
               2. staticka inferrence typů
               3. json schema
               4. kompilace
               5. Zod vs Typebox (vyhody, nevyhody, duvod nepouzity Zod)
         4. middleware
         5. descriptions
         6. mergovani resolveru (resolvery bez serveru, vyuziti v 3rd party knihovnach)
      2. Router
      3. Context
      4. HTTP errory
      5. CORS
   3. Klient
      1. JS Proxy
      2. TS-only typesafety (no runtime validations)
      3. axios (vyhody axiosu vs native DOM fetch)
      4. React client (+ popsat moznosti pridani dalsich klientu, napr sveltekit)
   4. Introspekce (popis + pouziti na klientovi)
      1. type-safe open API
      2. Codegen (popsat nutnost generovani kodu pri introspekci, mozna ne na dlouho <https://github.com/microsoft/TypeScript/issues/32063>)
      3. jake jsou vlastne vyhody pokud musim generovat kod pri introspekci vs GraphQL (mozna v sekci srovnani s GraphQL)
   5. Integrace do různých frameworků a prostředí - whatwg-node/server (jake problemy resi tato knihovna, express, next, sveltekit, bun, ...)
   6. pluginy (možná??...)
4. Srovnání
   1. REST
      1. rozdily ptsq vs REST
      2. vyhody, nevyhody ptsq vs REST (cache, metody, type-safety)
   2. GraphQL srovnání
      1. rozdily ptsq vs GraphQL
      2. vyhody, nevyhody ptsq vs GraphQL (cache, metody, type-safety)
   3. tRPC srovnání
      1. rozdily ptsq vs tRPC
      2. vyhody, nevyhody ptsq vs tRPC (cache, metody, type-safety)
5. Testování
   1. vitest
   2. coverage - v8 vs Istanbul
   3. testování modulů (unit testing)
6. Nasazení
   1. npm
   2. changeset
   3. vercel - docs
7. Zaver
   1. slepe ulicky
      1. Zod
      2. model bez introspekce (server, schema, klient)
         1. schema v TS
         2. sdileni schematu pres npm package
      3. transformery
         1. Bez schemat (bez Typeboxu), uvnitr resolveru
         2. popsat neidealnost tohoto zpusobu
         3. popsat zaroven ale neidealnost zpusobu s Typeboxem (dvojí validace klient + server a sdílení schématu)
      4. Integrace bez whatwg-node/server (vlastní adaptery)
      5. globalni transformatory - nemožnost pouzity globalnich transformatoru jako v tRPC (kvuli serializace a open API)
      6. standalone middleware
         1. nevyhody
         2. nevhodnost pouzity
         3. srovnat se standalone resolverem
      7. Typescript typy s defaultnimi hodnotami
         1. popsat nevyhody
         2. srovnat s pouzitin AnyObject (AnyQuery, AnyMutation, AnyRouter, ...)
      8. scalary
         1. nevhodnost
         2. popsat nevyhody s dvoji validaci
         3. popsat nevhodnost pouzity scalaru primo ve schematu
         4. srovnat s transformacemi
         5. srovnat se scalary v GraphQL
   2. Zaver prace
      1. co se povedlo
      2. ceho se praci dosahlo
      3. co prace predstavuje a jake hranice prekracuje (monorepo, tRPC, open API, introspekce)
