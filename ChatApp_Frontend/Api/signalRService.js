import * as signalR from "@microsoft/signalr";

class SignalRService {
  constructor() {
    this.connection = null;
    this.host = "localhost:5142";
    this.messageCallbacks = [];
    this.connectionStateCallbacks = [];
    this.joinedGroups = new Set();
  }

  async initialize(token) {
    if (this.connection) {
      await this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://${this.host}/chatHub`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000]) 
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.connection.on("ReceiveMessage", (message) => {
      console.log("Message received via SignalR:", message);
      this.messageCallbacks.forEach((callback) => callback(message));
    });

    this.connection.on("JoinedGroup", (groupName) => {
      console.log(`Successfully joined group: ${groupName}`);
      this.joinedGroups.add(groupName);
    });

    this.connection.on("UserOnline", (userId) => {
      console.log(`User ${userId} is now online`);
    });

    this.connection.on("UserOffline", (userId) => {
      console.log(`User ${userId} is now offline`);
    });

    this.connection.onclose(() => {
      console.log("SignalR connection closed");
      this.connectionStateCallbacks.forEach((callback) =>
        callback({ isConnected: false })
      );
    });

    this.connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
      this.connectionStateCallbacks.forEach((callback) =>
        callback({ isConnected: false, isReconnecting: true })
      );
    });

    this.connection.onreconnected(() => {
      console.log("SignalR reconnected");

      this.joinedGroups.forEach(async (group) => {
        try {
          await this.connection.invoke("JoinGroup", group);
          console.log(`Rejoined group ${group} after reconnection`);
        } catch (err) {
          console.error(`Failed to rejoin group ${group}:`, err);
        }
      });

      this.connectionStateCallbacks.forEach((callback) =>
        callback({ isConnected: true })
      );
    });

    try {
      await this.connection.start();
      console.log("SignalR connection established");
      this.connectionStateCallbacks.forEach((callback) =>
        callback({ isConnected: true })
      );
      return true;
    } catch (err) {
      console.error("Error establishing SignalR connection:", err);
      return false;
    }
  }

  onMessage(callback) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  onConnectionStateChange(callback) {
    this.connectionStateCallbacks.push(callback);
    return () => {
      this.connectionStateCallbacks = this.connectionStateCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  async sendMessage(receiverId, text, groupId = null) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.error("Cannot send message: SignalR connection not established");
      return false;
    }

    try {
      // Make sure parameters match the exact signature in the hub
      await this.connection.invoke("SendMessage", receiverId, text, groupId);
      return true;
    } catch (err) {
      console.error("Error sending message via SignalR:", err);
      return false;
    }
  }

  async joinGroup(groupName) {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.error("Cannot join group: SignalR connection not established");
      return false;
    }

    try {
      if (!this.joinedGroups.has(groupName)) {
        await this.connection.invoke("JoinGroup", groupName);
        this.joinedGroups.add(groupName);
      }
      return true;
    } catch (err) {
      console.error("Error joining group:", err);
      return false;
    }
  }
  async joinGroupById(groupId) {
    return await this.joinGroup(`Group_${groupId}`);
  }

  async joinDirectChat(userId1, userId2) {
    const sortedIds = [userId1, userId2].sort((a, b) => a - b);
    const chatGroup = `direct_${sortedIds[0]}_${sortedIds[1]}`;

    return await this.joinGroup(chatGroup);
  }

  isConnected() {
    return (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR connection stopped");
        this.joinedGroups.clear();
        return true;
      } catch (err) {
        console.error("Error stopping SignalR connection:", err);
        return false;
      }
    }
    return true;
  }
}

const signalRService = new SignalRService();
export default signalRService;
