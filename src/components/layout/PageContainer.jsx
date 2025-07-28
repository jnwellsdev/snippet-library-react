import './PageContainer.css'

/**
 * Consistent page wrapper component for styling and layout
 * Provides consistent padding, max-width, and responsive behavior
 */
function PageContainer({ 
  children, 
  className = '', 
  maxWidth = 'default',
  padding = 'default' 
}) {
  const containerClasses = [
    'page-container',
    `page-container--max-width-${maxWidth}`,
    `page-container--padding-${padding}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

export default PageContainer