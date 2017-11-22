import { Logger } from './logger';
import { Parser } from './parser';
import { pathUnixJoin } from './utils';
import { ExamplesGenerator } from './examplesGenerator';

function main(args: string[]): void {

  // This directory should point to the 'vscode-icons' root directory
  const dirname = './../../../../';
  const manifestFolder = 'out/src/icon-manifest/';
  const files = require(pathUnixJoin(dirname, manifestFolder, 'supportedExtensions'));
  const folders = require(pathUnixJoin(dirname, manifestFolder, 'supportedFolders'));
  const logger = new Logger();
  const pargs = Parser.parse(args, logger);

  new ExamplesGenerator(pargs, files, folders, logger).generate();
}

main(process.argv);
