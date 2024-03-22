import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
            user: 'olawaweb@outlook.com',
            pass: 'Sutee_120'
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
            from: 'olawaweb@outlook.com',
            to: email,
            subject: 'Please confirm your email',
            html: `<h2>Your confirmation code is: <h1><b>${confirmationCode}</b></h1></h2>`
        })
        console.log('Send email success')
        
    } catch (error) {
        console.error('Send email ERROR!!')
        throw error
    }
}