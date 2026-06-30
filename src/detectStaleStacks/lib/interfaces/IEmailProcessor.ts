import { IStackReport } from './IStackReport';
export interface IEmailProcessor {
  buildEmail(stackReport: IStackReport[], date: Date): string;
  buildEmailAndSend(stackReport: IStackReport[], date: Date): Promise<string>;
  sendEmail(message: string): void;
}
