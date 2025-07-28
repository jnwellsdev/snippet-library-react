import React from 'react'
import { Flex, Text, Button, Card, Heading } from '@radix-ui/themes'
import { ExclamationTriangleIcon, ReloadIcon, GlobeIcon } from '@radix-ui/react-icons'
import './NetworkError.css'

const NetworkError = ({ 
  onRetry, 
  message,
  variant = 'default',
  className = ''
}) => {
  const defaultMessage = 'Unable to connect to the server. Please check your internet connection and try again.'

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  if (variant === 'inline') {
    return (
      <Flex 
        align="center" 
        gap="3" 
        className={`network-error network-error-inline ${className}`}
        role="alert"
      >
        <GlobeIcon className="network-error-icon" width="16" height="16" />
        <Text size="2" className="network-error-text">
          {message || 'Connection error'}
        </Text>
        <Button
          size="1"
          variant="ghost"
          onClick={handleRetry}
          className="network-error-retry"
        >
          <ReloadIcon width="14" height="14" />
        </Button>
      </Flex>
    )
  }

  return (
    <div className={`network-error ${className}`}>
      <Card className="network-error-card">
        <Flex direction="column" align="center" gap="4">
          <div className="network-error-icon-wrapper">
            <GlobeIcon 
              className="network-error-icon-large" 
              width="32" 
              height="32" 
            />
            <ExclamationTriangleIcon 
              className="network-error-warning" 
              width="16" 
              height="16" 
            />
          </div>
          
          <Heading size="4" className="network-error-title">
            Connection Problem
          </Heading>
          
          <Text 
            size="2" 
            color="gray" 
            align="center" 
            className="network-error-message"
          >
            {message || defaultMessage}
          </Text>

          <Flex gap="3" className="network-error-actions">
            <Button 
              variant="solid" 
              onClick={handleRetry}
              className="network-error-retry-button"
            >
              <ReloadIcon width="16" height="16" />
              Try Again
            </Button>
          </Flex>

          <Text size="1" color="gray" className="network-error-help">
            If the problem persists, please check your internet connection or try again later.
          </Text>
        </Flex>
      </Card>
    </div>
  )
}

export default NetworkError