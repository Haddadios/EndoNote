import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  html?: string;
  className?: string;
}

export function CopyButton({ text, html, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (
        html &&
        typeof ClipboardItem !== 'undefined' &&
        navigator.clipboard &&
        'write' in navigator.clipboard
      ) {
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const textBlob = new Blob([text], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {copied ? 'Copied!' : 'Copy to Clipboard'}
    </button>
  );
}
