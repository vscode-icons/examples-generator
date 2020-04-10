import { Logger } from './logger';
import { YargsParser } from './yargsparser';
import { findDirectorySync, findFileSync } from './utils';
import { ExamplesGenerator } from './examplesGenerator';

export function main(): void {
  const logger = new Logger();
  const pargs = new YargsParser(logger).parse();

  // Locate 'vscode-icons' root directory
  const rootDir = findDirectorySync('vscode-icons');

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
  const files = require(filesPath).extensions;
  const folders = require(foldersPath).extensions;

  new ExamplesGenerator(pargs, files, folders, logger).generate();
}
