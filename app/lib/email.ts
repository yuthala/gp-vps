/* eslint-disable @typescript-eslint/no-explicit-any */
export async function sendVerificationEmail(to: string, verifyUrl: string, name?: string) {
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
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 30000,
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mail: any = {
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        // subject: 'Verify your email',
				subject: 'Подтвердите адрес электронной почты',
        //text: `Hi ${name || ''},\n\nPlease verify your email by visiting: ${verifyUrl}`,
				text: `Здравствуйте, ${name || ''},\n\nПожалуйста пройдите по ссылке, чтобы подтвердить ваш адрес электронной почты: ${verifyUrl}`,
        html: `<p>Hi ${name || ''},</p><p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
      };

      await transporter.verify();
      const info = await transporter.sendMail(mail);
      return { provider: 'smtp', info };
    }
  } catch (e) {
    console.error('SMTP send failed', e);
  }

  console.log(`Dev verification link for ${to}: ${verifyUrl}`);
  return { provider: 'console', url: verifyUrl };
}

export async function sendCredentialsEmail(
  to: string,
  name: string,
  password: string,
  loginUrl: string,
) {
  const htmlBody = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Данные для входа</title>
  </head>
  <body style="margin:0;padding:0;background:#F2F9ED;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F2F9ED;padding:24px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(6,73,41,0.08);">
            <tr>
              <td style="padding:32px;text-align:center;background:#40AD52;color:#FFFFFF;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;">Ваши данные для входа</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#334155;">
                <p style="font-size:16px;line-height:1.75;margin:0 0 16px;">Здравствуйте, ${name}.</p>
                <p style="font-size:16px;line-height:1.75;margin:0 0 24px;">Аккаунт успешно создан для оформления заказа на Green Pato. Используйте следующие данные для входа:</p>
                <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin-bottom:24px;border:1px solid #E2E8F0;border-radius:16px;">
                  <tr>
                    <td style="padding:16px;background:#F2F9ED;color:#0F172A;font-weight:700;border-top-left-radius: 16px;">E-mail</td>
                    <td style="padding:16px;color:#0F172A;">${to}</td>
                  </tr>
                  <tr>
                    <td style="padding:16px;background:#F2F9ED;color:#0F172A;font-weight:700;border-bottom-left-radius: 16px;">Пароль</td>
                    <td style="padding:16px;color:#0F172A;">${password}</td>
                  </tr>
                </table>
                <p style="font-size:16px;line-height:1.75;margin:0 0 24px;">Перейдите по кнопке ниже, чтобы войти.</p>
                <div style="text-align:center;margin-bottom:24px;">
                  <a href="${loginUrl}" style="display:inline-block;padding:14px 30px;border-radius:999px;background:#40AD52;color:#FFFFFF;font-weight:700;text-decoration:none;">Войти на сайт</a>
                </div>
                <p style="font-size:14px;color:#64748B;margin:0;">Если вы не запрашивали этот доступ, просто проигнорируйте это письмо.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 30000,
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mail: any = {
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        subject: 'Green Pato: данные для входа',
        text: `Здравствуйте ${name},\n\nВаши данные для входа:\nE-mail: ${to}\nПароль: ${password}\n\nВойдите по ссылке: ${loginUrl}`,
        html: htmlBody,
      };

      await transporter.verify();
      const info = await transporter.sendMail(mail);
      return { provider: 'smtp', info };
    }
  } catch (e) {
    console.error('SMTP send failed', e);
  }

  console.log(`Dev login credentials for ${to}: email=${to} password=${password} login=${loginUrl}`);
  return { provider: 'console', url: loginUrl };
}

export async function sendOrderDeliveryDetailsEmail({
  to,
  name,
  phone,
  comment,
  deliveryPointAddress,
  cartItems,
  goodsTotal,
  deliveryPrice,
  checkoutUrl,
}: {
  to: string;
  name: string;
  phone?: string;
  comment?: string;
  deliveryPointAddress?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cartItems: any[];
  goodsTotal: number;
  deliveryPrice: number;
  checkoutUrl: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST and SMTP_PORT.');
  }

  const cartRows = cartItems
    .map(
      (item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #E2E8F0;">${item.description}</td>
        <td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:center;">${item.qty}</td>
        <td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:right;">${item.price} р.</td>
        <td style="padding:12px;border-bottom:1px solid #E2E8F0;text-align:right;">${item.price * item.qty} р.</td>
      </tr>`
    )
    .join('');

  const htmlBody = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Детали заказа</title>
  </head>
  <body style="margin:0;padding:0;background:#F2F9ED;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#F2F9ED;padding:24px;font-size:16px;color:#334155;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(6,73,41,0.08);">
            <tr>
              <td style="padding:32px;text-align:center;background:#40AD52;color:#FFFFFF;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;">Детали вашего заказа</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#334155;">
                <p style="font-size:16px;line-height:1.75;margin:0 0 16px;">Здравствуйте, ${name}.</p>
                <p style="font-size:16px;line-height:1.75;margin:0 0 16px;">Ниже приведены детали вашего заказа №хххххххх от ХХ.ХХ.ХХХХ и доставки:</p>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;margin-bottom:24px;">
                  <thead>
                    <tr>
                      <th style="padding:12px;border-bottom:2px solid #E2E8F0;text-align:left;background:#F2F9ED;">Товар</th>
                      <th style="padding:12px;border-bottom:2px solid #E2E8F0;text-align:center;background:#F2F9ED;">Кол-во</th>
                      <th style="padding:12px;border-bottom:2px solid #E2E8F0;text-align:right;background:#F2F9ED;">Цена</th>
                      <th style="padding:12px;border-bottom:2px solid #E2E8F0;text-align:right;background:#F2F9ED;">Всего</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cartRows}
                  </tbody>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:24px;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="padding:16px;background:#F2F9ED;font-weight:700;">Сумма товаров</td>
                    <td style="padding:16px;text-align:right;">${goodsTotal} р.</td>
                  </tr>
                  <tr>
                    <td style="padding:16px;background:#F2F9ED;font-weight:700;">Стоимость доставки</td>
                    <td style="padding:16px;text-align:right;">${deliveryPrice} р.</td>
                  </tr>
                  <tr>
                    <td style="padding:16px;font-weight:700;">Итого к оплате</td>
                    <td style="padding:16px;text-align:right;font-weight:700;">${goodsTotal + deliveryPrice} р.</td>
                  </tr>
                </table>
                <div style="padding:24px;background:#F2F9ED;border-radius:16px;margin-bottom:24px;">
                  <p style="margin:0 0 8px;font-weight:700;">Доставка:</p>
                  <p style="margin:0 0 4px;">${deliveryPointAddress || 'Адрес доставки не указан'}</p>
                  <p style="margin:0;">Телефон: ${phone || 'Не указан'}</p>
                  ${comment ? `<p style="margin:16px 0 0;">Комментарий: ${comment}</p>` : ''}
                </div>
                <div style="text-align:center;margin-bottom:24px;">
                  <a href="${checkoutUrl}" style="display:inline-block;padding:14px 30px;border-radius:999px;background:#40AD52;color:#FFFFFF;font-weight:700;text-decoration:none;">Открыть страницу оформления</a>
                </div>
                <p style="font-size:14px;color:#64748B;margin:0;">Если вы не отправляли эту заявку, просто проигнорируйте письмо.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: (process.env.SMTP_SECURE || 'false') === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 30000,
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    const mail: any = {
      from: process.env.EMAIL_FROM || 'no-reply@example.com',
      to,
      subject: 'Green Pato: детали заказа и доставки',
      text: `Здравствуйте ${name},\n\nДетали заказа:\nСумма товаров: ${goodsTotal} р.\nСтоимость доставки: ${deliveryPrice} р.\nИтого: ${goodsTotal + deliveryPrice} р.\nСсылка: ${checkoutUrl}`,
      html: htmlBody,
    };

    await transporter.verify();
    const info = await transporter.sendMail(mail);
    return { provider: 'smtp', info };
  } catch (e) {
    console.error('Order delivery email failed', e);
    throw new Error('Failed to send delivery details email. ' + (e instanceof Error ? e.message : 'Unknown error'));
  }
}
