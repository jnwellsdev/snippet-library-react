import LoadingSpinner from './LoadingSpinner'
import './LoadingButton.css'

/**
 * LoadingButton component with integrated loading state
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.loadingText - Text to show when loading
 * @param {string} props.children - Button content when not loading
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.variant - Button style variant ('primary', 'secondary', 'danger')
 * @param {string} props.size - Button size ('small', 'medium', 'large')
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {string} props.type - Button type
 */
const LoadingButton = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const buttonClasses = [
    'loading-button',
    `loading-button--${variant}`,
    `loading-button--${size}`,
    loading ? 'loading-button--loading' : '',
    className
  ].filter(Boolean).join(' ')

  const isDisabled = disabled || loading

  const getSpinnerColor = () => {
    if (variant === 'secondary') return 'secondary'
    return 'white'
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      aria-disabled={isDisabled}
      data-testid="loading-button"
      {...props}
    >
      {loading ? (
        <div className="loading-button-content">
          <LoadingSpinner 
            size="small" 
            color={getSpinnerColor()}
            inline 
          />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default LoadingButton