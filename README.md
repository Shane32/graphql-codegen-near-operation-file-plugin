# @shane32/graphql-codegen-near-operation-file-plugin

A plugin for [GraphQL Code Generator](https://www.graphql-code-generator.com/) that exports GraphQL documents from a generated file adjacent to where they were defined.

## Installation

```bash
npm install @shane32/graphql-codegen-near-operation-file-plugin
```

## Purpose

This plugin helps manage GraphQL operations in a more organized way by:
1. Creating `.g.ts` files adjacent to your GraphQL operation files
2. Exporting the generated document constants from these files
3. Maintaining proper relative imports from the main generated file

This approach keeps your GraphQL operations close to where they are used, making your codebase more maintainable and easier to navigate.

## Usage

Update your `codegen.ts` configuration file to include this plugin in your client preset:

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: ['@shane32/graphql-codegen-near-operation-file-plugin'],
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
};

export default config;
```

### Example

Given the following structure:

```
src/
  components/
    UserProfile.tsx  // Contains a GraphQL query
  gql/
    graphql.ts      // Main generated file
```

If `UserProfile.tsx` contains:

```typescript
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`;
```

The plugin will generate:

```
src/
  components/
    UserProfile.tsx
    UserProfile.g.ts  // Generated file with exports
  gql/
    graphql.ts
```

Where `UserProfile.g.ts` contains:

```typescript
export { GetUserDocument } from "../gql/graphql";
```

## License

MIT
