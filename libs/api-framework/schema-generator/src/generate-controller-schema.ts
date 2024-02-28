import { readCachedProjectGraph } from '@nx/devkit';
import * as fs from 'fs';
import * as path from 'path';
import * as TJS from 'typescript-json-schema';
import { promisify } from 'util';
import { measureExecutionTime, printExecutionTimes } from './profiler';

// async fs utils
const fsUtils = {
  exists: promisify(fs.exists),
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  readdir: promisify(fs.readdir),
  stat: promisify(fs.stat),
};

const CONTROLLER_SUFFIXES = ['.controller.ts', 'Controller.ts'];

const DEBUG = false;

/**
 * Find absolute paths of all files
 * ending with "Controller.ts"
 */
async function findAllControllers(rootPath: string) {
  const controllers: string[] = [];

  const directoryContent = await fsUtils.readdir(rootPath);

  for (const entry of directoryContent) {
    const entryPath = path.join(rootPath, entry);

    const isDirectory = (await fsUtils.stat(entryPath)).isDirectory();

    if (isDirectory) {
      controllers.push(...(await findAllControllers(entryPath)));
    } else {
      const isController = CONTROLLER_SUFFIXES.some((suffix) => entry.endsWith(suffix));

      if (isController) {
        controllers.push(entryPath);
      }
    }
  }

  return controllers;
}

type GenerateControllerSchemaParams = {
  controllerPath: string;
  tsFilePath: string;
};

export async function generateControllerSchema({
  controllerPath,
  tsFilePath,
}: GenerateControllerSchemaParams) {
  const suffixToReplace =
    CONTROLLER_SUFFIXES.find((suffix) => controllerPath.endsWith(suffix)) ?? '';
  const fileNameWithoutExtension = path.basename(controllerPath, suffixToReplace);

  const controllerName = fileNameWithoutExtension.replace(suffixToReplace, '');

  const getSchemaFilePath = (schemaSuffix: string) =>
    path.join(
      path.dirname(controllerPath),
      `${fileNameWithoutExtension}.${schemaSuffix}.schema.json`
    );

  type PossibleType = {
    typeName: string;
    schemaSuffix: string;
    error?: unknown;
  };

  const possibleTypes: PossibleType[] = [
    {
      typeName: `${controllerName}QueryParameters`,
      schemaSuffix: 'request',
    },
    {
      typeName: `${controllerName}Body`,
      schemaSuffix: 'request',
    },
    // {
    //   typeName: `${controllerName}Response`,
    //   schemaSuffix: 'response',
    // },
  ];

  const allSchemaFiles = Array.from(
    new Set(possibleTypes.map(({ schemaSuffix }) => getSchemaFilePath(schemaSuffix)))
  );

  for (const schemaFilePath of allSchemaFiles) {
    if (!(await fsUtils.exists(schemaFilePath))) {
      await measureExecutionTime(fsUtils.writeFile, schemaFilePath, '{}');
    }
  }

  const program = measureExecutionTime(TJS.programFromConfig, tsFilePath, [controllerPath]);

  for (const typeToGenerate of possibleTypes) {
    const { typeName, schemaSuffix } = typeToGenerate;
    const schemaFilePath = getSchemaFilePath(schemaSuffix);
    try {
      const settings: TJS.PartialArgs = {
        required: true,
        strictNullChecks: false,
        noExtraProps: true,
      };

      const schema = measureExecutionTime(TJS.generateSchema, program, typeName, settings);
      if (schema !== null) {
        await fsUtils.writeFile(schemaFilePath, JSON.stringify(schema, null, 2));
      }
    } catch (e) {
      typeToGenerate.error = e;
    }
  }

  // If all types with a given suffix failed to generate a schema, log an error
  const possibleTypeSuffixes = Array.from(
    new Set(possibleTypes.map(({ schemaSuffix }) => schemaSuffix))
  );

  const errors = possibleTypeSuffixes
    .map((suffix) => {
      const typesWithSuffix = possibleTypes.filter(({ schemaSuffix }) => schemaSuffix === suffix);
      const typesWithSuffixCount = typesWithSuffix.length;
      const typesWithSuffixErrorsCount = typesWithSuffix.filter(({ error }) => error).length;

      if (typesWithSuffixErrorsCount === typesWithSuffixCount) {
        return suffix;
      }

      return undefined;
    })
    .filter(Boolean);

  if (errors.length > 0) {
    console.error(
      `❌ Failed to generate schema for ${controllerName}. No types for generating the ${errors.join(
        ', '
      )} schema were found.`
    );
  }
}

const firstArg = process.argv[2] as string | undefined;
const defaultProjectName = firstArg || (process.env.NX_TASK_TARGET_PROJECT as string);

export default async function main(
  projectName = defaultProjectName,
  repoRoot = process.env.NX_WORKSPACE_ROOT as string | undefined
) {
  if (!repoRoot) {
    throw new Error('Root directory must be provided');
  }

  const graph = readCachedProjectGraph();
  const project = graph.nodes[projectName];

  if (!project.data.sourceRoot) {
    throw new Error(`Project ${projectName} does not have a sourceRoot`);
  }

  const projectRootPath = path.join(repoRoot, project.data.sourceRoot);

  const POSSIBLE_TS_CONFIG_FILE_NAMES = ['tsconfig.lib.json', 'tsconfig.app.json', 'tsconfig.json'];

  const allAbsoluteTsConfigPaths = POSSIBLE_TS_CONFIG_FILE_NAMES.map((fileName) =>
    path.join(projectRootPath, '..', fileName)
  );
  const tsFilePath = allAbsoluteTsConfigPaths.find((tsConfigPath) => fs.existsSync(tsConfigPath));

  // const tsFilePath = path.join(projectRootPath, '..', 'tsconfig.lib.json');

  const controllers = await measureExecutionTime(findAllControllers, projectRootPath);

  console.log(`🔄 [${projectName}] Generating schemas for ${controllers.length} controllers...`);
  const allPromises = controllers.map((controllerTsPath) =>
    measureExecutionTime(generateControllerSchema, {
      controllerPath: controllerTsPath,
      tsFilePath,
    })
  );

  async function execute() {
    await Promise.all(allPromises);
  }

  await measureExecutionTime(execute);

  console.log(`✅ Done`);

  if (DEBUG) {
    printExecutionTimes();
  }
}
