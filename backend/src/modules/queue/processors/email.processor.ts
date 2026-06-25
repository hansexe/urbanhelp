import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SendGridService } from '@modules/notifications/sendgrid.service';

@Processor('email')
export class EmailProcessor {
  constructor(private sendGridService: SendGridService) {}

  @Process()
  async sendEmail(job: Job) {
    const { to, subject, htmlContent } = job.data;

    try {
      await this.sendGridService.sendEmail(to, subject, htmlContent);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send email to ${to}: ${errorMessage}`);
    }
  }
}
