export function LoginPage() {
	return (
		<div className='space-y-6'>
			<div className='text-center'>
				<h1 className='text-2xl font-bold text-foreground'>ورود به اسمارتیز</h1>
				<p className='mt-2 text-muted-foreground'>
					شماره موبایل خود را وارد کنید
				</p>
			</div>
			<div className='space-y-4'>
				<input
					type='tel'
					dir='ltr'
					placeholder='09123456789'
					className='w-full rounded-lg border border-input bg-background px-4 py-3 text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
				/>
				<button className='w-full rounded-lg bg-primary py-3 text-primary-foreground hover:opacity-90'>
					دریافت کد تایید
				</button>
			</div>
		</div>
	)
}
