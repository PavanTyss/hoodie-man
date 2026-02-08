'use client';

import { Facebook, Twitter, Link as LinkIcon, Mail } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      <button
        onClick={shareOnFacebook}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        onClick={shareOnTwitter}
        className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        onClick={shareViaEmail}
        className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
        title="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </button>
      <button
        onClick={copyLink}
        className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        title={copied ? 'Copied!' : 'Copy Link'}
      >
        <LinkIcon className="h-4 w-4" />
      </button>
      {copied && <span className="text-xs text-green-600 font-semibold">Copied!</span>}
    </div>
  );
}
