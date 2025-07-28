# Assets Directory Structure

## Directory Organization

### `/public/` - Static Assets

- **Purpose**: Files served directly by the server
- **Usage**: Favicon, manifest, robots.txt, etc.
- **Access**: Direct URL paths (e.g., `/favicon.svg`)
- **Build**: Copied as-is to dist folder

### `/src/assets/` - Imported Assets

- **Purpose**: Assets imported into components
- **Usage**: Images, icons, fonts used in components
- **Access**: ES6 imports with path aliases
- **Build**: Processed by Vite (optimization, hashing)

## Path Aliases Available

```javascript
// Instead of relative paths:
import Logo from '../../../assets/images/logo.svg'

// Use clean aliases:
import Logo from '@assets/images/logo.svg'
import Component from '@components/MyComponent'
import Service from '@services/api'
```

## Usage Examples

### For Favicon (use public):

```html
<!-- In index.html -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### For Component Assets (use src/assets):

```jsx
// Import and use
import logo from '@assets/images/logo.svg'

function Header() {
  return <img src={logo} alt="Logo" />
}
```

### For Dynamic Assets:

```jsx
// Vite handles these automatically
const iconUrl = new URL('@assets/icons/star.svg', import.meta.url).href
```
