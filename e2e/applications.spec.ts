import { expect, test } from '@playwright/test'
import { clearMailbox } from './mailbox.ts'
import {
  createApplication,
  createConfirmedUser,
  E2E_PASSWORD,
} from './supabase.ts'

test.beforeEach(async () => {
  await clearMailbox()
})

test('an applicant sees only their newest-first applications and can use the mobile navigation', async ({
  page,
}) => {
  const owner = await createConfirmedUser('Dashboard Owner')
  const olderAddress = `Older owner address ${Date.now()}`
  const newerAddress = `Newer owner address ${Date.now()}`
  const hiddenAddress = `Another user's address ${Date.now()}`

  const olderId = await createApplication(owner.client, {
    name: 'Older owner project',
    address: olderAddress,
    status: 'submitted',
    updatedAt: '2026-07-01T09:00:00.000Z',
  })
  const newerId = await createApplication(owner.client, {
    name: 'Newer owner project',
    address: newerAddress,
    status: 'review',
    updatedAt: '2026-08-01T09:00:00.000Z',
  })
  const other = await createConfirmedUser('Another Applicant')
  await createApplication(other.client, {
    name: 'Private project',
    address: hiddenAddress,
    updatedAt: '2026-08-03T09:00:00.000Z',
  })

  await test.step('log in through the application', async () => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(owner.email)
    await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Log in' }).click()
    await expect(page).toHaveURL(/\/applications$/)
  })

  await test.step('render only the owner rows in newest-first order', async () => {
    await expect(
      page.getByRole('heading', { name: 'Your applications' }),
    ).toBeVisible()
    await expect(page.getByText(newerAddress)).toBeVisible()
    await expect(page.getByText(olderAddress)).toBeVisible()
    await expect(page.getByText(hiddenAddress)).toHaveCount(0)

    const mainText = await page.getByRole('main').innerText()
    expect(mainText.indexOf(newerAddress)).toBeLessThan(
      mainText.indexOf(olderAddress),
    )
  })

  await test.step('open and close the mobile navigation from the keyboard', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    const menu = page.getByRole('button', { name: 'Menu' })
    await menu.focus()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText('Dashboard Owner')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(menu).toHaveAttribute('aria-expanded', 'false')
  })

  await test.step('follow an application link to its existing detail route', async () => {
    await page.getByText(newerAddress).click()
    await expect(page).toHaveURL(new RegExp(`/applications/${newerId}$`))
    await expect(
      page.getByRole('heading', { name: `Application ${newerId}` }),
    ).toBeVisible()
  })

  expect(olderId).not.toBe(newerId)
})
