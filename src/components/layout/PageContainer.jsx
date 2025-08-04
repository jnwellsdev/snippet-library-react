import './PageContainer.css'

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