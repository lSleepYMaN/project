import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
            user: 'thailei01@outlook.com',
            pass: 'Sutee120'
    }
})

export const genCode = () => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < 8; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
      }
      return code;
}

export const sendMail = async (email: string, confirmationCode: string) => {
    try {
        await transporter.sendMail({
            from: 'thailei01@outlook.com',
            to: email,
            subject: 'Please confirm your email',
            text: 'Please click on the following link to confirm your email',
            html: `<p>Your confirmation code is: <b>${confirmationCode}</b></p>`
        })
        console.log('Send email success')
        
    } catch (error) {
        console.error('Send email ERROR!!')
        throw error
    }
}