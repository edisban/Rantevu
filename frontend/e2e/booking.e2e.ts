import { expect, test, type Browser, type Page } from '@playwright/test'

// Unique per run, so tests never collide with existing users
const run = Date.now().toString(36)
const PASSWORD = 'secret123'

/** A separate browser "person": own cookies and storage, English UI, intro animation skipped. */
async function person(browser: Browser): Promise<Page> {
  const context = await browser.newContext()
  await context.addInitScript(() => {
    localStorage.setItem('lang', 'en')
    sessionStorage.setItem('introSeen', '1')
  })
  return context.newPage()
}

async function signUp(page: Page, kind: 'client' | 'provider', username: string, fullName: string) {
  await page.goto('/auth')
  await page.getByRole('tab', { name: 'Sign up' }).click()
  if (kind === 'provider') await page.getByRole('button', { name: /Professional/ }).click()
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Full name').fill(fullName)
  await page.getByLabel('Email').fill(`${username}@example.com`)
  if (kind === 'provider') await page.getByLabel('Specialty / Profession').fill('Dentist')
  await page.getByLabel('Password').fill(PASSWORD)
  await page.locator('form').getByRole('button', { name: 'Sign up' }).click()
  await expect(page).toHaveURL(kind === 'provider' ? /\/provider\/dashboard$/ : /\/client\/dashboard$/)
}

async function deleteAccount(page: Page) {
  await page.goto('/profile')
  await page.getByRole('button', { name: 'Delete account' }).click()
  await page.getByLabel('Confirm with your password').fill(PASSWORD)
  await page.getByRole('button', { name: 'Delete forever' }).click()
  await expect(page.getByText('Your account was deleted')).toBeVisible()
}

function tomorrow() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

test('a client books, the professional accepts live, and they chat', async ({ browser }) => {
  const pro = await person(browser)
  const client = await person(browser)
  const proName = `Dr E2E ${run}`
  const clientName = `Client E2E ${run}`

  await signUp(pro, 'provider', `e2epro${run}`, proName)
  await signUp(client, 'client', `e2ecli${run}`, clientName)

  // The client books tomorrow at 10:00 with the new professional
  const card = client.locator('.MuiPaper-root', { hasText: proName })
  await card.getByRole('button', { name: 'Book' }).click()
  const dialog = client.getByRole('dialog')
  await dialog.locator('input[type=date]').fill(tomorrow())
  await dialog.getByRole('button', { name: '10:00', exact: true }).click()
  await dialog.getByRole('button', { name: 'Send request' }).click()
  await expect(client.getByText('Request sent!')).toBeVisible()

  // The professional's dashboard shows the request live, without a reload
  await expect(pro.getByText(`New request from ${clientName}`)).toBeVisible()
  await pro.getByRole('button', { name: 'Accept' }).click()

  // ...and the client sees the decision live
  await expect(client.locator('.MuiChip-root', { hasText: 'Confirmed' })).toBeVisible()
  await expect(client.getByText(`${proName}: Confirmed`)).toBeVisible()

  // Chat: the client writes, the professional gets an unread badge and reads it
  await client.getByRole('link', { name: 'Message', exact: true }).click()
  await client.getByPlaceholder('Write a message…').fill('See you tomorrow!')
  await client.getByPlaceholder('Write a message…').press('Enter')
  await expect(pro.locator('header .MuiBadge-badge')).toHaveText('1')
  await pro.getByRole('link', { name: 'Messages' }).click()
  await pro.getByRole('button', { name: new RegExp(clientName) }).click()
  await expect(pro.getByText('See you tomorrow!')).toBeVisible()

  // Clean up through the app itself
  await deleteAccount(client)
  await deleteAccount(pro)
})

test('a wrong password shows a generic error', async ({ browser }) => {
  const page = await person(browser)
  await page.goto('/auth')
  await page.getByLabel('Username').fill(`nobody${run}`)
  await page.getByLabel('Password').fill('wrong-password1')
  await page.locator('form').getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Invalid credentials')).toBeVisible()
  await expect(page).toHaveURL(/\/auth$/)
})
