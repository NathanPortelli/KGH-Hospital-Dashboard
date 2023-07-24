import React from 'react';

const BatteryBar = ({ percentage }) => {
  const batteryStyle = {
    width: '100px',
    height: '20px',
    border: '1px solid #CCCCCC',
    borderRadius: '5px',
    overflow: 'hidden',
    position: 'relative',
  };

  const getColor = (percentage) => {
    if (percentage < 51) {
      return 'red';
    }
    if (percentage >= 51 && percentage < 63) {
      return 'orange';
    }
    return '#00BFA5';
  };

  const fillStyle = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: getColor(percentage),
    borderRadius: '5px',
  };

  return (
    <div style={batteryStyle}>
      <div style={fillStyle}>&nbsp;</div>
    </div>
  );
};

export default BatteryBar;
