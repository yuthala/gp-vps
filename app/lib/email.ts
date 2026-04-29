
export async function sendVerificationEmail(to: string, verifyUrl: string, name?: string) {
  // Prefer SendGrid API if API key is set
//   try {
//     if (process.env.SENDGRID_API_KEY) {
//       const sg = await import('@sendgrid/mail');
//       sg.setApiKey(process.env.SENDGRID_API_KEY!);
//       const msg = {
//         to,
//         from: process.env.EMAIL_FROM || 'no-reply@example.com',
//         subject: 'Verify your email',
//         text: `Hi ${name || ''},\n\nPlease verify your email by visiting: ${verifyUrl}`,
//         html: `<p>Hi ${name || ''},</p><p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
//       } as any;
//       const res = await sg.send(msg as any);
//       return { provider: 'sendgrid', res };
//     }
//   } catch (e) {
//     console.error('SendGrid send failed', e);
//   }

  // Fall back to SMTP if configured
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: (process.env.SMTP_SECURE || 'false') === 'true',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
        // Add timeout and connection options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000,    // 5 seconds for greeting
        socketTimeout: 30000,     // 30 seconds socket timeout
        // Enable debugging in development
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      });

      const mail: any = {
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        subject: 'Verify your email',
        text: `Hi ${name || ''},\n\nPlease verify your email by visiting: ${verifyUrl}`,
        html: `<p>Hi ${name || ''},</p><p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
      };

      // Verify connection before sending
      await transporter.verify();
      const info = await transporter.sendMail(mail);
      return { provider: 'smtp', info };
    }
  } catch (e) {
    console.error('SMTP send failed', e);
  }

  // Dev fallback: log link to console
  console.log(`Dev verification link for ${to}: ${verifyUrl}`);
  return { provider: 'console', url: verifyUrl };
}

export default sendVerificationEmail;
