import twilio from 'twilio';
import { IWhatsAppService } from '@domain/services/IWhatsAppService';

export class TwilioWhatsAppService implements IWhatsAppService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | undefined;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. whatsapp:+14155238886

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
    } else {
      console.warn('Twilio credentials not fully configured. WhatsApp notifications will be mocked/ignored.');
    }
  }

  async sendMessage(phone: string, template: string, params: Record<string, string>): Promise<boolean> {
    if (!this.client || !this.fromNumber) {
      console.log(`[Mock WhatsApp] To: ${phone}, Template: ${template}, Params:`, params);
      return true; // Simulate success if not configured
    }

    try {
      // In a real scenario you would construct the body based on the template and params.
      // Twilio's API requires specific message body matching approved templates,
      // or you can send free-form messages within a 24h session window.
      let body = `Notificación: ${template}\n`;
      for (const [key, value] of Object.entries(params)) {
        body += `- ${key}: ${value}\n`;
      }

      await this.client.messages.create({
        body: body.trim(),
        from: this.fromNumber.startsWith('whatsapp:') ? this.fromNumber : `whatsapp:${this.fromNumber}`,
        to: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`,
      });

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message via Twilio:', error);
      return false; // Return false instead of throwing to avoid breaking the main flow
    }
  }
}
