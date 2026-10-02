import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'instagram-image-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url.startsWith('/api/image-proxy')) {
            const urlObj = new URL(req.url, `http://${req.headers.host}`);
            const targetUrl = urlObj.searchParams.get('url');

            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url query parameter');
              return;
            }

            try {
              const fetchResponse = await fetch(targetUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                  'Accept-Language': 'en-US,en;q=0.9',
                  'Sec-Fetch-Dest': 'image',
                  'Sec-Fetch-Mode': 'no-cors',
                  'Sec-Fetch-Site': 'cross-site'
                }
              });

              if (!fetchResponse.ok) {
                throw new Error(`Failed to fetch image: HTTP ${fetchResponse.status}`);
              }

              const contentType = fetchResponse.headers.get('content-type') || 'image/jpeg';
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'public, max-age=86400');

              const arrayBuffer = await fetchResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              res.end(buffer);

            } catch (err) {
              res.statusCode = 500;
              res.end(`Proxy Error: ${err.message}`);
            }
            return;
          }
          next();
        });
      }
    }
  ],
})
