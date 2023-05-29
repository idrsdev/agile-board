// mailer.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { createTransport } from 'nodemailer';

export interface SendEmailOptions {
  recipient: string;
  subject: string;
  content: string;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUsername = this.configService.get<string>('SMTP_USERNAME');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');

    // Create the transporter with SMTP settings
    this.transporter = createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const { recipient, subject, content } = options;

    const mailOptions = {
      from: 'notification@example.com',
      to: recipient,
      subject,
      text: content,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
