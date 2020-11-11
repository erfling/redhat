import * as NodeMailer from "nodemailer";
import UserModel, { RoleName } from "../../shared/models/UserModel";
import * as sgMail from "@sendgrid/mail";

export default abstract class EmailCtrl {
  private constructor() {}

  public static SEND_EMAIL(
    recipient: UserModel,
    token: string,
    isReset: boolean = false
  ) {
    sgMail.setApiKey(process.env.JFJFJF);

    console.log(recipient.Email);
    console.log("HEY YO", process.env.JFJFJF);
    let transporter = NodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: "breeden@gnuidea.net",
        pass: "Molly7171**",
      },
    });

    const mailOptions = {
      from: "Source Stream Experience <matt@sapienexperience.com>", // sender address
      to: recipient.Email, // list of receivers
      subject: "Sign Up for Source Stream", // Subject line
      html:
        "<p>You've been invited to be a" +
        (recipient.Role == RoleName.ADMIN ? "n " : " ") +
        " " +
        recipient.Role.toLowerCase() +
        " for Source Stream Experience. Click the link below and enter a password to join.</p><a href='http://sourcestreamexperience.com/login/join?token=" +
        token +
        "'>Sign up</a>", // plain text body,
      /*
      mail_settings: {
        sandbox_mode: {
          enable: true,
        },
      },*/
    };

    sgMail
      .send(mailOptions)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error.body.errors);
      });

    /*
    if (isReset) {
      mailOptions.subject = "Sapien Experience Password Reset";
      mailOptions.html =
        "<p>Click the link to reset your Source Stream Experience admin password.</p><a href='http://sourcestreamexperience.com/login/join?token=" +
        token +
        "'>Reset Password</a><p>If you didn't request a new password, please contact Sapien Experience administrators.</p>"; // plain text body
    }

    transporter.sendMail(mailOptions, function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    });*/
  }
}
