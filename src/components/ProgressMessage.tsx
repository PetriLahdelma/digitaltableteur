const ProgressMessage = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: '#ffcc00',
      textAlign: 'center',
      padding: '10px',
      zIndex: 1000,
    }}>
      <p>Site is currently under development. Stay tuned!</p>
    </div>
  );
};

export default ProgressMessage;
