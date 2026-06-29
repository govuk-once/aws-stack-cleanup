import { IStackReport } from './IStackReport';
export interface IEmailProcessor {
  buildEmail(stackReport: IStackReport[]): string;
  sendEmail(): void;
}
