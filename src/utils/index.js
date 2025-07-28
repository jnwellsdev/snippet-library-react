// Export validation and transformation utilities
export * from './validation.js';
export * from './transformers.js';

// HTML sanitization and preview utilities (will be expanded in Task 6)
export const INJECTED_STYLES = `
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui; }
  </style>
`

export const INJECTED_SCRIPTS = `
  <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
`

export const createPreviewHtml = (htmlContent) => {
  return `
    <!DOCTYPE html>
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
}
