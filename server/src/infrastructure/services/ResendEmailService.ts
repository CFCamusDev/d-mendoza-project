import { Resend } from 'resend';
import { IEmailService } from '@domain/services/IEmailService';

export class ResendEmailService implements IEmailService {
  private resend: Resend | null;
  private readonly defaultFrom = 'DMendoza <onboarding@resend.dev>'; // Cambiar a noreply@techinnovats.com cuando esté validado en Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 're_1234567890_placeholder') {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      console.log('--- SIMULACIÓN DE ENVÍO DE EMAIL ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body HTML:\n${html}`);
      console.log('------------------------------------');
      return;
    }

    try {
      const { error } = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Error sending email with Resend:', error);
        throw new Error(`Error sending email: ${error.message}`);
      }
    } catch (error) {
      console.error('Unexpected error in ResendEmailService:', error);
      throw error;
    }
  }
}
