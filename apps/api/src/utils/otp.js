import crypto from 'crypto'
import bcrypt from 'bcrypt'

const OTP_LENGTH = 6
const OTP_TTL_MS = 10 * 60 * 1000

export function generateOtp() {
  const max = 10 ** OTP_LENGTH
  const otp = crypto.randomInt(0, max).toString().padStart(OTP_LENGTH, '0')
  return otp
}

export function getOtpExpiry() {
  return new Date(Date.now() + OTP_TTL_MS)
}

export async function hashOtp(otp) {
  return bcrypt.hash(String(otp), 10)
}

export async function verifyOtp(candidateOtp, hashedOtp) {
  if (!hashedOtp) return false
  return bcrypt.compare(String(candidateOtp), hashedOtp)
}
