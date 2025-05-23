import React from "react";
import ChatList from "../ChatList/ChatList";
import ChatWindow from "../ChatWindow/ChatWindow";
import Sidebar from "../SideBar/Sidebar";
import { useState, useEffect } from "react";
import { getAllMessages } from "../../Api/messagesApi";
import signalRService from "../../Api/signalRService";

function Chat() {
  const [user, setUser] = useState(null);
  const [status] = useState(null);
  const [messages, setMessages] = useState({
    messages: [],
    totalMessages: 0,
    pageNumber: 1,
    pageSize: 50,
  });
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    const handleConnectionState = (state) => {
      setConnectionStatus(
        state.isConnected
          ? "connected"
          : state.isReconnecting
          ? "reconnecting"
          : "disconnected"
      );
    };

    signalRService.onConnectionStateChange(handleConnectionState);

    return () => {
      signalRService.connectionStateCallbacks =
        signalRService.connectionStateCallbacks.filter(
          (cb) => cb !== handleConnectionState
        );
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      const initializeSignalR = async () => {
        try {
          setConnectionStatus("connecting");
          const connected = await signalRService.initialize(token);

          if (connected) {
            setConnectionStatus("connected");
            console.log("SignalR connection established");

            signalRService.onMessage((newMessage) => {
              if (
                user &&
                ((newMessage.senderId == user.id &&
                  newMessage.receiverId == userId) ||
                  (newMessage.senderId == userId &&
                    newMessage.receiverId == user.id))
              ) {
                setMessages((prevMessages) => {
                  if (!prevMessages.messages) {
                    return {
                      messages: [newMessage],
                      totalMessages: 1,
                      pageNumber: 1,
                      pageSize: 50,
                    };
                  }

                  if (
                    !prevMessages.messages.some((m) => m.id === newMessage.id)
                  ) {
                    return {
                      ...prevMessages,
                      messages: [...prevMessages.messages, newMessage],
                      totalMessages: prevMessages.totalMessages + 1,
                    };
                  }
                  return prevMessages;
                });
              }
            });

            // Connection state change handling
            signalRService.onConnectionStateChange((state) => {
              setConnectionStatus(
                state.isConnected
                  ? "connected"
                  : state.isReconnecting
                  ? "reconnecting"
                  : "disconnected"
              );
            });
          } else {
            setConnectionStatus("failed");
            console.error("Failed to establish SignalR connection");
          }
        } catch (error) {
          setConnectionStatus("error");
          console.error("Error initializing SignalR:", error);
        }
      };

      initializeSignalR();

      // Cleanup function
      return () => {
        signalRService.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function OnChatSelected(user) {
    const sender = localStorage.getItem("userId");
    setUser(user);

    // Load chat history
    getAllMessages(sender, user.id, 1, 50)
      .then((data) => {
        if (data) {
          setMessages(data);

          if (connectionStatus === "connected") {
            console.log(connectionStatus);
            const userId1 = parseInt(sender);
            const userId2 = user.id;
            signalRService.joinDirectChat(userId1, userId2);
          }
        } else {
          setMessages([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        setMessages([]);
      });
  }

  return (
    <div className="chat-container">
      <Sidebar />
      <ChatList OnChatSelected={OnChatSelected} />
      <ChatWindow
        user={user}
        status={status}
        MessagesInfo={messages}
        connectionStatus={connectionStatus}
        OnSendMessage={setMessages}
      />
    </div>
  );
}

export default Chat;
