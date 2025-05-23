// File: src/components/ChatList.jsx
import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import MessageItem from "./MessageItem";
import "./ChatList.css";
import { findUsers, getFriends } from "../../Api/chatApi";

const ChatList = ({ OnChatSelected }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!searchTerm) {
      // console.log('this is the friends list');

      getFriends()
        .then((data) => {
          if (data) {
            setUsers(data);
          } else {
            setUsers([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching friends:", error);
          setUsers([]);
        });
      return;
    }
    findUsers(searchTerm)
      .then((data) => {
        if (data) {
          setUsers(data);
        } else {
          setUsers([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      });
  }, [searchTerm]);

  return (
    <div className="chat-list-container">
      <SearchBar placeholder="Search users" onSearch={setSearchTerm} />
      <div className="message-list">
        {users.map((user) => (
          <MessageItem
            key={user.id}
            OnChatSelected={OnChatSelected}
            ChatItem={{
              user: user,
              text: "Start a conversation",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
