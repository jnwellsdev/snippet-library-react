import { useEffect, useRef, useState } from 'react'
import './SnippetPreview.css'

// <link rel="stylesheet" href="/preview/navigation.css" />
// <link rel="stylesheet" href="/preview/bannerManager.css" />
// <link rel="stylesheet" href="/preview/homepageSearchWidgetCosmos.css" />

// <script src="/preview/dealerOnLeadsBundle.js"></script>
// <script src="/preview/do_utility.min.js"></script>
// <script src="/preview/coreBundle.js"></script>
// <script src="/preview/bannerManager.min.js"></script>
// <script src="/preview/personalization.js" async defer>

// Predefined CSS and JavaScript stack to inject into previews
const INJECTED_STYLES = `
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<link rel="preload" href="/preview/fontawesome-webfont.woff2" as="font" type="font/woff2" crossorigin />
<link rel="stylesheet" href="/preview/bootstrap.min.css" />
<link rel="stylesheet" href="/preview/main.css" />
<link rel="stylesheet" href="/preview/extend.css" />
<link rel="stylesheet" href="/preview/layout.css" />
<link rel="stylesheet" href="/preview/common.css" />
<link rel="stylesheet" href="/preview/menu.css" />
<link rel="stylesheet" href="/preview/header.css" />
<link rel="stylesheet" href="/preview/font-awesome.min.css" />
<link rel="stylesheet" href="/preview/fonts.css" />
<style>
body {  margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; background: #f2eef5; } }
* { box-sizing: border-box; }
a {text-decoration: none; }
.btn-lg { padding: 12px 16px; }
:root {
    --cta-background-color: #888;
    --cta-font-color: #fff;
    --cta-hover-color: #999;
    --main-color: #555;
}
.btn-primary {
  background-color: var(--cta-background-color);
  border-color: var(--cta-background-color);
}
.btn-primary:hover {
  background-color:  var(--cta-hover-color);
  border-color:  var(--cta-hover-color);
}
</style>
`

const INJECTED_SCRIPTS = `
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/preview/ua-parser.min.js"></script>
<script src="/preview/dealeron.js"></script>
<script src="/preview/dealeron.static.min.js"></script>
<script src="/preview/bootstrap.min.js"></script>
<script src="/preview/modernizr.min.js"></script>
<script src="/preview/jquery.validate.min.js"></script>
<script>
// Prevent link navigation while preserving other interactions
document.addEventListener('DOMContentLoaded', function() {
  // Disable all link navigation
  document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      e.preventDefault();
      return false;
    }
  }, true);
  
  // Also prevent form submissions that might navigate
  document.addEventListener('submit', function(e) {
    e.preventDefault();
    return false;
  }, true);
});
</script>
`

const SnippetPreview = ({ htmlContent, className = '', height = 300 }) => {
	const iframeRef = useRef(null)
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)

	useEffect(() => {
		if (!iframeRef.current || !htmlContent) return

		setIsLoading(true)
		setHasError(false)

		try {
			const iframe = iframeRef.current
			const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

			// Create the complete HTML document with injected styles and scripts
			const fullHtml = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Snippet Preview</title>
          ${INJECTED_STYLES}
        </head>
        <body>
          ${htmlContent}
          ${INJECTED_SCRIPTS}
        </body>
        </html>
      `

			// Write the HTML to the iframe
			iframeDoc.open()
			iframeDoc.write(fullHtml)
			iframeDoc.close()

			setIsLoading(false)
		} catch (error) {
			console.error('Error rendering snippet preview:', error)
			setHasError(true)
			setIsLoading(false)
		}
	}, [htmlContent])

	const handleIframeLoad = () => {
		setIsLoading(false)
	}

	const handleIframeError = () => {
		setHasError(true)
		setIsLoading(false)
	}

	if (!htmlContent) {
		return (
			<div className={`snippet-preview empty ${className}`} style={{ height }}>
				<div className='preview-placeholder'>
					<p>No HTML content to preview</p>
				</div>
			</div>
		)
	}

	return (
		<div className={`snippet-preview ${className}`}>
			<div className='preview-header'>
				<span className='preview-label'>Live Preview</span>
				{isLoading && <span className='preview-status loading'>Loading...</span>}
				{hasError && <span className='preview-status error'>Error loading preview</span>}
			</div>
			<div className='preview-container' style={{ height }}>
				<iframe ref={iframeRef} className='preview-iframe' title='HTML Snippet Preview' sandbox='allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock' onLoad={handleIframeLoad} onError={handleIframeError} />
			</div>
		</div>
	)
}

export default SnippetPreview
