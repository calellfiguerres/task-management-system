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

    const input = {
        FromEmailAddress: "noreply@jamaltime.tycoonlover1359.omg.lol",
        FromEmailAddressIdentityArn: "", // CHANGE THIS
        Destination: {
            ToAddresses: [
                destinationEmail
            ]
        },
        FeedbackForwardingEmailAddress: "abuse@tycoonlover1359.omg.lol",
        FeedbackForwardingEmailAddressIdentityArn: "", // CHANGE THIS
        Content: {
            Simple: {
                Subject: {
                    Data: "Jamal Time Password Reset Email"
                },
                Body: {
                    Text: {
                        Data: `Use this password reset token to reset your password: ${(await user.resetPassword()).token}`
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