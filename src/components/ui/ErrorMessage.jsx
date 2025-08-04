import React from 'react'
import { Flex, Text, Button, Card } from '@radix-ui/themes'
import { ExclamationTriangleIcon, Cross2Icon, ReloadIcon } from '@radix-ui/react-icons'
import './ErrorMessage.css'

const ErrorMessage = ({ error, message, onDismiss, onRetry, variant = 'default', className = '', showIcon = true, dismissible = true, retryable = false }) => {
	// Extract user-friendly message from error
	const getErrorMessage = () => {
		if (message) return message

		if (typeof error === 'string') return error

		if (error?.message) {
			if (error.message.includes('network')) {
				return 'Network error. Please check your connection and try again.'
			}
			if (error.message.includes('permission')) {
				return "You don't have permission to perform this action."
			}
			if (error.message.includes('not-found')) {
				return 'The requested item could not be found.'
			}
			return error.message
		}

		return 'An unexpected error occurred. Please try again.'
	}

	const errorMessage = getErrorMessage()

	const getVariantStyles = () => {
		switch (variant) {
			case 'inline':
				return 'error-message-inline'
			case 'banner':
				return 'error-message-banner'
			case 'card':
				return 'error-message-card'
			default:
				return 'error-message-default'
		}
	}

	const content = (
		<Flex align='center' gap='3' className={`error-message ${getVariantStyles()} ${className}`} role='alert' aria-live='polite'>
			{showIcon && <ExclamationTriangleIcon className='error-message-icon' width='16' height='16' />}

			<Text size='2' className='error-message-text' style={{ flex: 1 }}>
				{errorMessage}
			</Text>

			<Flex gap='2' className='error-message-actions'>
				{retryable && onRetry && (
					<Button size='1' variant='ghost' onClick={onRetry} className='error-message-retry' aria-label='Retry action'>
						<ReloadIcon width='14' height='14' />
					</Button>
				)}

				{dismissible && onDismiss && (
					<Button size='1' variant='ghost' onClick={onDismiss} className='error-message-dismiss' aria-label='Dismiss error'>
						<Cross2Icon width='14' height='14' />
					</Button>
				)}
			</Flex>
		</Flex>
	)

	if (variant === 'card') {
		return <Card className='error-message-card-wrapper'>{content}</Card>
	}

	return content
}

export default ErrorMessage
