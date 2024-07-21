import sgMail from '@sendgrid/mail'

sgMail.setApiKey(`${process.env.SENDGRID_KEY}`)


export const genCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < 32; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
      }
      return code;
}

export const sendMailToVerify = async (email: string) => {
    try {
        
        const msg = {
            to: email,
            from: 'suttapak@dentxai.com',
            subject: 'Sending with SendGrid is Fun',
            text: 'test',
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