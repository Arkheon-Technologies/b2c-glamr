import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ─── SMS ─────────────────────────────────────────────────────────

  async sendSms(to: string, body: string): Promise<boolean> {
    const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.config.get<string>('TWILIO_FROM_NUMBER');

    if (!accountSid || !authToken || !from) {
      this.logger.warn('Twilio not configured — SMS skipped');
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const twilio = require('twilio')(accountSid, authToken);
      await twilio.messages.create({ to, from, body });
      return true;
    } catch (err) {
      this.logger.error(`SMS send failed to ${to}: ${(err as Error).message}`);
      return false;
    }
  }

  // ─── Email (SendGrid) ─────────────────────────────────────────────

  async sendEmail(
    to: string,
    subject: string,
    templateId: string,
    dynamicData: Record<string, unknown>,
  ): Promise<boolean> {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    const fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') ?? 'noreply@glamr.ro';

    if (!apiKey) {
      this.logger.warn('SendGrid not configured — email skipped');
      return false;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(apiKey);
      await sgMail.send({
        to,
        from: fromEmail,
        subject,
        templateId,
        dynamicTemplateData: dynamicData,
      });
      return true;
    } catch (err) {
      this.logger.error(`Email send failed to ${to}: ${(err as Error).message}`);
      return false;
    }
  }

  // ─── Schedule a queued notification ─────────────────────────────

  async scheduleReminder(params: {
    appointmentId: string;
    userId: string;
    channel: 'sms' | 'email' | 'push' | 'inapp';
    kind: string;
    sendAt: Date;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: params.userId,
        kind: params.kind,
        channel: params.channel,
        status: 'queued',
        sendAt: params.sendAt,
        payload: (params.payload ?? {}) as any,
      },
    });
  }

  /** Cancel all pending reminders for an appointment */
  async cancelReminders(appointmentId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        status: 'queued',
        payload: { path: ['appointmentId'], equals: appointmentId },
      },
      data: { status: 'failed' },
    });
  }

  // ─── Cron: dispatch queued notifications every 5 min ───────────

  @Cron(CronExpression.EVERY_5_MINUTES)
  async dispatchQueued() {
    const now = new Date();

    const pending = await this.prisma.notification.findMany({
      where: {
        status: 'queued',
        sendAt: { lte: now },
      },
      include: { user: { select: { email: true, phone: true } } },
      take: 100,
    });

    if (pending.length === 0) return;

    this.logger.log(`Dispatching ${pending.length} queued notifications`);

    for (const notif of pending) {
      let success = false;
      try {
        if (notif.channel === 'sms' && notif.user.phone) {
          const payload = notif.payload as Record<string, unknown> | null;
          const body = (payload?.smsBody as string) ?? 'You have a Glamr reminder.';
          success = await this.sendSms(notif.user.phone, body);
        } else if (notif.channel === 'email' && notif.user.email) {
          const payload = notif.payload as Record<string, unknown> | null;
          success = await this.sendEmail(
            notif.user.email,
            (payload?.subject as string) ?? 'Glamr reminder',
            (payload?.templateId as string) ?? 'd-glamr-reminder',
            payload ?? {},
          );
        } else {
          // push / inapp — mark sent (handled by client polling)
          success = true;
        }
      } catch (err) {
        this.logger.error(`Failed to dispatch notification ${notif.id}: ${(err as Error).message}`);
      }

      await this.prisma.notification.update({
        where: { id: notif.id },
        data: {
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : undefined,
        },
      });
    }
  }
}
