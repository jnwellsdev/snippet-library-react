import './LoadingCard.css'

/**
 * LoadingCard component for skeleton loading states
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton cards to render
 * @param {string} props.variant - Card variant ('snippet', 'list', 'detail')
 * @param {string} props.className - Additional CSS classes
 */
const LoadingCard = ({ count = 1, variant = 'snippet', className = '' }) => {
  const cards = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`loading-card loading-card--${variant} ${className}`}
    >
      {variant === 'snippet' && (
        <>
          <div className="loading-card-header">
            <div className="skeleton skeleton--title"></div>
            <div className="skeleton skeleton--actions"></div>
          </div>
          <div className="loading-card-content">
            <div className="skeleton skeleton--preview-text"></div>
          </div>
          <div className="loading-card-footer">
            <div className="skeleton skeleton--author"></div>
            <div className="skeleton skeleton--date"></div>
          </div>
        </>
      )}

      {variant === 'list' && (
        <>
          <div className="skeleton skeleton--list-title"></div>
          <div className="skeleton skeleton--list-content"></div>
          <div className="skeleton skeleton--list-meta"></div>
        </>
      )}

      {variant === 'detail' && (
        <>
          <div className="loading-card-detail-header">
            <div className="skeleton skeleton--detail-title"></div>
            <div className="skeleton skeleton--detail-meta"></div>
          </div>
          <div className="loading-card-detail-content">
            <div className="skeleton skeleton--detail-code"></div>
            <div className="skeleton skeleton--detail-preview"></div>
          </div>
          <div className="loading-card-detail-actions">
            <div className="skeleton skeleton--button"></div>
            <div className="skeleton skeleton--button"></div>
          </div>
        </>
      )}
    </div>
  ))

  return count === 1 ? (
    cards[0]
  ) : (
    <div className="loading-cards-container">{cards}</div>
  )
}

export default LoadingCard
