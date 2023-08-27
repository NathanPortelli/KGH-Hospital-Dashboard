import React from 'react';

// Used in Risk Association module for added colour scheme in probability & accuracy percentages

// eslint-disable-next-line react/prop-types
const BatteryBar = ({ percentage }) => {
  const batteryStyle = {
    width: '100px',
    height: '20px',
    border: '1px solid #CCCCCC',
    borderRadius: '5px',
    overflow: 'hidden',
    position: 'relative',
  };

  // Sets status colour based off how high probability/accuracy is
  const getColor = (percentage) => {
    if (percentage < 51) { return 'red'; } // if low, red
    if (percentage >= 51 && percentage < 63) { return 'orange'; } // if middle, orange
    return '#00BFA5'; // if high, green
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
