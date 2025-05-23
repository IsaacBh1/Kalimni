import React from "react";
import "./ChatBubble.css";

const ChatBubble = ({ message }) => {
  const userId = localStorage.getItem("userId");
  // console.log("userId", userId);
  // console.log("message.senderId", message.senderId);
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`chat-bubble ${message.senderId == userId ? "me" : "other"}`}
    >
      <div className="bubble-text">{message.text}</div>
      <div className="bubble-time">{formatTime(message.sentAt)}</div>
      {/* <div className="bubble-status">
        {message.isRead ? (
          <span className="status-read">✓✓</span>
        ) : (
          <span className="status-sent">✓</span>
        )}
      </div> */}
    </div>
  );
};

export default ChatBubble;
