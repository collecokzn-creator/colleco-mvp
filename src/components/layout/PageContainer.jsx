import React from 'react';
import PropTypes from 'prop-types';

// Unified page container: applies horizontal overflow guard + consistent padding & width.
export default function PageContainer({ children, className = '' }) {
  return (
    <div className="overflow-x-hidden">
      <div className={`max-w-7xl mx-auto px-6 py-8 ${className}`}> {children} </div>
    </div>
  );
}

PageContainer.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
