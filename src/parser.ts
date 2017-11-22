import { Logger } from './logger';
import { IParsedArgs } from './interfaces';

export class Parser {

  /**
   * Parse the arguments
   *
   * @param {any} args The arguments
   * @returns {IParsedArgs} Object of parsed arguments
   */
  public static parse(args: string[], logger: Logger): IParsedArgs {
    const supportedFlags = ['--all', '--folders', '--files'];
    const showHelp = supportedFlags.indexOf(args[2]) === -1;
    const helpIndex = args.findIndex(arg => arg === '--help' || arg === '-h');

    if (showHelp || helpIndex !== -1) {
      logger.log(`
  Flags:

    --all     : Generates examples for all icons
    --files   : Generates examples for all file icons
    --folders : Generates examples for all folder icons

  Providing the icon names after '--files' or '--folders',
  restricts the examples generator to that icons only
      `);
      process.exit();
    }

    const regex = /^--(all|files|folders)$/gmi;
    const flag = regex.exec(args[2])[1];
    const icons = [];

    // if it's 'files' or 'folders' collect any names after
    if (supportedFlags.slice(1).indexOf(args[2]) > -1) {
      for (let i = 3; i < args.length; i++) {
        icons.push(args[i]);
      }
    }

    return {
      flag,
      icons,
    };
  }

}
