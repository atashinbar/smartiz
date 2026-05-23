import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: 'prompt',
			includeAssets: ['icons/*.png'],
			devOptions: {
				enabled: true,
				type: 'module',
			},
			manifest: {
				name: 'اسمارتیز - پلتفرم آموزش هوشمند',
				short_name: 'Smartiz',
				description: 'پلتفرم آموزش هوشمند اسمارتیز',
				theme_color: '#6366f1',
				background_color: '#ffffff',
				display: 'standalone',
				orientation: 'portrait',
				dir: 'rtl',
				lang: 'fa',
				start_url: '/',
				scope: '/',
				icons: [
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/icons/icon-maskable-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/icons/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				skipWaiting: true,
				clientsClaim: true,
				globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
				runtimeCaching: [
					{
						urlPattern: /^https?:\/\/.*\/api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'api-cache',
							expiration: { maxEntries: 50, maxAgeSeconds: 300 },
							networkTimeoutSeconds: 10
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
							},
							cacheableResponse: { statuses: [0, 200] }
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365
							},
							cacheableResponse: { statuses: [0, 200] }
						}
					}
				]
			}
		})
	],
	server: {
		port: 9090,
		proxy: {
			'/api': { target: 'http://localhost:8585', changeOrigin: true }
		}
	},
	preview: {
		port: 9090
	}
})
