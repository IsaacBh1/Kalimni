import React, { useState } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import "./MessageInput.css";

const MessageInput = ({ onSend }) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };

  return (
    <div className="message-input">
      <button className="icon-btn">
        <FiPaperclip />
      </button>
      <input
        type="text"
        placeholder="Type a message"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <button className="send-btn" onClick={handleSend}>
        <FiSend />
      </button>
    </div>
  );
};

export default MessageInput;
