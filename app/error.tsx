'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Handle ChunkLoadError specifically
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.warn('[Next.js] Chunk loading error detected, reloading page...');
      // Auto-reload on chunk errors (common on first load in WebContainer)
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }, [error]);

  // For chunk errors, show a minimal loading state
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚡</div>
          <div>Loading application...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Something went wrong!</h2>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
