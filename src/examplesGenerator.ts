import * as fs from 'fs';
import { IParsedArgs } from './interfaces';
import { Logger } from './logger';
import {
  IFileCollection,
  IFileExtension,
  IFolderCollection,
  IFolderExtension,
} from './models/extensions';
import { deleteDirectoryRecursively } from './utils';

export class ExamplesGenerator {
  private fileNames: IFileExtension;
  private folderNames: IFolderExtension;
  private langIdIconsCount = 0;
  private unsupported: string[] = [];

  constructor(
    private pargs: IParsedArgs,
    private files: IFileCollection,
    private folders: IFolderCollection,
    private logger: Logger,
  ) {
    this.fileNames = this.getFilesCollection();
    this.folderNames = this.getFoldersCollection();
  }

  public generate(): void {
    const currentDir = process.cwd();
    this.createDirectory('examples');
    this.logger.log('');

    if (this.pargs.flag === 'files') {
      const icons = this.pargs.icons.length
        ? this.pargs.icons
        : Object.keys(this.fileNames);
      this.buildFiles(icons);
    }

    if (this.pargs.flag === 'folders') {
      const icons = this.pargs.icons.length
        ? this.pargs.icons
        : Object.keys(this.folderNames);
      this.buildFolders(icons);
    }

    if (this.pargs.flag === 'all') {
      this.buildFolders(Object.keys(this.folderNames));
      this.buildFiles(Object.keys(this.fileNames));
    }

    this.displayNoteFooter();

    process.chdir(currentDir);
  }

  private displayNoteFooter(): void {
    const supported = this.pargs.icons.filter(
      (icon: string) => !this.unsupported.includes(icon),
    );
    let isMany = !supported.length || supported.length > 1;
    let suffix = isMany ? 's' : '';
    const noun =
      this.pargs.flag !== 'all'
        ? this.pargs.flag.substring(0, this.pargs.flag.length - 1)
        : this.pargs.flag;
    let verb = isMany ? 'were' : 'was';
    const msg = this.pargs.icons.length
      ? `${supported.length ? `'${supported.join(`', '`)}'` : `zero`} ${noun}`
      : noun;
    this.logger.updateLog(
      `Example${suffix} of ${msg} icon${suffix} ${verb} successfully created!`,
    );
    if (this.unsupported.length) {
      isMany = !this.unsupported.length || this.unsupported.length > 1;
      suffix = isMany ? 's' : '';
      this.logger.error(
        `Unsupported icon${suffix}: '${this.unsupported.join(`', '`)}'`,
      );
    }
    if (this.langIdIconsCount > 0) {
      isMany = this.langIdIconsCount > 1;
      suffix = isMany ? 's' : '';
      verb = isMany ? 'are' : 'is';
      const langIdMsg = `
Note: Example${suffix} include${
        !isMany ? 's' : ''
      } file icon${suffix} that ${verb} supported via 'language id'.
  In order to display that icon${suffix}, you may have to add the following snippet in your settings:

  "vsicons.associations.files": [
    { "icon": "%ICON-NAME%", "extensions":["%FILE-EXTENSION%"], "format": "%ICON-FILE-FORMAT%" }
  ]

  replacing the placeholders accordingly. For more than one icon, add their respective entries in the array.`;
      this.logger.log(langIdMsg);
    }
  }

  private getFilesCollection(): IFileExtension {
    return this.files.supported
      .filter((file: IFileExtension) => !file.disabled)
      .reduce((init: IFileExtension, current: IFileExtension) => {
        const obj = init;
        const hasLangId =
          !current.filename && current.languages && current.languages.length;
        const extension = hasLangId
          ? current.languages[0].defaultExtension
          : current.extensions[0];

        if (!extension) {
          return obj;
        }

        obj[current.icon] = `${current.filename ? '' : 'file.'}${extension}`;

        return obj;
      }, {} as IFileExtension);
  }

  private getFoldersCollection(): IFolderExtension {
    return this.folders.supported
      .filter((folder: IFolderExtension) => !folder.disabled)
      .reduce((init: IFolderExtension, current: IFolderExtension) => {
        const obj = init;
        if (current.extensions.length) {
          obj[current.icon] = current.extensions[0];
        }
        return obj;
      }, {} as IFolderExtension);
  }

  private createDirectory(dirName: string): void {
    deleteDirectoryRecursively(dirName);
    fs.mkdirSync(dirName);
    process.chdir(dirName);
  }

  private buildFiles(icons: string[]): void {
    icons.forEach((icon: string) => {
      const filename = this.fileNames[icon] as string;

      if (!filename) {
        this.unsupported.push(icon);
        return;
      }

      const fileIcon = this.files.supported.find(
        (file: IFileExtension) => file.icon === icon,
      );
      if (fileIcon.languages && fileIcon.languages.length) {
        this.langIdIconsCount++;
      }

      try {
        fs.writeFileSync(filename, null);
        this.logger.updateLog(
          `Example file for '${icon}' successfully created!`,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Something went wrong while creating the file for '${icon}' :\n${
            err?.stack || err?.message
          }`,
        );
      }
    });
  }

  private buildFolders(icons: string[]): void {
    icons.forEach((icon: string) => {
      const foldername = this.folderNames[icon] as string;

      if (!foldername) {
        this.unsupported.push(icon);
        return;
      }

      try {
        fs.mkdirSync(foldername);
        this.logger.updateLog(
          `Example folder for '${icon}' successfully created!`,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(
          `Something went wrong while creating the folder for '${icon}' :\n${
            err?.stack || err?.message
          }`,
        );
      }
    });
  }
}
