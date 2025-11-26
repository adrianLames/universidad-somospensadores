import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackHomeButton.css';

const BackHomeButton = ({ label = 'Volver al inicio', className = '', ...props }) => {
  const navigate = useNavigate();
  const classes = `back-home-btn ${className}`.trim();
  return (
    <button className={classes} onClick={() => navigate('/')} {...props}>
      ← {label}
    </button>
  );
};

export default BackHomeButton;
