import nodemailer from 'nodemailer';

const sendEmail = async (
  recepter: string,
  subject: string,
  msg: string,
  attachment?: Array<{
    filename: string | undefined;
    path: string | undefined;
  }>,
) => {
  const tranporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  if (attachment) {
    return await tranporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recepter,
      subject: subject,
      attachments: attachment,
      html: msg,
    });
  } else {
    return await tranporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recepter,
      subject: subject,
      html: msg,
    });
  }
};

export = sendEmail;
