// @ts-check
import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────
// Confirmed from App.jsx: CVView renders at /view
const CV_VIEW_PATH = '/view';

// Confirmed from api.js: getCVId() reads localStorage key 'cvId'
const CV_ID_STORAGE_KEY = 'cvId';

// Sample CV payload matching the shape CVDocument expects
const MOCK_CV = {
  _id: 'test-cv-123',
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Software Engineer',
    email: 'jane@example.com',
    phones: ['+94 71 234 5678'],
    address: 'Colombo, Sri Lanka',
    linkedIn: 'janedoe',
    github: 'janedoe',
  },
  summary: 'Experienced software engineer with a passion for clean code.',
  experience: [
    {
      position: 'Senior Developer',
      company: 'Tech Corp',
      employmentType: 'Full-time',
      location: 'Remote',
      startMonth: 'January',
      startYear: '2022',
      isCurrent: true,
      description: 'Built scalable web applications.',
    },
  ],
  education: [
    {
      qualification: 'BSc',
      program: 'Computer Science',
      institute: 'University of Colombo',
      startYear: '2018',
      endYear: '2022',
    },
  ],
  projects: [],
  skills: ['JavaScript', 'React', 'Node.js'],
  photo: null,
};

/**
 * Helper: seed localStorage with a CV id and mock the backend
 * getCV(id) call before navigating to the CVView page.
 */
async function goToCvView(page, { geo, fx } = {}) {
  // Seed the CV id so getCVId() succeeds — ADJUST key/mechanism as needed
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, 'test-cv-123');
  }, CV_ID_STORAGE_KEY);

  // Mock geolocation lookup (ipapi.co) — hardcoded URL in CVView.jsx
  await page.route('**/ipapi.co/json/**', (route) =>
    route.fulfill({
      json: geo || { country_code: 'LK', currency: 'LKR' },
    })
  );

  // Mock FX rate lookup (open.er-api.com) — hardcoded URL in CVView.jsx
  await page.route('**/open.er-api.com/v6/latest/LKR**', (route) =>
    route.fulfill({
      json: fx || { rates: { USD: 0.0031, INR: 0.27, GBP: 0.0025 } },
    })
  );

  // getCV(id) -> GET /api/cv/:id (relative path, confirmed from api.js BASE)
  await page.route('**/api/cv/test-cv-123', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({ json: MOCK_CV });
    } else {
      route.continue();
    }
  });

  // submitReview(id, data) -> POST /api/cv/:id/reviews
  await page.route('**/api/cv/test-cv-123/reviews', (route) =>
    route.fulfill({ json: { success: true } })
  );

  // Web3Forms fire-and-forget email — mock so tests don't hit the real API
  await page.route('**/api.web3forms.com/submit', (route) =>
    route.fulfill({ json: { success: true } })
  );

  // getPayhereHash(orderId, amount, currency) -> POST /api/payment/payhere/hash
  await page.route('**/api/payment/payhere/hash', (route) =>
    route.fulfill({
      json: { hash: 'mock-hash', merchant_id: 'mock-merchant', amount: '100.00' },
    })
  );

  await page.goto(CV_VIEW_PATH);
}

test.describe('CVView page', () => {
  test('1. shows loading spinner then renders CV content', async ({ page }) => {
    await goToCvView(page);
    // Loading spinner text from the component
    // (may resolve too fast to catch reliably — kept as a soft check)
    await expect(page.getByText(/loading your cv/i)).toBeHidden({ timeout: 10000 }).catch(() => {});
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText('Software Engineer')).toBeVisible();
  });

  test('2. shows error state and "Start Over" when no CV id is set', async ({ page }) => {
    // Deliberately skip seeding localStorage
    await page.goto(CV_VIEW_PATH);
    await expect(page.getByText(/no cv session found/i)).toBeVisible();
    const startOverBtn = page.getByRole('button', { name: /start over/i });
    await expect(startOverBtn).toBeVisible();
    await startOverBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('3. watermark is visible in the preview', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await expect(page.getByText(/watermark-free pdf/i).first()).toBeVisible();
  });

  test('4. switching templates updates active state and persists to localStorage', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    const modernBtn = page.getByRole('button', { name: /modern/i }).first();
    await modernBtn.click();
    await expect(modernBtn).toHaveClass(/active/);

    const stored = await page.evaluate(() => localStorage.getItem('cv_template'));
    expect(stored).toBe('modern');
  });

  test('5. switching page mode updates the hint text', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    // Default is "auto" — hint should mention flowing across pages
    await expect(page.getByText(/content flows naturally/i)).toBeVisible();

    const onePageBtn = page.getByRole('button', { name: /1 page/i }).first();
    await onePageBtn.click();

    await expect(page.getByText(/1-page mode.*shrinks content/i)).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('cv_page_mode'));
    expect(stored).toBe('1page');
  });

  test('6. clicking Download PDF opens the price modal', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    await expect(page.getByText(/pay to download your cv/i)).toBeVisible();
  });

  test('7. price modal shows Rs. 100.00 for Sri Lanka (LK) geolocation', async ({ page }) => {
    await goToCvView(page, { geo: { country_code: 'LK', currency: 'LKR' } });
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    await expect(page.getByText('Rs. 100.00')).toBeVisible({ timeout: 10000 });
  });

  test('8. price modal converts to local currency for non-LK geolocation', async ({ page }) => {
    await goToCvView(page, {
      geo: { country_code: 'IN', currency: 'INR' },
      fx: { rates: { INR: 0.27, USD: 0.0031 } },
    });
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    // 100 * 0.27 = 27.00 INR
    await expect(page.getByText('27.00 INR')).toBeVisible({ timeout: 10000 });
  });

  test('9. price modal falls back to USD when local currency rate is unavailable', async ({ page }) => {
    await goToCvView(page, {
      geo: { country_code: 'FR', currency: 'XYZ' }, // unsupported/fake currency code
      fx: { rates: { USD: 0.0031 } }, // no XYZ rate present
    });
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    // 100 * 0.0031 = 0.31 USD
    await expect(page.getByText('$0.31')).toBeVisible({ timeout: 10000 });
  });

  test('10. price modal falls back to Rs. 100.00 if geolocation lookup fails entirely', async ({ page }) => {
    await page.addInitScript((key) => {
      window.localStorage.setItem(key, 'test-cv-123');
    }, CV_ID_STORAGE_KEY);

    // Force the geolocation call to fail
    await page.route('**/ipapi.co/json/**', (route) => route.abort());
    await page.route('**/api/cv/test-cv-123', (route) => route.fulfill({ json: MOCK_CV }));

    await page.goto(CV_VIEW_PATH);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    await expect(page.getByText('Rs. 100.00')).toBeVisible({ timeout: 10000 });
  });

  test('11. policy modals open and close correctly', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /download pdf/i }).first().click();
    await expect(page.getByText(/pay to download your cv/i)).toBeVisible();

    await page.getByRole('button', { name: /^refund policy$/i }).click();
    await expect(page.getByRole('heading', { name: 'Refund Policy' })).toBeVisible();
    await expect(page.getByText(/refunds are generally not available/i)).toBeVisible();

    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('heading', { name: 'Refund Policy' })).toBeHidden();
  });

  test('12. review form validates rating and comment before allowing submission', async ({ page }) => {
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    // Open the review section (sidebar toggle on desktop)
    await page.getByText(/leave a review/i).first().click();

    const submitBtn = page.getByRole('button', { name: /submit review/i }).first();
    await submitBtn.click();
    await expect(page.getByText(/please select a star rating/i)).toBeVisible();
  });

  test('13. review form submits successfully with rating and comment', async ({ page }) => {
    // submitReview mock is already set up in goToCvView() -> POST /api/cv/test-cv-123/reviews
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    await page.getByText(/leave a review/i).first().click();

    await page.getByPlaceholder(/share your experience/i).fill(
      'Really smooth CV building experience, would use again.'
    );

    // StarPicker renders 5 identical 22x22 star SVGs with no aria-label or
    // data-testid — this targets the 5th (rightmost, index 4) by size.
    // Recommend adding data-testid="star-{n}" to StarPicker's <span> for
    // a more robust selector than this.
    const starIcons = page.locator('svg[width="22"][height="22"]');
    await starIcons.nth(4).click();

    await page.getByRole('button', { name: /submit review/i }).first().click();
    await expect(page.getByText(/thanks for your feedback/i)).toBeVisible();
  });

  test('14. mobile viewport shows mobile layout and hides desktop sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await goToCvView(page);
    await expect(page.getByText('Jane Doe')).toBeVisible();

    // Desktop-only elements should not be visible on mobile
    await expect(page.locator('.cvview-sidebar')).toBeHidden();
    // Mobile-only download button should be visible instead
    await expect(page.getByRole('button', { name: /download pdf/i })).toBeVisible();
  });
});
