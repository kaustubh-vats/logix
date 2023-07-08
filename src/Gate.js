import React from 'react';

const Gate = ({ gate, onMouseDown, onMouseUp }) => {
  return (
    <div
      className="gate"
      style={{ top: gate.y, left: gate.x }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {/* Render gate shape and label */}
      {/* Example: */}
      <div className="gate-shape">{gate.type}</div>
    </div>
  );
};

export default Gate;
