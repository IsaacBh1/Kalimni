import React, { useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import ChatBubble from "./ChatBubble";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";
import messagingService from "../../Api/messagingService";

const ChatWindow = ({
  MessagesInfo,
  user,
  status,
  connectionStatus,
  OnSendMessage,
}) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (MessagesInfo?.messages?.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [MessagesInfo?.messages]);

  // Subscribe to conversation messages when user changes
  useEffect(() => {
    if (!user || !user.id) return;

    console.log(`Subscribing to messages for user ${user.id}`);

    const unsubscribe = messagingService.subscribeToConversation(
      user.id,
      (message) => {
        console.log("Received new message via subscription:", message);

        const isDuplicate = MessagesInfo?.messages?.some(
          (m) => m.id === message.id
        );

        if (!isDuplicate) {
          const updatedMessagesInfo = {
            ...MessagesInfo,
            messages: [...(MessagesInfo?.messages || []), message],
          };
          OnSendMessage(updatedMessagesInfo);
        }
      }
    );

    // Cleanup on user change or unmount
    return () => {
      console.log(`Unsubscribing from messages for user ${user.id}`);
      unsubscribe();
    };
  }, [user?.id, MessagesInfo?.messages, OnSendMessage]);

  async function handleSendMessage(message) {
    if (!message.trim() || !user) return;

    const sender = parseInt(localStorage.getItem("userId"));
    const receiver = parseInt(user.id);

    console.log(`Sending message from ${sender} to ${receiver}: ${message}`);

    try {
      const success = await messagingService.sendNewMessage(receiver, message);

      if (!success) {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <div className="chat-window">
      <ChatHeader
        user={user}
        status={status}
        connectionStatus={connectionStatus}
        onCallClick={() => console.log("Calling...")}
      />
      <div className={`chat-body ${!MessagesInfo?.messages ? "empty" : ""}`}>
        {!MessagesInfo?.messages ? (
          <p>Click on a conversation to start chatting</p>
        ) : (
          <>
            {MessagesInfo.messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInput
        onSend={(msg) => handleSendMessage(msg)}
        disabled={!user || connectionStatus === "error"}
      />
      {connectionStatus !== "connected" && user && (
        <div className="connection-status">
          {connectionStatus === "connecting" && "Connecting..."}
          {connectionStatus === "reconnecting" && "Reconnecting..."}
          {connectionStatus === "disconnected" && "Disconnected"}
          {connectionStatus === "error" && "Connection Error"}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
