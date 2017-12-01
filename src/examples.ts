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
  const filesPath = findFileSync(new RegExp('src/.*/supportedExtensions.js', 'g'), rootDir)[0];
  const foldersPath = findFileSync(new RegExp('src/.*/supportedFolders.js', 'g'), rootDir)[0];
  const files = require(filesPath).extensions;
  const folders = require(foldersPath).extensions;

  new ExamplesGenerator(pargs, files, folders, logger).generate();
}
