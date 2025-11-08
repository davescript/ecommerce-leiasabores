import { defineConfig, devices } from '@playwright/test'
import path from 'path'

/**
 * Configuração do Playwright para testes E2E do Admin Panel
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para cada teste (aumentado para ambiente Cloudflare)
  timeout: 60 * 1000, // 60 segundos
  
  // Timeout para expect (assertions)
  expect: {
    timeout: 10 * 1000, // 10 segundos
  },
  
  // Rodar testes em paralelo
  fullyParallel: true,
  
  // Falhar o build se houver testes falhos no CI
  forbidOnly: !!process.env.CI,
  
  // Retry apenas no CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers para testes paralelos
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Configurações compartilhadas para todos os projetos
  use: {
    // Base URL para testes
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173',
    
    // API Base URL
    // eslint-disable-next-line @typescript-eslint/naming-convention
    API_BASE_URL: process.env.PLAYWRIGHT_API_URL || 'https://api.leiasabores.pt/api',
    
    // Trace on retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 15 * 1000, // 15 segundos
    
    // Navigation timeout
    navigationTimeout: 30 * 1000, // 30 segundos
  },

  // Configurar projetos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Servidor web para desenvolvimento
  webServer: {
    command: 'npm run dev:frontend',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutos
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
    },
  },
})

