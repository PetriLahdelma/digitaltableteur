const ProgressMessage = () => {
  if (process.env.NODE_ENV === 'production') {
    return null; // Do not show the message in production
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#ffcc00',
      textAlign: 'center',
      padding: '10px',
      zIndex: 1000,
    }}>
      <p style={{ verticalAlign: 'middle' }}>Site is currently under development. Stay tuned!</p>
    </div>
  );
};

export default ProgressMessage;
