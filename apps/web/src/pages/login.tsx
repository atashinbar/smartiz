import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api.js'
import { useAuthStore } from '../stores/auth.js'
import {
	Button,
	Input,
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	Alert,
	AlertDescription
} from '@smartiz/ui'
import type { UserType } from '@smartiz/shared'

type Step = 'phone' | 'national-id' | 'otp'

export function LoginPage() {
	const navigate = useNavigate()
	const login = useAuthStore((s) => s.login)
	const { t } = useTranslation()

	const [step, setStep] = useState<Step>('phone')
	const [phone, setPhone] = useState('')
	const [nationalId, setNationalId] = useState('')
	const [otpCode, setOtpCode] = useState('')
	const [authenticationId, setAuthenticationId] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [countdown, setCountdown] = useState(0)

	useEffect(() => {
		if (countdown <= 0) return
		const timer = setInterval(() => setCountdown((s) => s - 1), 1000)
		return () => clearInterval(timer)
	}, [countdown])

	const formatCountdown = useCallback((seconds: number) => {
		const m = Math.floor(seconds / 60)
		const s = seconds % 60
		return `${m}:${s.toString().padStart(2, '0')}`
	}, [])

	const handleSubmitPhone = async () => {
		setError('')
		setLoading(true)
		try {
			const res = await api.post<{ exists: boolean }>('/auth/check-phone', {
				phone
			})
			if (res.data?.exists) {
				await sendOtp()
			} else {
				setStep('national-id')
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : t('login.checkPhoneError'))
		} finally {
			setLoading(false)
		}
	}

	const handleSubmitNationalId = async () => {
		setError('')
		if (!nationalId.trim()) {
			setError(t('login.nationalIdRequired'))
			return
		}
		setLoading(true)
		try {
			await sendOtp(nationalId.trim())
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : t('login.registerError'))
		} finally {
			setLoading(false)
		}
	}

	const sendOtp = async (nid?: string) => {
		const body: Record<string, string> = { phone }
		if (nid) body.nationalId = nid

		const res = await api.post<{
			authenticationId: string
			expiresInSeconds: number
		}>('/auth/request-otp', body)
		if (res.data) {
			setAuthenticationId(res.data.authenticationId)
			setCountdown(res.data.expiresInSeconds)
			setStep('otp')
			setOtpCode('')
		}
	}

	const handleResendOtp = async () => {
		setError('')
		setLoading(true)
		try {
			await sendOtp(nationalId || undefined)
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : t('login.resendError'))
		} finally {
			setLoading(false)
		}
	}

	const handleVerifyOtp = async () => {
		setError('')
		if (!otpCode || otpCode.length < 6) {
			setError(t('login.enterCode'))
			return
		}
		setLoading(true)
		try {
			const res = await api.post<{
				token: string
				user: {
					id: number
					phone: string
					name: string | null
					surname: string | null
					nationalId: string | null
					userType: UserType
					profileComplete: number
					isVerified: number
				}
			}>('/auth/verify-otp', {
				phone,
				code: otpCode,
				authenticationId
			})

			if (res.data) {
				login(res.data.user, res.data.token)
				navigate('/', { replace: true })
			}
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : t('login.invalidCode')
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	const renderStepContent = () => {
		if (step === 'phone') {
			return (
				<div className='space-y-4'>
					<Input
						type='tel'
						dir='ltr'
						placeholder='09123456789'
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className='text-center text-lg'
						autoFocus
					/>
					<Button
						loading={loading}
						onClick={handleSubmitPhone}
						variant='outline'>
						{t('login.getCode')}
					</Button>
				</div>
			)
		}

		if (step === 'national-id') {
			return (
				<div className='space-y-4'>
					<Input
						type='text'
						inputMode='numeric'
						dir='ltr'
						placeholder={t('login.nationalIdPlaceholder')}
						value={nationalId}
						onChange={(e) => setNationalId(e.target.value)}
						className='text-center text-lg'
						autoFocus
					/>
					<Button
						className='w-full'
						size='lg'
						loading={loading}
						onClick={handleSubmitNationalId}>
						{t('login.registerAndGetCode')}
					</Button>
					<Button
						variant='ghost'
						className='w-full'
						onClick={() => {
							setStep('phone')
							setError('')
						}}>
						{t('login.back')}
					</Button>
				</div>
			)
		}

		return (
			<div className='space-y-4'>
				<div className='flex justify-center' dir='ltr'>
					<InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
						<InputOTPGroup>
							<InputOTPSlot index={0} />
							<InputOTPSlot index={1} />
							<InputOTPSlot index={2} />
							<InputOTPSlot index={3} />
							<InputOTPSlot index={4} />
							<InputOTPSlot index={5} />
						</InputOTPGroup>
					</InputOTP>
				</div>
				<Button
					className='w-full'
					size='lg'
					loading={loading}
					onClick={handleVerifyOtp}>
					{t('login.verify')}
				</Button>
				<div className='text-center text-sm text-muted-foreground'>
					{countdown > 0 ? (
						<span>{t('login.resendUntil', { time: formatCountdown(countdown) })}</span>
					) : (
						<Button
							variant='link'
							size='sm'
							onClick={handleResendOtp}
							loading={loading}>
							{t('login.resendCode')}
						</Button>
					)}
				</div>
				<Button
					variant='ghost'
					className='w-full'
					onClick={() => {
						setStep('phone')
						setError('')
						setCountdown(0)
					}}>
					{t('login.changePhone')}
				</Button>
			</div>
		)
	}

	return (
		<Card className='border-0 shadow-none md:border md:shadow-sm'>
			<CardHeader className='text-center'>
				<CardTitle className='text-2xl'>
					{step === 'phone' && t('login.title')}
					{step === 'national-id' && t('login.registerTitle')}
					{step === 'otp' && t('login.verifyTitle')}
				</CardTitle>
				<CardDescription>
					{step === 'phone' && t('login.phonePlaceholder')}
					{step === 'national-id' && t('login.enterNationalId')}
					{step === 'otp' && t('login.verifyDescription', { phone })}
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				{error && (
					<Alert variant='destructive'>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{renderStepContent()}
			</CardContent>
		</Card>
	)
}
