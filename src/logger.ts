import * as readline from 'readline';
import { ISpinner } from './interfaces';

export class Logger {
  private frames = ['- ', '\\ ', '| ', '/ '];
  private countLines = 1;

  public log(message: string, groupId?: string): void {
    process.stdout.write(`${this.getHeader(groupId)}${message}\n`);
    this.countLines++;
  }

  public error(message: string, groupId?: string): void {
    process.stderr.write(`${this.getHeader(groupId)}${message}\n`);
    this.countLines++;
  }

  public updateLog(message: string, line?: number): void {
    if (!process.stdout.isTTY) {
      process.stdout.write(`${message}\n`);
      return;
    }
    if (!line) {
      line = 1;
    }
    readline.moveCursor(process.stdout, 0, -line);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`${message}\n`);
    readline.moveCursor(process.stdout, 0, line);
  }

  public spinnerLogStart(message: string, groupId?: string): ISpinner {
    const line = this.countLines;
    this.log(message, groupId);
    return { timer: this.spin(message, groupId, line), line };
  }

  public spinnerLogStop(
    spinner: ISpinner,
    message?: string,
    groupId?: string,
  ): void {
    clearInterval(spinner.timer);
    this.updateLog(
      `${this.getHeader(groupId)}${message}`,
      this.countLines - spinner.line,
    );
    this.cursorShow();
  }

  private spin(message: string, groupId?: string, line?: number): NodeJS.Timer {
    if (!process.stdout.isTTY) {
      return;
    }
    let i = 0;
    return setInterval(() => {
      this.cursorHide();
      const frame = this.frames[(i = ++i % this.frames.length)];
      this.updateLog(
        `${this.getHeader(groupId)}${frame}${message}`,
        this.countLines - line,
      );
    }, 80);
  }

  private cursorShow(): void {
    process.stdout.write('\u001B[?25h');
  }

  private cursorHide(): void {
    process.stdout.write('\u001B[?25l');
  }

  private getHeader(groupId: string): string {
    return groupId ? `[${groupId}]: ` : '';
  }
}
