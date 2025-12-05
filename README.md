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

## Configuration

The plugin supports the following configuration options:

### `includeFileExtension`

**Type:** `boolean`
**Default:** `false`

When set to `true`, the generated import statements will include the file extension (e.g., `"../gql/graphql.ts"` instead of `"../gql/graphql"`).

### `fileHeader`

**Type:** `string`
**Default:** `"This file was automatically generated based on {filename}"`

Specifies a custom header comment to be added at the top of each generated file. The placeholder `{filename}` will be replaced with the name of the source file.

**Example:**

```typescript
const config: CodegenConfig = {
  schema: 'schema.graphql',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: ['@shane32/graphql-codegen-near-operation-file-plugin'],
      config: {
        fileHeader: 'Auto-generated from {filename} - DO NOT EDIT'
      },
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
};
```

To disable the file header, set it to an empty string:

```typescript
config: {
  fileHeader: ''
}
```

## Example

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
// This file was automatically generated based on UserProfile.tsx
export { GetUserDocument } from "../gql/graphql";
```

## License

MIT
