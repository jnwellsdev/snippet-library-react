import React from 'react'
import { Button, Flex, Text, Card, Heading } from '@radix-ui/themes'
import { ExclamationTriangleIcon, ReloadIcon } from '@radix-ui/react-icons'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Report error to monitoring service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
    
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <Card className="error-boundary-card">
            <Flex direction="column" align="center" gap="4">
              <ExclamationTriangleIcon 
                className="error-boundary-icon" 
                width="48" 
                height="48" 
              />
              
              <Heading size="6" className="error-boundary-title">
                Something went wrong
              </Heading>
              
              <Text 
                size="3" 
                color="gray" 
                align="center" 
                className="error-boundary-message"
              >
                {this.props.message || 
                  'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'
                }
              </Text>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-boundary-details">
                  <summary>Error Details (Development)</summary>
                  <pre className="error-boundary-stack">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <Flex gap="3" className="error-boundary-actions">
                <Button 
                  variant="soft" 
                  onClick={this.handleRetry}
                  className="error-boundary-retry"
                >
                  <ReloadIcon width="16" height="16" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReload}
                  className="error-boundary-reload"
                >
                  Reload Page
                </Button>
              </Flex>
            </Flex>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary