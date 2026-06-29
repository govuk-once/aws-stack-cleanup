import { IStackReport } from './IStackReport';
export interface IEmailProcessor {
  buildEmail(stackReport: IStackReport[]): string;
  buildEmailAndSend(stackReport: IStackReport[]): void;
  sendEmail(message: string): void;
}
