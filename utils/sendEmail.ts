import sgMail from '@sendgrid/mail'

sgMail.setApiKey(`${process.env.SENDGRID_KEY}`)


export const genCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < 10; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
      }
      return code;
}

export const sendMailToVerify = async (email: string, code: string) => {
    try {
        
        const msg = {
            to: email,
            from: 'suttapak@dentxai.com',
            subject: 'Verify with code',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                  <h1 style="color: #333333;">Your Verification Code</h1>
                  <p style="font-size: 16px; color: #555555;">Your code to verify is <strong style="color: #007bff; font-size: 20px;">${code}</strong>.</p>
                </div>
              </div>
              `,
          };
        
          try {
            await sgMail.send(msg);
            console.log('Email sent successfully!');
          } catch (error) {
            console.error('Error sending email:', error);
          }
        
    } catch (error) {
        console.error('Send email ERROR!!')
        throw error
    }
}

export const sendMailToForgetPass = async (email: string, username: string) => {
  try {
      
      const msg = {
          to: email,
          from: 'suttapak@dentxai.com',
          subject: 'Verify with code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
              <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #333333;">Hello, <strong>${username}</strong>!</h1>
                <p style="font-size: 16px; color: #555555;">We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                <p style="font-size: 16px; color: #555555;">To reset your password, please click the button below:</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.ORIGIN_URL}/sign-in/forgot/re-type" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px;">Set New Password</a>
                </div>
              </div>
            </div>
            `,
        };
      
        try {
          await sgMail.send(msg);
          console.log('Email sent successfully!');
        } catch (error) {
          console.error('Error sending email:', error);
        }
      
  } catch (error) {
      console.error('Send email ERROR!!')
      throw error
  }
}