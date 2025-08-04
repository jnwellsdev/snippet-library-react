import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as Form from '@radix-ui/react-form'
import { Button, Card, Text, Flex, TextField } from '@radix-ui/themes'
import { LoadingButton } from '../index'
import './LoginForm.css'

const LoginForm = ({ onSuccess }) => {
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [linkSent, setLinkSent] = useState(false)
	const { login, error, clearError } = useAuth()

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!email.trim()) return

		setIsSubmitting(true)
		clearError()

		try {
			await login(email.trim())
			setLinkSent(true)
			if (onSuccess) {
				onSuccess()
			}
		} catch (error) {
			console.error('Login error:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleEmailChange = (e) => {
		setEmail(e.target.value)
		if (error) {
			clearError()
		}
	}

	if (linkSent) {
		return (
			<Card className='login-card' style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
				<Flex direction='column' gap='4' align='center'>
					<Text size='5' weight='bold' align='center'>
						Check Your Email
					</Text>
					<Text size='3' align='center' color='gray'>
						We've sent a magic link to <strong>{email}</strong>. Click the link in your email to sign in.
					</Text>
					<Button
						variant='soft'
						onClick={() => {
							setLinkSent(false)
							setEmail('')
						}}
					>
						Send Another Link
					</Button>
				</Flex>
			</Card>
		)
	}

	return (
		<Card className='login-card' style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
			<Form.Root onSubmit={handleSubmit}>
				<Flex direction='column' gap='4'>
					<Text size='5' weight='bold' align='center'>
						Sign In
					</Text>

					<Text size='3' align='center' color='gray'>
						Enter your email to receive a magic link
					</Text>

					<Form.Field name='email'>
						<Flex direction='column' gap='2'>
							<Form.Label>
								<Text size='2' weight='medium'>
									Email
								</Text>
							</Form.Label>
							<Form.Control asChild>
								<TextField.Input type='email' placeholder='Enter your email' value={email} onChange={handleEmailChange} required disabled={isSubmitting} />
							</Form.Control>
							<Form.Message match='valueMissing'>
								<Text size='2' color='red'>
									Please enter your email
								</Text>
							</Form.Message>
							<Form.Message match='typeMismatch'>
								<Text size='2' color='red'>
									Please enter a valid email
								</Text>
							</Form.Message>
						</Flex>
					</Form.Field>

					{error && (
						<Text size='2' color='red' align='center'>
							{error}
						</Text>
					)}

					<Form.Submit asChild>
						<LoadingButton size='large' loading={isSubmitting} loadingText='Sending...' disabled={!email.trim()} variant='primary'>
							Send Magic Link
						</LoadingButton>
					</Form.Submit>
				</Flex>
			</Form.Root>
		</Card>
	)
}

export default LoginForm
