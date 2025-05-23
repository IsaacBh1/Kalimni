import React from "react";
import "./MessageItem.css";
import getAvatarUrl from "../../utils/utilities";

const MessageItem = ({ ChatItem, OnChatSelected }) => {
  const { user, text, time } = ChatItem;
  return (
    <div
      className="message-item"
      onClick={() => {
        OnChatSelected(ChatItem.user);
      }}
    >
      <img
        src={getAvatarUrl(ChatItem.user.username)}
        alt={ChatItem.user.username}
        className="avatar"
      />
      <div className="message-content">
        <div className="message-header">
          <span className="name">{user.username}</span>
          <span className="time">{time}</span>
        </div>
        <p className="text">{text}</p>
      </div>
    </div>
  );
};

export default MessageItem;
