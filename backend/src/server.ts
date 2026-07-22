import { loadEnvFile } from 'node:process';

try {
  loadEnvFile();
} catch {
  // Production injects environment variables without a local .env file.
}

// Import the application only after local environment variables are available.
// Supabase clients are created while the imported modules are evaluated.
const { createApp } = await import('./app.ts');

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`Future Studio API running at http://localhost:${port}`);
});
