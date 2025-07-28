import './LoadingSpinner.css'

/**
 * LoadingSpinner component for displaying loading states
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {string} props.color - Color theme ('primary', 'secondary', 'white')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.text - Optional text to display below spinner
 * @param {boolean} props.inline - Whether to display inline or as block
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '', 
  text = '',
  inline = false 
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${color}`,
    inline ? 'loading-spinner--inline' : '',
    className
  ].filter(Boolean).join(' ')

  const containerClasses = [
    'loading-spinner-container',
    inline ? 'loading-spinner-container--inline' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses} data-testid="loading-spinner">
      <div className={spinnerClasses} aria-label="Loading" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <div className="loading-spinner-text" data-testid="loading-text">
          {text}
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner