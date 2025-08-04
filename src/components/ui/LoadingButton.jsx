import LoadingSpinner from './LoadingSpinner'
import './LoadingButton.css'

const LoadingButton = ({ loading = false, loadingText = 'Loading...', children, disabled = false, variant = 'primary', size = 'medium', className = '', onClick, type = 'button', ...props }) => {
	const buttonClasses = ['loading-button', `loading-button--${variant}`, `loading-button--${size}`, loading ? 'loading-button--loading' : '', className].filter(Boolean).join(' ')

	const isDisabled = disabled || loading

	const getSpinnerColor = () => {
		if (variant === 'secondary') return 'secondary'
		return 'white'
	}

	return (
		<button type={type} className={buttonClasses} disabled={isDisabled} onClick={onClick} aria-disabled={isDisabled} data-testid='loading-button' {...props}>
			{loading ? (
				<div className='loading-button-content'>
					<LoadingSpinner size='small' color={getSpinnerColor()} inline />
					<span>{loadingText}</span>
				</div>
			) : (
				children
			)}
		</button>
	)
}

export default LoadingButton
