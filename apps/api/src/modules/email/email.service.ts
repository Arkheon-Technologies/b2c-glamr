import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface BookingEmailPayload {
  toEmail: string;
  toName?: string | null;
  bookingId: string;
  serviceName: string;
  businessName: string;
  staffName?: string | null;
  startAt: Date;
  endAt: Date;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  private get apiKey(): string | undefined {
    return this.config.get<string>('SENDGRID_API_KEY');
  }

  private get fromEmail(): string {
    return this.config.get<string>('EMAIL_FROM') ?? 'noreply@glamr.app';
  }

  private async send(payload: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const apiKey = this.apiKey;

    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY not set — skipping email send');
      return;
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: payload.to }] }],
          from: { email: this.fromEmail, name: 'Glamr' },
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.text },
            { type: 'text/html', value: payload.html },
          ],
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.error(`SendGrid error ${response.status}: ${body}`);
      }
    } catch (err) {
      this.logger.error('Failed to send email', err);
    }
  }

  async sendBookingConfirmation(data: BookingEmailPayload): Promise<void> {
    const dateStr = formatDate(data.startAt);
    const startStr = formatTime(data.startAt);
    const endStr = formatTime(data.endAt);
    const staffLine = data.staffName ? ` with ${data.staffName}` : '';

    const text = [
      `Hi${data.toName ? ` ${data.toName}` : ''},`,
      '',
      `Your booking at ${data.businessName} has been confirmed!`,
      '',
      `Service: ${data.serviceName}`,
      `Date: ${dateStr}`,
      `Time: ${startStr} – ${endStr}${staffLine}`,
      `Booking reference: ${data.bookingId}`,
      '',
      'You can view or manage your booking at https://glamr.app/my-bookings',
      '',
      'See you soon,',
      'The Glamr Team',
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 16px; color: #111;">
  <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">Booking Confirmed</h1>
  <p style="color: #555; margin-bottom: 24px;">Hi${data.toName ? ` ${data.toName}` : ''}, your booking at <strong>${data.businessName}</strong> is confirmed.</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; width: 120px;">Service</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${data.serviceName}</td>
    </tr>
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Date</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${dateStr}</td>
    </tr>
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Time</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${startStr} – ${endStr}</td>
    </tr>
    ${data.staffName ? `<tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Staff</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${data.staffName}</td>
    </tr>` : ''}
    <tr>
      <td style="padding: 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Reference</td>
      <td style="padding: 12px 0; font-size: 12px; font-family: monospace; color: #555;">${data.bookingId}</td>
    </tr>
  </table>

  <a href="https://glamr.app/my-bookings" style="display: inline-block; background: #111; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 28px;">
    View My Bookings
  </a>

  <p style="margin-top: 32px; color: #999; font-size: 12px;">See you soon,<br/>The Glamr Team</p>
</body>
</html>`;

    await this.send({
      to: data.toEmail,
      subject: `Booking confirmed — ${data.serviceName} at ${data.businessName}`,
      html,
      text,
    });
  }

  async sendBookingCancellation(data: BookingEmailPayload): Promise<void> {
    const dateStr = formatDate(data.startAt);
    const startStr = formatTime(data.startAt);

    const text = [
      `Hi${data.toName ? ` ${data.toName}` : ''},`,
      '',
      `Your booking for ${data.serviceName} at ${data.businessName} on ${dateStr} at ${startStr} has been cancelled.`,
      '',
      `Booking reference: ${data.bookingId}`,
      '',
      'If this was a mistake, please book again at https://glamr.app/explore',
      '',
      'The Glamr Team',
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 16px; color: #111;">
  <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 8px;">Booking Cancelled</h1>
  <p style="color: #555; margin-bottom: 24px;">Hi${data.toName ? ` ${data.toName}` : ''}, your booking has been cancelled.</p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; width: 120px;">Service</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${data.serviceName}</td>
    </tr>
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Date</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px;">${dateStr} at ${startStr}</td>
    </tr>
    <tr>
      <td style="padding: 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Reference</td>
      <td style="padding: 12px 0; font-size: 12px; font-family: monospace; color: #555;">${data.bookingId}</td>
    </tr>
  </table>

  <a href="https://glamr.app/explore" style="display: inline-block; background: #111; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; padding: 14px 28px;">
    Book Again
  </a>

  <p style="margin-top: 32px; color: #999; font-size: 12px;">The Glamr Team</p>
</body>
</html>`;

    await this.send({
      to: data.toEmail,
      subject: `Booking cancelled — ${data.serviceName} at ${data.businessName}`,
      html,
      text,
    });
  }
}
