// src/components/Loader.tsx
import React from 'react';
import '../styles/_theme.scss'; // Make sure this is imported somewhere globally

const Loader: React.FC = () => (
  <div className="global-loader-overlay">
    <div className="global-loader-spinner"></div>
  </div>
);

export default Loader;
