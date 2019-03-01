import * as NodeMailer from 'nodemailer'
import UserModel, { RoleName } from '../../shared/models/UserModel';

export default abstract class EmailCtrl {

    private constructor() { }

    public static SEND_EMAIL(recipient: UserModel, token: string, isReset: boolean = false) {
        console.log(recipient.Email)
        let transporter = NodeMailer.createTransport(
            {
                service: 'gmail',
                auth: {
                    user: 'breeden@gnuidea.net',
                    pass: 'Molly717'
                }
            }
        )

        const mailOptions = {
            from: 'Source Stream Experience <matt@sapienexperience.com>', // sender address
            to: recipient.Email, // list of receivers
            subject: 'Sign Up', // Subject line
            html: "<p>You've been invited to be a" + ((recipient.Role == RoleName.ADMIN) ? "n " : " ") + " " + recipient.Role.toLowerCase() + " for Source Stream Experience. Click the link below and enter a password to join.</p><a href='http://planetsapientestsite.com/login/join?token=" + token + "'>Sign up</a>"// plain text body
        };

        if (isReset) {
            mailOptions.subject = "Sapien Experience Password Reset"
            mailOptions.html = "<p>Click the link to reset your Source Stream Experience admin password.</p><a href='http://planetsapientestsite.com/login/join?token=" + token + "'>Reset Password</a><p>If you didn't request a new password, please contact Sapien Experience administrators.</p>"// plain text body
        }

        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
    }
}