import { expect, test } from '@playwright/test'
import { clearMailbox, recoveryLinkFrom, waitForEmail } from './mailbox.ts'
import { createConfirmedUser, E2E_PASSWORD } from './supabase.ts'

const NEW_PASSWORD = 'new-correct-horse-battery-10'

test.beforeEach(async () => {
  await clearMailbox()
})

test('an applicant can recover their password from the emailed link', async ({
  page,
}) => {
  const { email } = await createConfirmedUser('Password Recovery User')
  await clearMailbox()

  await test.step('request recovery from the login page', async () => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Forgot password?' }).click()

    await expect(page).toHaveURL(/\/forgot-password$/)
    await expect(
      page.getByRole('heading', { name: 'Forgot your password?' }),
    ).toBeVisible()
    const emailInput = page.getByLabel('Email address', { exact: true })
    await emailInput.fill(email)
    await expect(emailInput).toHaveValue(email)
    await page.getByRole('button', { name: 'Send reset link' }).click()

    await expect(
      page.getByRole('heading', { name: 'Check your email' }),
    ).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  const recoveryLink = await test.step('read the recovery link from Mailpit', async () => {
    const message = await waitForEmail(email)
    expect(message.Subject).toMatch(/reset|password/i)
    return recoveryLinkFrom(message)
  })

  await test.step('follow the link and choose a new password', async () => {
    await page.goto(recoveryLink)

    await expect(page).toHaveURL(/\/reset-password#?$/)
    await expect(
      page.getByRole('heading', { name: 'Set a new password' }),
    ).toBeVisible()

    await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD)
    await page
      .getByLabel('Confirm new password', { exact: true })
      .fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Update password' }).click()

    await expect(
      page.getByRole('heading', { name: 'Password updated' }),
    ).toBeVisible()
  })

  await test.step('confirm the recovery session ended', async () => {
    await page.goto('/applications')
    await expect(page).toHaveURL(/\/login$/)
  })

  await test.step('reject the old password and accept the new password', async () => {
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page.getByRole('alert')).toContainText(
      /don't match an account/i,
    )
    await page.getByLabel('Password', { exact: true }).fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page).toHaveURL(/\/applications$/)
    await expect(
      page.getByRole('heading', { name: 'Your applications' }),
    ).toBeVisible()
  })
})
