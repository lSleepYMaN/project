import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const CLIENT_ID = '565936576592-tl7k0p95n927frp6v49bke9mlg6h90ul.apps.googleusercontent.com'
const CLIENT_SECRET = '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'
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04-CGVmoLRmxUCgYIARAAGAQSNgF-L9IrU8T-EIgJUvyAGSB_-I2Jnv_2Ik1vdjBNa0zDdpyaluft9QHu0xwEVGZ3lsoSDAuOhg'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            type: 'OAuth2',
            user: 'olawaweb@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
        }
    })

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
        
        await transporter.sendMail({
            from: 'OLAWAWEB',
            to: email,
            subject: 'Please confirm your email',
            html: `<a href="https://aiat.wattanapong.com">Verify</a>`
        })
        console.log('Send email success')
        
    } catch (error) {
        console.error('Send email ERROR!!')
        throw error
    }
}

export const sendMailToForget = async (email: string) => {
    try {
        await transporter.sendMail({
            from: 'OLAWAWEB',
            to: email,
            subject: 'Please click to reset password',
            html: `<a href="https://aiat.wattanapong.com">Reset password</a>`
        })
        console.log('Send email success')
    } catch (error) {
        console.error('Send email ERROR!!')
        throw error
    }
}