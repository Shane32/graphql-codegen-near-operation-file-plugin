import { Kind, OperationTypeNode } from "graphql";
import type { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import * as path from "path";
import * as fs from "fs";

// This interface represents the configuration of the plugin
// from the codegen.ts file
interface IPluginConfig {
  includeFileExtension?: boolean;
}

interface IInfo {
  [key: string]: any;
  outputFile?: string;
  allPlugins?: Types.ConfiguredPlugin[];
  pluginContext?: {
    [key: string]: any;
  };
}

const plugin: PluginFunction<IPluginConfig> = (schema, documents, config, info: IInfo | undefined) => {
  void schema;
  void config;

  // Config options
  const includeFileExtension = config.includeFileExtension ?? false;

  // Step 1: Extract data
  const input = extractData(documents, info);

  if (!input.outputFile) {
    throw new Error("Missing outputFile in plugin configuration");
  }

  // Step 2: Determine absolute path to outputFile
  const outputFilePath = determineAbsolutePath(input.outputFile);

  // Step 3: Group documents by location
  const documentsByLocation = groupDocumentsByLocation(input.documents);

  // Step 4: Find OperationDefinitions by location
  const operationDefinitionsByLocation = findOperationDefinitionsByLocation(documentsByLocation);

  // Step 5: Prepare files to write
  const filesToWrite = prepareFilesToWrite(operationDefinitionsByLocation, outputFilePath, includeFileExtension);

  // Step 6: Write files
  writeFiles(filesToWrite);

  return "";
};

interface IDocument {
  definitions: {
    kind: Kind.OPERATION_DEFINITION;
    operation: OperationTypeNode;
    name: string | undefined;
  }[];
  location: string | undefined;
}

interface IDocumentOutput {
  documents: IDocument[];
  outputFile: string | undefined;
}

// 1. Extract data from documents and info
function extractData(documents: Types.DocumentFile[], info: IInfo | undefined) {
  const input = { documents, info };

  const result: IDocumentOutput = {
    documents: input.documents.map((doc) => ({
      definitions: (doc.document?.definitions ?? [])
        .filter((def) => def.kind === Kind.OPERATION_DEFINITION)
        .map((def) => ({
          kind: def.kind,
          operation: def.operation,
          name: def.name?.value,
        })),
      location: doc.location,
    })),
    outputFile: input.info?.outputFile,
  };

  return result;
}

// 2. Determine absolute path to outputFile
function determineAbsolutePath(outputFile: string) {
  return path.resolve(outputFile);
}

interface IOperationDefinitionInfo {
  kind: Kind.OPERATION_DEFINITION;
  operation: OperationTypeNode;
  name?: string;
}

// 3. Group documents by their location
function groupDocumentsByLocation(documents: IDocument[]) {
  const documentsByLocation: Record<string, IOperationDefinitionInfo[]> = {};
  documents.forEach((doc) => {
    const location = doc.location;
    if (!location) {
      return;
    }
    if (!documentsByLocation[location]) {
      documentsByLocation[location] = [];
    }
    documentsByLocation[location] = documentsByLocation[location].concat(doc.definitions);
  });
  return documentsByLocation;
}

// 4. Find all definitions where kind is OperationDefinition
function findOperationDefinitionsByLocation(documentsByLocation: Record<string, IOperationDefinitionInfo[]>) {
  const operationDefinitionsByLocation: Record<string, IOperationDefinitionInfo[]> = {};
  for (const location in documentsByLocation) {
    const definitions = documentsByLocation[location];
    const operationDefinitions = definitions.filter((def) => def.kind === Kind.OPERATION_DEFINITION);
    if (operationDefinitions.length > 0) {
      operationDefinitionsByLocation[location] = operationDefinitions;
    }
  }
  return operationDefinitionsByLocation;
}

interface IFilenameContents {
  filename: string;
  contents: string;
}

// 5. Create array with properties filename and contents for files
function prepareFilesToWrite(
  operationDefinitionsByLocation: Record<string, IOperationDefinitionInfo[]>,
  outputFilePath: string,
  includeFileExtension: boolean
) {
  const filesToWrite: IFilenameContents[] = [];
  for (const location in operationDefinitionsByLocation) {
    const operationDefinitions = operationDefinitionsByLocation[location];
    const newFilePath = createFilenameWithNewExtension(location, ".g.ts");
    const relativeOutputFile = determineRelativePath(newFilePath, outputFilePath);
    const contents = createExportDefinitions(operationDefinitions, relativeOutputFile, includeFileExtension);
    filesToWrite.push({
      filename: newFilePath,
      contents: contents,
    });
  }
  return filesToWrite;
}

// 5a. Create filename based on location, changing file extension to ".g.ts"
function createFilenameWithNewExtension(location: string, newExtension: string) {
  const parsedPath = path.parse(location);
  const newFilename = parsedPath.name + newExtension;
  const newFilePath = path.join(parsedPath.dir, newFilename);
  return newFilePath;
}

// 5b. Determine relative path to outputFile
function determineRelativePath(fromPath: string, toPath: string) {
  const relativePath = path.relative(path.dirname(fromPath), toPath);
  // Convert to POSIX-style path for consistency in import statements
  const relativePathPosix = relativePath.split(path.sep).join(path.posix.sep);
  return relativePathPosix;
}

// Utility function to remove the file extension
function removeFileExtension(filePath: string) {
  return filePath.replace(/\.[^/.]+$/, ""); // Removes the last file extension
}

// 5c. Create export definition for each operation definition importing from relativeOutputFile
function createExportDefinitions(
  operationDefinitions: IOperationDefinitionInfo[],
  relativeOutputFile: string,
  includeFileExtension: boolean
) {
  const exportNames = operationDefinitions
    .map((def) => def.name)
    .filter(Boolean)
    .map((name) => name + "Document")
    .join(", ");

  const filePath = includeFileExtension ? relativeOutputFile : removeFileExtension(relativeOutputFile);
  const contents = `export { ${exportNames} } from "${filePath}";`;
  return contents;
}

// 6. Write the contents to the respective files
function writeFiles(filesToWrite: IFilenameContents[]) {
  filesToWrite.forEach((file) => {
    fs.writeFileSync(file.filename, file.contents, "utf8");
  });
}

export { plugin };
