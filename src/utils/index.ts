import * as fs from 'fs';
import { dirname, join, parse, posix, resolve } from 'path';

export function pathUnixJoin(...paths: string[]): string {
  return posix.join(...paths);
}

export function deleteDirectoryRecursively(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file: string) => {
      const curPath = `${dirPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDirectoryRecursively(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

export function findDirectorySync(dirName: string): string {
  let dir = resolve();
  const root = parse(dir).root;
  let loop = true;
  while (loop) {
    let lookUpDir: string;
    try {
      fs.accessSync(resolve(dir, dirName));
      lookUpDir = dirName;
    } catch (err) {
      lookUpDir = undefined;
    }
    if (lookUpDir) {
      loop = false;
      return join(dir, lookUpDir);
    } else if (dir === root) {
      loop = false;
      return null;
    }
    dir = dirname(dir);
  }
}

export function findFileSync(
  filePath: string | RegExp,
  rootPath?: string,
  results?: string[],
): string[] {
  if (!rootPath) {
    rootPath = resolve();
  }
  if (!results) {
    results = [];
  }
  const files = fs.readdirSync(rootPath);
  for (const file of files) {
    const filename = join(rootPath, file);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      findFileSync(filePath, filename, results);
    }
    if (filePath instanceof RegExp) {
      if (filePath.test(filename)) {
        results.push(filename);
      }
      continue;
    }
    if (filename.includes(filePath)) {
      results.push(filename);
    }
  }
  return results;
}
