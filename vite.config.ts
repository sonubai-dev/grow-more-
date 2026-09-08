import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const resendApiKey = env.RESEND_API_KEY || '';
  const resendFromEmail = env.RESEND_FROM_EMAIL || 'ZellonAI <onboarding@resend.dev>';

  const resendEmailPlugin = {
    name: 'resend-email-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/send-email', (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}');
            const toRecipients = Array.isArray(payload.to) ? payload.to : [payload.to];

            const response = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: payload.from || resendFromEmail,
                to: toRecipients,
                subject: payload.subject || 'ZellonAI Notification',
                html: payload.html || '<p>ZellonAI Notification</p>',
              }),
            });

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.status;
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      });
    },
  };

  return {
    plugins: [react(), tailwindcss(), resendEmailPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-recharts': ['recharts'],
            'vendor-icons': ['lucide-react'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});
