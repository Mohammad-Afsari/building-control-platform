import { expect, test } from '@playwright/test'
import { clearMailbox, confirmationLinkFrom, waitForEmail } from './mailbox.ts'

const PASSWORD = 'correct-horse-battery-9'

/* A fresh address per run, so a rerun never collides with a user left
   behind by the previous one. */
const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

test.beforeEach(async () => {
  await clearMailbox()
})

test('a new applicant can sign up, confirm by email and reach their applications', async ({
  page,
}) => {
  const email = uniqueEmail()

  await test.step('complete the signup form', async () => {
    await page.goto('/signup')

    await page.getByLabel('Full name').fill('Sarah Davies')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
    await page.getByLabel('Confirm password').fill(PASSWORD)
    await page.getByRole('checkbox').check()
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(
      page.getByRole('heading', { name: 'Check your email' }),
    ).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  const link = await test.step('read the confirmation link out of the email', async () => {
    const message = await waitForEmail(email)
    expect(message.Subject).toMatch(/confirm/i)
    return confirmationLinkFrom(message)
  })

  await test.step('follow the link and land verified', async () => {
    await page.goto(link)

    await expect(
      page.getByRole('heading', { name: 'Your email is verified' }),
    ).toBeVisible()
  })

  await test.step('continue into the app', async () => {
    await page.getByRole('link', { name: /continue to dashboard/i }).click()
    await expect(page).toHaveURL(/\/applications$/)
  })
})

test('an unconfirmed account cannot log in yet', async ({ page }) => {
  const email = uniqueEmail()

  await page.goto('/signup')
  await page.getByLabel('Full name').fill('Unconfirmed User')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByLabel('Confirm password').fill(PASSWORD)
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(
    page.getByRole('heading', { name: 'Check your email' }),
  ).toBeVisible()

  await page.goto('/login')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Log in' }).click()

  await expect(page.getByRole('alert')).toContainText(/has not been confirmed/i)
  await expect(page).toHaveURL(/\/login$/)
})

test('a signed-out visitor is redirected away from a protected route', async ({
  page,
}) => {
  await page.goto('/applications')
  await expect(page).toHaveURL(/\/login$/)
})
