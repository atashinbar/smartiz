import { useRegisterSW } from 'virtual:pwa-register/react'

export function PWAUpdateNotification() {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (registration) {
				setInterval(() => registration.update(), 60 * 60 * 1000)
			}
		}
	})

	if (!needRefresh) return null

	return (
		<div className='fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80'>
			<p className='mb-3 text-sm text-foreground'>
				نسخه جدیدی از اسمارتیز در دسترس است
			</p>
			<div className='flex gap-2'>
				<button
					onClick={() => updateServiceWorker(true)}
					className='rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground'>
					بروزرسانی
				</button>
				<button
					onClick={() => setNeedRefresh(false)}
					className='rounded-md border border-border px-3 py-1.5 text-sm text-foreground'>
					بعداً
				</button>
			</div>
		</div>
	)
}
