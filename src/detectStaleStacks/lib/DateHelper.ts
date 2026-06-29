import { Stack } from '@aws-sdk/client-cloudformation';

export class DateHelper {
  public getLastTouchedDate(stack: Stack): Date | undefined {
    return stack.LastUpdatedTime ?? stack.CreationTime;
  }
  public getFormatedLastTouchedDate(stack?: Stack): string {
    if (stack) {
      return this.formatDate(this.getLastTouchedDate(stack));
    }
    return '';
  }
  public formatDate(date?: Date): string {
    if (!date) {
      return '';
    }
    return date.toISOString();
  }
}
