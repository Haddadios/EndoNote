import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
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
