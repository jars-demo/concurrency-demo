import { expect, test } from '@playwright/test'

test('home shows the contents and opens chapter 01', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Concurrency, from first principles.',
  )
  await expect(page.locator('#contents ol > li')).toHaveCount(8)
  await expect(page.locator('#contents')).toContainText('Ten croissants, fifty sold')

  await page.getByRole('link', { name: 'Start chapter 01' }).first().click()
  await expect(page).toHaveURL(/\/workshop\/01-waiting-is-not-working$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Waiting is not working')
})

test('the explorer loses an update, and the lock prevents it', async ({ page }) => {
  await page.goto('/#explorer')
  const explorer = page.locator('#explorer')
  const stepA = explorer.getByRole('button', { name: 'Step cook A' })
  const stepB = explorer.getByRole('button', { name: 'Step cook B' })

  for (let i = 0; i < 3; i++) {
    await stepA.click()
    await stepB.click()
  }
  await expect(explorer.getByRole('status')).toContainText('One update was lost')
  await expect(explorer.getByTestId('shared')).toHaveText('1')

  await explorer.getByLabel('Use a lock').check()
  await stepA.click()
  await expect(explorer.getByRole('button', { name: 'Waiting for the lock' })).toBeDisabled()
  await explorer.getByRole('button', { name: 'Interleave' }).click()
  await expect(explorer.getByRole('status')).toContainText('Both updates counted')
})

test('Otto answers questions in readable text', async ({ page }) => {
  await page.goto('/workshop/04-deadlock')
  await page.getByRole('button', { name: 'Ask Otto' }).click()
  const panel = page.getByRole('region', { name: "Otto's station notes" })
  await expect(panel).toContainText('Nobody crashed')

  await panel.getByRole('button', { name: 'Are timeouts on locks enough?' }).click()
  const answer = panel.getByText('Lock ordering does.')
  await expect(answer).toBeVisible()
  // The answer is dark text on a light panel, never light on light.
  const colours = await answer.evaluate((node) => {
    const style = getComputedStyle(node)
    const box = getComputedStyle(node.closest('section') as Element)
    return { text: style.color, panel: box.backgroundColor }
  })
  expect(colours).toEqual({ text: 'rgb(59, 68, 82)', panel: 'rgb(255, 255, 255)' })

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
})

test('chapters page through in order', async ({ page }) => {
  await page.goto('/workshop')
  await expect(page.locator('main ol > li')).toHaveCount(8)

  await page.locator('main ol > li').nth(3).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Deadlock')
  await expect(page.locator('main')).toContainText('dishes made: 0 of 100')
  await page.getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/05-queues$/)
})

test('nothing scrolls sideways', async ({ page }) => {
  for (const path of ['/', '/workshop', '/workshop/06-the-event-loop']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('back to top returns to the top', async ({ page }) => {
  await page.goto('/workshop/08-timeouts-and-cancellation')
  await page.evaluate(() => window.scrollTo(0, 3000))
  const button = page.getByRole('button', { name: 'Back to top' })

  await expect(button).toBeVisible()
  await button.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
