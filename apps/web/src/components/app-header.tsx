import { StatusDropdown } from './status-dropdown.js'

export function AppHeader() {
	return (
		<header className='sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4'>
			<span className='text-lg font-bold text-primary'>اسمارتیز</span>
			<div className='flex items-center gap-1'>
				<StatusDropdown />
			</div>
		</header>
	)
}
