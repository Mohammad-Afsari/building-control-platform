import { expect } from '@playwright/test'

/* Local Supabase captures outbound mail in Mailpit rather than
   delivering it. Port comes from `[local_smtp]` in supabase/config.toml. */
const MAILPIT_URL = process.env.MAILPIT_URL ?? 'http://localhost:54324'

type MessageSummary = {
  ID: string
  To: { Address: string }[]
  Subject: string
}

type MessageDetail = {
  ID: string
  Subject: string
  Text: string
  HTML: string
}

/** Drop everything, so a test only ever sees mail it caused. */
export const clearMailbox = async () => {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`, {
    method: 'DELETE',
  })
  expect(
    response.ok,
    `Could not clear Mailpit at ${MAILPIT_URL} — is local Supabase running?`,
  ).toBe(true)
}

const listMessages = async (): Promise<MessageSummary[]> => {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages`)
  if (!response.ok) return []
  const body = (await response.json()) as { messages?: MessageSummary[] }
  return body.messages ?? []
}

/** Poll until a message addressed to `recipient` shows up. */
export const waitForEmail = async (
  recipient: string,
  timeoutMs = 20_000,
): Promise<MessageDetail> => {
  const deadline = Date.now() + timeoutMs
  const target = recipient.toLowerCase()

  while (Date.now() < deadline) {
    const match = (await listMessages()).find((message) =>
      message.To.some((to) => to.Address.toLowerCase() === target),
    )

    if (match) {
      const response = await fetch(`${MAILPIT_URL}/api/v1/message/${match.ID}`)
      return (await response.json()) as MessageDetail
    }

    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  throw new Error(
    `No email arrived for ${recipient} within ${timeoutMs}ms. Check Mailpit at ${MAILPIT_URL}.`,
  )
}

/** Pull a Supabase action link out of an auth email. It points at local
    GoTrue's `/auth/v1/verify`, which verifies and redirects to the app. */
const authActionLinkFrom = (message: MessageDetail): string => {
  const source = `${message.HTML}\n${message.Text}`
  const match = source.match(
    /https?:\/\/[^\s"'<>]*\/auth\/v1\/verify[^\s"'<>]*/,
  )

  if (!match) {
    throw new Error(
      `No verification link found in "${message.Subject}". Body was:\n${message.Text.slice(0, 500)}`,
    )
  }

  return match[0].replace(/&amp;/g, '&')
}

export const confirmationLinkFrom = (message: MessageDetail): string => {
  return authActionLinkFrom(message)
}

export const recoveryLinkFrom = (message: MessageDetail): string => {
  return authActionLinkFrom(message)
}
