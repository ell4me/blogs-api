import nodemailer, { Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { SETTINGS } from '../constants';
import { injectable } from 'inversify';

@injectable()
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

	sendEmailConfirmation(emailTo: string, emailConfirmationCode: string): Promise<void> {
		const mailOptions: Mail.Options = {
			from: {
				name: 'Blogs-api',
				address: SETTINGS.SMTP_USER!,
			},
			to: emailTo,
			subject: 'Confirm your email',
			html:
				'<h1>Thanks for your registration</h1>\n' +
				'<p>To finish registration please follow the link below:\n' +
				'<a href=' +
				SETTINGS.HOST +
				'/confirm-email?code=' +
				emailConfirmationCode +
				'>complete registration</a>\n' +
				'</p>',
		};

		return this.transporter.sendMail(mailOptions);
	}

	sendEmailRecoveryPassword(emailTo: string, passwordRecoveryCode: string): Promise<void> {
		const mailOptions: Mail.Options = {
			from: {
				name: 'Blogs-api',
				address: SETTINGS.SMTP_USER!,
			},
			to: emailTo,
			subject: 'Password recovery',
			html:
				'<h1>Password recovery</h1>\n' +
				'<p>To finish password recovery please follow the link below:\n' +
				'<a href=' +
				SETTINGS.HOST +
				'/password-recovery?recoveryCode=' +
				passwordRecoveryCode +
				'>recovery password</a>\n' +
				'</p>',
		};

		return this.transporter.sendMail(mailOptions);
	}
}
