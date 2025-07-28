import React from 'react';
import SyntaxHighlighter from './SyntaxHighlighter';
import SnippetPreview from './SnippetPreview';

// Demo component to test the syntax highlighting and preview functionality
const Demo = () => {
  const sampleHtml = `<div class="bg-blue-500 text-white p-4 rounded-lg">
  <h1 class="text-2xl font-bold mb-2">Hello World!</h1>
  <p class="text-sm">This is a sample HTML snippet with Tailwind CSS classes.</p>
  <button class="bg-white text-blue-500 px-4 py-2 rounded mt-2 hover:bg-gray-100">
    Click me!
  </button>
</div>

<script>
  document.querySelector('button').addEventListener('click', function() {
    alert('Button clicked!');
  });
</script>`;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Syntax Highlighting and Preview Demo</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <h2>Syntax Highlighted Code</h2>
          <SyntaxHighlighter code={sampleHtml} language="markup" />
        </div>
        
        <div>
          <h2>Live Preview</h2>
          <SnippetPreview htmlContent={sampleHtml} height={400} />
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <h2>Different Language Example</h2>
        <SyntaxHighlighter 
          code={`console.log('Hello, World!');
const greeting = 'Welcome to the snippet sharing app';
document.body.innerHTML = \`<h1>\${greeting}</h1>\`;`} 
          language="javascript" 
        />
      </div>
    </div>
  );
};

export default Demo;