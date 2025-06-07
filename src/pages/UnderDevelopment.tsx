import React from 'react';
const UnderDevelopment = () => {
  if (process.env.NODE_ENV !== 'production') {
    return null; // Do not show in development
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgb(0, 0, 0)',
      fontFamily: 'Moderat, sans-serif',
      fontSize: '2rem',
      color: '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    }}>
      <h1>Site Under Development! 🚧 Stay tuned!</h1>
    </div>
  );
};

export default UnderDevelopment;
