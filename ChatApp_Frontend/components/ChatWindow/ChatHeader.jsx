import React from "react";
import { FiPhone } from "react-icons/fi";
import "./ChatHeader.css";
import getAvatarUrl from "../../utils/utilities";
const ChatHeader = ({ user }) =>
  !user ? null : (
    <div className="chat-header">
      <div className="chat-info">
        <img
          src={getAvatarUrl(user.username)}
          alt={user.username}
          className="chat-avatar"
        />
        <div>
          <div className="chat-name">{user.username}</div>
          <div
            className={`chat-status ${user.status === "Online" ? "green" : ""}`}
          >
            {user.status === "Online" ? "Online" : "Offline"}
          </div>
        </div>
      </div>
    </div>
  );

export default ChatHeader;
