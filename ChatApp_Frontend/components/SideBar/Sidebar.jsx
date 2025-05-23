import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiMessageSquareDetail, BiSearch, BiCalendar } from "react-icons/bi";
import { FiSettings } from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="logo">
          {/* <span>K</span> */}
          <svg viewBox="25 0 80 80" width="50" height="50">
            <path
              d="M40 20 L60 20 L60 60 L40 60 Z"
              fill="#635bff"
              stroke="none"
            />
            <path
              d="M70 20 L90 20 L90 60 L70 40 Z"
              fill="#635bff"
              stroke="none"
            />
          </svg>
        </div>
        <nav className="nav-icons">
          <button className="sidebar-button">
            <AiOutlineHome className="icon" title="Home" />
          </button>
          <button className="sidebar-button">
            <BiMessageSquareDetail className="icon" title="Chat" />
          </button>
          <button className="sidebar-button">
            <BiSearch className="icon" title="Search" />
          </button>
        </nav>
      </div>
      <div className="settings">
        <FiSettings className="icon" title="Settings" />
      </div>
    </aside>
  );
};

export default Sidebar;
