import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CSV Analysis Flow', () => {
  test('should upload CSV and display analysis', async ({ page }) => {
    // Navigate to analyze page
    await page.goto('/analyze');
    
    // Wait for page to load
    await expect(page.getByText('CSV Token Analyzer')).toBeVisible();
    
    // Create test CSV content
    const csvContent = `model,input_tokens,output_tokens,cost
gpt-4,1500,500,0.06
gpt-3.5-turbo,2000,1000,0.004
claude-3-opus,3000,1500,0.09`;
    
    // Create file input
    const buffer = Buffer.from(csvContent);
    const file = {
      name: 'test-analysis.csv',
      mimeType: 'text/csv',
      buffer: buffer
    };
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(file);
    
    // Wait for analysis to complete
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 10000 });
    
    // Verify key metrics are displayed
    await expect(page.getByText(/Total Cost/)).toBeVisible();
    await expect(page.getByText(/Total Tokens/)).toBeVisible();
    
    // Verify recommendations are shown
    await expect(page.getByText(/Recommendations/i)).toBeVisible();
  });

  test('should handle large CSV files', async ({ page }) => {
    await page.goto('/analyze');
    
    // Generate large CSV (1000 rows)
    const rows = ['model,input_tokens,output_tokens,cost'];
    for (let i = 0; i < 1000; i++) {
      rows.push(`gpt-4,${1000 + i},${500 + i},${0.05 + i * 0.001}`);
    }
    const csvContent = rows.join('\n');
    
    const buffer = Buffer.from(csvContent);
    const file = {
      name: 'large-test.csv',
      mimeType: 'text/csv',
      buffer: buffer
    };
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(file);
    
    // Should complete within reasonable time
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 15000 });
    
    // Verify performance metrics
    await expect(page.getByText(/rows analyzed/i)).toContainText('1000');
  });

  test('should show compression savings with LLMLingua', async ({ page }) => {
    await page.goto('/analyze');
    
    // CSV with long prompts that can be compressed
    const csvContent = `model,prompt,tokens,cost
gpt-4,"This is a very long prompt with lots of redundant information that could be compressed. The prompt contains many repeated phrases and unnecessary verbose explanations that LLMLingua can optimize.",500,0.02
gpt-4,"Another verbose prompt with excessive detail and repetition that doesn't add value to the actual query being made to the language model.",450,0.018`;
    
    const buffer = Buffer.from(csvContent);
    const file = {
      name: 'compression-test.csv',
      mimeType: 'text/csv',
      buffer: buffer
    };
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(file);
    
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 10000 });
    
    // Should show compression opportunities
    await expect(page.getByText(/Compression Potential/i)).toBeVisible();
    await expect(page.getByText(/could save/i)).toBeVisible();
  });

  test('should detect PII and show warnings', async ({ page }) => {
    await page.goto('/analyze');
    
    // CSV with PII data
    const csvContent = `model,prompt,tokens,cost
gpt-4,"Process payment for John Doe SSN 555-55-5555",100,0.004
gpt-4,"Email jane@example.com about credit card 4111-1111-1111-1111",120,0.005`;
    
    const buffer = Buffer.from(csvContent);
    const file = {
      name: 'pii-test.csv',
      mimeType: 'text/csv',
      buffer: buffer
    };
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(file);
    
    await expect(page.getByText('Analysis Results')).toBeVisible({ timeout: 10000 });
    
    // Should show PII warning
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/PII detected/i)).toBeVisible();
    await expect(page.getByText(/SSN|Social Security|Credit Card/i)).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should require login to access analysis', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto('/analyze');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login|\/auth/);
    await expect(page.getByText(/Sign in|Login/i)).toBeVisible();
  });
  
  test('should handle API key management', async ({ page }) => {
    // Assume logged in state
    await page.goto('/settings');
    
    // Look for API key section
    await expect(page.getByText(/API Keys/i)).toBeVisible();
    
    // Test adding an API key
    await page.getByRole('button', { name: /Add.*Key/i }).click();
    await page.getByLabel(/Provider/i).selectOption('openai');
    await page.getByLabel(/Key/i).fill('sk-test-key-123');
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Verify key was added (should be masked)
    await expect(page.getByText(/sk-\*\*\*/)).toBeVisible();
  });
});