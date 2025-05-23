import React from 'react';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import './Header.css';

const Header = ({ title, count }) => (
  <div className="header">
    <div className="header-left">
      <h2>{title}</h2>
      <FiChevronDown />
      <span className="badge">{count}</span>
    </div>
    <button className="add-btn">
      <FiPlus />
    </button>
  </div>
);

export default Header;
