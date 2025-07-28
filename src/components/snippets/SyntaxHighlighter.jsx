import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import { html as beautifyHtml } from 'js-beautify'
import 'prism-themes/themes/prism-material-dark.css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import './SyntaxHighlighter.css'

/**
 * SyntaxHighlighter component for displaying code with syntax highlighting
 * @param {Object} props
 * @param {string} props.code - The code to highlight
 * @param {string} props.language - The programming language (default: 'markup' for HTML)
 * @param {boolean} props.formatCode - Whether to format the code with Prettier (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const SyntaxHighlighter = ({
  code,
  language = 'markup',
  formatCode = true,
  className = '',
}) => {
  const codeRef = useRef(null)

  // Format code with js-beautify
  const getFormattedCode = (rawCode, lang) => {
    if (!formatCode) return rawCode

    try {
      if (lang === 'markup' || lang === 'html') {
        return beautifyHtml(rawCode, {
          indent_size: 2,
          indent_char: ' ',
          max_preserve_newlines: 1,
          preserve_newlines: true,
          keep_array_indentation: false,
          break_chained_methods: false,
          indent_scripts: 'normal',
          brace_style: 'collapse',
          space_before_conditional: true,
          unescape_strings: false,
          jslint_happy: false,
          end_with_newline: false,
          wrap_line_length: 180,
          indent_inner_html: false,
          comma_first: false,
          e4x: false,
          indent_empty_lines: false,
        })
      }
      // For other languages, return as-is for now
      return rawCode
    } catch (error) {
      console.warn('Failed to format code with js-beautify:', error)
      return rawCode
    }
  }

  const formattedCode = getFormattedCode(code, language)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [formattedCode, language])

  return (
    <div className={`syntax-highlighter ${className}`}>
      <pre className={`language-${language}`}>
        <code ref={codeRef} className={`language-${language}`}>
          {formattedCode}
        </code>
      </pre>
    </div>
  )
}

export default SyntaxHighlighter
