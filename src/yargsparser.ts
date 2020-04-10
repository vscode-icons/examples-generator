import y from 'yargs';
import { Logger } from './logger';
import { IParsedArgs } from './interfaces';

export class YargsParser {
  private supportedFlags = ['--all', '--files', '--folders'];
  private optionKeys: string[];

  constructor(private logger: Logger) {
    const options: { [key: string]: y.Options } = {
      all: {
        description: 'Generates examples for all icons',
        type: 'boolean',
      },
      files: {
        description: 'Generates examples for all file icons',
        type: 'boolean',
      },
      folders: {
        description: 'Generates examples for all folder icons',
        type: 'boolean',
      },
    };
    this.optionKeys = Object.keys(options);

    const epilogueMsg = `Providing the icon names after '--files' or '--folders',
restricts the examples generator to that icons only`;

    y.usage('Usage: $0 <flag> [space separated icon names]')
      .options(options)
      .group(this.optionKeys, 'Flags:')
      .alias('help', 'h')
      .alias('version', 'V')
      .epilogue(epilogueMsg)
      .check((argv: y.Arguments) => this.validate(argv))
      .strict();
  }

  public parse(): IParsedArgs {
    const pargs = y.argv;
    return {
      flag: this.getFlag(pargs),
      icons: pargs._,
    };
  }

  private validate(pargs: y.Arguments): boolean {
    if (!pargs.all && !pargs.files && !pargs.folders) {
      this.errorHandler('Missing flag argument');
    }
    if (!this.supportedFlags.includes(process.argv[2])) {
      this.errorHandler('Incorrect flag position');
    }
    this.confict(pargs, this.optionKeys[0], this.optionKeys[1]);
    this.confict(pargs, this.optionKeys[1], this.optionKeys[2]);
    this.confict(pargs, this.optionKeys[2], this.optionKeys[0]);
    if (pargs.all && pargs._.length) {
      this.logger.log(`Arguments after '--all' have been ignored\n`);
    }
    return true;
  }

  private confict(pargs: y.Arguments, key1: string, key2: string): void {
    if (pargs[key1] && pargs[key2]) {
      this.errorHandler(
        `Flags '--${key1}' and '--${key2}' are mutually exclusive`,
      );
    }
  }

  private errorHandler(errorMsg: string): void {
    y.showHelp();
    this.logger.error(errorMsg);
    process.exit(1);
  }

  private getFlag(pargs: y.Arguments): string {
    return pargs.all
      ? this.optionKeys[0]
      : pargs.files
      ? this.optionKeys[1]
      : this.optionKeys[2];
  }
}
