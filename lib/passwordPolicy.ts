// Shared password policy for every place a user sets a password (registration
// and password reset). Keeping it in one module means the rules can't drift
// between entry points — the launch review found registration accepting
// 'password1' (8 chars, one digit), which is far too thin for accounts holding
// delivery addresses and order history.

import { z } from 'zod'

export const MIN_PASSWORD_LENGTH = 10

// Human-readable summary shown in the UI next to password fields.
export const PASSWORD_POLICY_HINT = `At least ${MIN_PASSWORD_LENGTH} characters, including a letter and a number.`

// A small deny-list of the most common passwords (and near-miss variants that
// clear the length/letter/number checks). Not exhaustive — it's a cheap screen
// against the handful of passwords that dominate credential-stuffing lists.
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password12',
  'password123',
  'password1234',
  'passw0rd',
  'passw0rd123',
  'qwerty123',
  'qwerty12345',
  'qwertyuiop',
  '1234567890',
  '12345678901',
  '123456789012',
  'abc123456',
  'iloveyou1',
  'iloveyou123',
  'admin12345',
  'welcome123',
  'letmein123',
  'monkey12345',
  'football123',
  'baseball123',
  'sunshine123',
  'princess123',
  'trinidad123',
  'ziptt12345',
])

export function checkPassword(pw: string): { ok: true } | { ok: false; error: string } {
  if (pw.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (!/[a-zA-Z]/.test(pw)) {
    return { ok: false, error: 'Password must contain at least one letter.' }
  }
  if (!/\d/.test(pw)) {
    return { ok: false, error: 'Password must contain at least one number.' }
  }
  if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
    return { ok: false, error: 'That password is too common. Please choose a less predictable one.' }
  }
  return { ok: true }
}

// Zod field usable directly inside a request schema. Surfaces the first policy
// violation as the validation message.
export const passwordSchema = z.string().superRefine((pw, ctx) => {
  const result = checkPassword(pw)
  if (!result.ok) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error })
  }
})
