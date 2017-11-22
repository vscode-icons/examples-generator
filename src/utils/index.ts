import * as fs from 'fs';
import * as path from 'path';

export function pathUnixJoin(...paths: string[]): string {
  return path.posix.join(...paths);
}

export function deleteDirectoryRecursively(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(file => {
      const curPath = `${dirPath}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteDirectoryRecursively(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}
