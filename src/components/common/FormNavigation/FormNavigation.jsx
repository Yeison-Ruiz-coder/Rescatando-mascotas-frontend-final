import React from 'react';

const FormNavigation = ({ onNext, onPrev, canNext, canPrev }) => {
  return (
    <div className="form-navigation">
      {canPrev && <button onClick={onPrev}>Previous</button>}
      {canNext && <button onClick={onNext}>Next</button>}
    </div>
  );
};

export default FormNavigation;