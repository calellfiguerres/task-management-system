import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { User } from "../Models/User";

const client: SESv2Client = new SESv2Client({
    region: "us-west-2"
});

/**
 * Sends the user a password reset email
 * 
 * @param user The user who's password needs reseting
 * @returns Whether the password reset email was successfully sent
 */
export async function sendPasswordResetEmail(user: User): Promise<boolean> {
    const destinationEmail: string | undefined = user.email;
    if (destinationEmail == null) {
        return false;
    }

    const token = await user.resetPassword();

    const port = process.env.PORT;
    const hostname = process.env.HOSTNAME;

    const url = (port == "443" ? "https://" : "http://") + hostname + ((port == "80" || port == "443") ? "" : `:${port}`) + `/auth/resetpassword?token=${token.token}`;

    const input = {
        FromEmailAddress: "noreply@jamaltime.calell.omg.lol",
        FromEmailAddressIdentityArn: "arn:aws:ses:us-west-2:651915650471:identity/jamaltime.calell.omg.lol", // CHANGE THIS
        Destination: {
            ToAddresses: [
                destinationEmail
            ]
        },
        FeedbackForwardingEmailAddress: "abuse@jamaltime.calell.omg.lol",
        FeedbackForwardingEmailAddressIdentityArn: "arn:aws:ses:us-west-2:651915650471:identity/jamaltime.calell.omg.lol", // CHANGE THIS
        Content: {
            Simple: {
                Subject: {
                    Data: "Jamal Time Password Reset Email"
                },
                Body: {
                    Text: {
                        Data:
                        `Use this link to reset your password: ${url}` + "\n\n" +
                        `Alternatively, use this password reset token to reset your password: ${token.token}` + "\n\n" +
                        `This link and token will be valid for 15 minutes.` + "\n\n" +
                        `If you did not request this, please contact support immediately. Somebody else may be attempting to access your account.`
                    }
                }
            }
        }
    }

    try {        
        const command = new SendEmailCommand(input);
        const response = await client.send(command);
    } catch (e: any) {
        console.log(e);
        return false;
    }

    return true;
}