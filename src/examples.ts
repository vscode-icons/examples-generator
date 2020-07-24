import { ExamplesGenerator } from './examplesGenerator';
import { Logger } from './logger';
import { IFileCollection, IFolderCollection } from './models/extensions';
import { findDirectorySync, findFileSync } from './utils';
import { YargsParser } from './yargsparser';

export async function main(): Promise<void> {
  try {
    const logger = new Logger();
    const pargs = new YargsParser(logger).parse();

    // Locate 'vscode-icons' root directory
    const rootDir = findDirectorySync('vscode-icons');

    if (!rootDir) {
      throw Error(
        `Directory 'vscode-icons' could not be found, ` +
          `try cloning the repository first, in the parent directory.`,
      );
    }

    // Find files and folders path
    const baseRegex =
      'src(?:(?:\\/|\\\\)[a-zA-Z0-9\\s_@-^!#$%&+={}\\[\\]]+)*(?:\\/|\\\\)';
    const filesPath = findFileSync(
      new RegExp(`${baseRegex}supportedExtensions\\.js`),
      rootDir,
    )[0];
    const foldersPath = findFileSync(
      new RegExp(`${baseRegex}supportedFolders\\.js`),
      rootDir,
    )[0];

    if (!filesPath || !foldersPath) {
      throw Error(
        `Looks like 'vscode-icons' has not been build yet, ` +
          `try performing a build first.`,
      );
    }

    const files: IFileCollection = ((await import(filesPath)) as Record<
      string,
      IFileCollection
    >).extensions;
    const folders: IFolderCollection = ((await import(foldersPath)) as Record<
      string,
      IFolderCollection
    >).extensions;

    const generator = new ExamplesGenerator(pargs, files, folders, logger);
    generator.generate();
  } catch (error) {
    const err = error as Error;
    console.error(err?.message || err?.stack);
    process.exit(1);
  }
}
