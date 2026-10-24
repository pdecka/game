import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as nodemailer from 'nodemailer'

const OTP_TTL_SECONDS = 12 * 60

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name)
  private otpStore = new Map<string, { otp: string; expiresAt: number; email: string }>()

  constructor(private configService: ConfigService) {}

  generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString()
  }

  private key(identifier: string) {
    return String(identifier || '').trim().toLowerCase()
  }

  async sendOtp(email: string, phone?: string, _countryCode?: string): Promise<{ otp: string; expiresAt: number; mailed: boolean }> {
    const address = this.key(email)
    if (!address || !address.includes('@')) {
      throw new Error('A valid email is required to send OTP')
    }

    const otp = this.generateOtp()
    const ttl = parseInt(this.configService.get('OTP_EXPIRES_IN') || String(OTP_TTL_SECONDS), 10)
    const expiresAt = Date.now() + ttl * 1000
    this.otpStore.set(address, { otp, expiresAt, email: address })
    if (phone) this.otpStore.set(this.key(phone), { otp, expiresAt, email: address })

    const minutes = Math.max(1, Math.round(ttl / 60))
    let mailed = false
    try {
      mailed = await this.sendMail(address, otp, minutes)
    } catch (error) {
      this.logger.error(`OTP email failed for ${address}: ${error instanceof Error ? error.message : error}`)
    }

    this.logger.log(`OTP generated for ${address} (mailed=${mailed}, ttl=${ttl}s)`)
    return { otp, expiresAt, mailed }
  }

  async resendOtp(email: string): Promise<{ otp: string; expiresAt: number; mailed: boolean } | null> {
    const address = this.key(email)
    const stored = this.otpStore.get(address)
    return this.sendOtp(address, stored?.email === address ? undefined : stored?.email)
  }

  verifyOtp(identifier: string, otp: string): boolean {
    const stored = this.otpStore.get(this.key(identifier))
    if (!stored) return false
    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(this.key(identifier))
      return false
    }
    if (stored.otp !== String(otp).trim()) return false
    for (const [key, value] of this.otpStore) {
      if (value.otp === stored.otp) this.otpStore.delete(key)
    }
    return true
  }

  private transporter() {
    const host = (this.configService.get('SMTP_HOST') || '').trim()
    const user = (this.configService.get('SMTP_USER') || '').trim()
    const pass = (this.configService.get('SMTP_PASS') || '').trim()
    if (host) {
      return nodemailer.createTransport({
        host,
        port: Number(this.configService.get('SMTP_PORT') || 587),
        secure: String(this.configService.get('SMTP_SECURE') || '') === 'true',
        auth: user ? { user, pass } : undefined,
      })
    }
    if (fs.existsSync('/usr/sbin/sendmail')) {
      return nodemailer.createTransport({ sendmail: true, newline: 'unix', path: '/usr/sbin/sendmail' })
    }
    return null
  }

  private async sendMail(to: string, otp: string, minutes: number) {
    const transport = this.transporter()
    if (!transport) return false
    const appUrl = (this.configService.get('APP_URL') || 'https://arenabet.poker').replace(/\/$/, '')
    const from =
      this.configService.get('MAIL_FROM') ||
      this.configService.get('SMTP_USER') ||
      'Arena Bet <noreply@arenabet.poker>'
    const logo = `${appUrl}/logo-vertical.png`
    await transport.sendMail({
      from,
      to,
      subject: `${otp} is your Arena Bet verification code`,
      text: `Your Arena Bet one-time password is ${otp}. This code is valid for ${minutes} minutes. If you did not create an account, ignore this email. 18+ only. Play responsibly.`,
      html: `
        <div style="margin:0;padding:24px;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;color:#0f1a14;">
          <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #d7e3dc;border-radius:16px;padding:28px;text-align:center;">
            <img src="${logo}" alt="Arena Bet" width="120" style="width:120px;height:auto;margin-bottom:16px;" />
            <p style="margin:0 0 8px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#1f8a4c;">Arena Bet</p>
            <h1 style="margin:0 0 12px;font-size:22px;">Verify your email</h1>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#42554a;">
              Use this one-time password to finish creating your Arena Bet account. Online casino and sports betting for registered players. 18+ only.
            </p>
            <div style="display:inline-block;letter-spacing:.28em;font-size:32px;font-weight:700;background:#eef8f1;border:1px solid #b7e0c6;border-radius:12px;padding:12px 22px;color:#0f1a14;">
              ${otp}
            </div>
            <p style="margin:20px 0 0;font-size:14px;color:#42554a;">This OTP is valid for <strong>${minutes} minutes</strong>.</p>
            <p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#6b7c73;">
              If you did not request this code, you can ignore this email. Play responsibly.
            </p>
          </div>
        </div>
      `,
    })
    return true
  }
}
