import { Logger } from './logger';
import { YargsParser } from './yargsparser';
import { findDirectorySync, findFileSync } from './utils';
import { ExamplesGenerator } from './examplesGenerator';

export function main(): void {
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

    const files = require(filesPath).extensions;
    const folders = require(foldersPath).extensions;

    const generator = new ExamplesGenerator(pargs, files, folders, logger);
    generator.generate();
  } catch (error) {
    console.error(error.message || error);
    process.exit(1);
  }
}
