import React from 'react';

const Connection = ({ sourceGate, targetGate }) => {
  return (
    <div className="connection">
      {/* Render connection lines */}
      {/* Example: */}
      <svg>
        <line
          x1={sourceGate.x + sourceGate.width}
          y1={sourceGate.y + sourceGate.height / 2}
          x2={targetGate.x}
          y2={targetGate.y + targetGate.height / 2}
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default Connection;
