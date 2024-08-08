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
            html: ` <h1>Your code to verify is <strong>${code}</strong></h1>
                      <h2><Click the link to verify.</h2>
                      <h3>Click <a href="${process.env.ORIGIN_URL}/auth/verifying">Verify</a></h3>`,
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
          html: `<h1>You are <strong>${username}</strong> ?</h1>
                  <h2>Click the link to change password.</h2>
                  <h3>Click <a href="${process.env.ORIGIN_URL}/sign-in/forgot/re-type">New Password</a></h3>`,
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