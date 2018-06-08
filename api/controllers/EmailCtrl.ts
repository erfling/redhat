import * as NodeMailer from 'nodemailer'

export default abstract class EmailCtrl {

    private constructor() { }

    public static SEND_EMAIL(recipient: string, token: string) {
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
            from: 'sender@email.com', // sender address
            to: recipient, // list of receivers
            subject: 'Sign Up', // Subject line
            html: '<a href="http://planetsapientestsite.com/signup?token=' + token + '">Sign up</a>'// plain text body
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });
    }
}