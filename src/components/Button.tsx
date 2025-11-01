// /src/components/Button.tsx
import React from 'react';

export function Button({ children, ...props }) {
  return (
    <button 
      style={{ padding: '10px', background: 'blue', color: 'white' }} 
      {...props}
    >
      {children}
    </button>
  );
}