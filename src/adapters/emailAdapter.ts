import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SETTINGS } from '../constants';

export class EmailAdapter {
	private transporter: Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: SETTINGS.SMTP_USER,
				pass: SETTINGS.SMTP_PASSWORD,
			},
		});
	}

	sendEmail(emailTo: string, emailConfirmationCode: string) {
		const mailOptions: Mail.Options = {
			from: {
				name: 'Blogs-api',
				address: SETTINGS.SMTP_USER!
			},
			to: emailTo,
			subject: 'Confirm your email',
			html: '<h1>Thanks for your registration</h1>\n' +
				'<p>To finish registration please follow the link below:\n' +
				'<a href=' + SETTINGS.HOST + '/confirm-email?code=' + emailConfirmationCode + '>complete registration</a>\n' +
				'</p>',
		};

		return this.transporter.sendMail(mailOptions);
	}
}

export const emailAdapter = new EmailAdapter();