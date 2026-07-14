import { BrevoClient } from '@getbrevo/brevo'
import ApiError from './ApiError.js'

let brevoClient = null

function getBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey) {
    throw new ApiError(500, 'Email service is not configured')
  }

  if (apiKey.startsWith('xsmtpsib-')) {
    throw new ApiError(
      500,
      'BREVO_API_KEY is an SMTP key. Use an API key from Brevo (starts with xkeysib-), not an SMTP key.'
    )
  }

  if (!brevoClient) {
    brevoClient = new BrevoClient({ apiKey })
  }

  return brevoClient
}

function getSender() {
  const email = process.env.BREVO_SENDER_EMAIL?.trim()
  const name = process.env.BREVO_SENDER_NAME?.trim() || 'First App'

  if (!email) {
    throw new ApiError(500, 'Email sender is not configured')
  }

  return { email, name }
}

function mapBrevoError(error) {
  const status = error?.statusCode
  const bodyMessage = error?.body?.message || error?.message || ''

  if (status === 401 || /key not found|unauthorized/i.test(bodyMessage)) {
    return new ApiError(
      502,
      'Brevo rejected the API key. Create an API key (xkeysib-...) in Brevo → SMTP & API → API keys.'
    )
  }

  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(bodyMessage)) {
    return new ApiError(502, 'Could not reach Brevo. Check your network connection and try again.')
  }

  console.error('Brevo send failed:', {
    statusCode: status,
    message: bodyMessage,
    body: error?.body,
  })

  return new ApiError(502, 'Failed to send verification email')
}

export async function sendVerificationOtpEmail({ to, otp, username }) {
  const client = getBrevoClient()
  const sender = getSender()

  try {
    await client.transactionalEmails.sendTransacEmail({
      sender,
      to: [{ email: to, name: username || to }],
      subject: 'Verify your email — First',
      htmlContent: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1a1714;">
          <h1 style="font-size: 28px; margin-bottom: 8px;">First</h1>
          <p style="font-size: 16px; line-height: 1.5;">
            Hi${username ? ` ${username}` : ''}, use this code to verify your email address:
          </p>
          <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">
            ${otp}
          </p>
          <p style="font-size: 14px; color: #5c564f; line-height: 1.5;">
            This code expires in 10 minutes. If you did not create an account, you can ignore this email.
          </p>
        </div>
      `,
      textContent: `Your First verification code is ${otp}. It expires in 10 minutes.`,
    })
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw mapBrevoError(error)
  }
}
