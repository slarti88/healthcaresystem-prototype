import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  console.log('--- Ethereal Email Credentials ---');
  console.log(`  User: ${testAccount.user}`);
  console.log(`  Pass: ${testAccount.pass}`);
  console.log(`  Web:  https://ethereal.email/login`);
  console.log('----------------------------------');

  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
}

export async function sendMail(options: SendMailOptions): Promise<void> {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"Healthcare System" <noreply@healthcare.local>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  });

  console.log(`  Email sent to ${options.to} - Message ID: ${info.messageId}`);
  console.log(`  Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
}
