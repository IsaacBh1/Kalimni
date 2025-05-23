import signalRService from './signalRService';
import { getAllMessages, sendMessage } from './messagesApi'; 

class MessagingService {
    constructor() {
        this.currentUserId = null;
        this.messageListeners = new Map(); 
        this.isInitialized = false;
    }

    async initialize(userId, token) {
        if (this.isInitialized) {
            return true;
        }

        this.currentUserId = userId;
        
        const connected = await signalRService.initialize(token);
        if (!connected) {
            console.error("Failed to initialize SignalR connection");
            return false;
        }

        signalRService.onMessage(this.handleIncomingMessage.bind(this));
        
        this.isInitialized = true;
        return true;
    }

    handleIncomingMessage(message) {
        console.log("Handling incoming message:", message);
        let conversationId;
        
        if (message.groupId) {
            conversationId = `group_${message.groupId}`;
        } else {
            const sortedIds = [this.currentUserId, 
                message.senderId === parseInt(this.currentUserId) ? message.receiverId : message.senderId]
                .sort((a, b) => a - b);
            conversationId = `direct_${sortedIds[0]}_${sortedIds[1]}`;
        }

        console.log(`Message belongs to conversation: ${conversationId}`);
        
        if (this.messageListeners.has(conversationId)) {
            this.messageListeners.get(conversationId).forEach(callback => {
                callback(message);
            });
        }
    }

    async loadMessages(otherUserId, pageNumber = 1, pageSize = 50) {
        if (!this.currentUserId) {
            throw new Error("User not initialized");
        }

        return await getAllMessages(this.currentUserId, otherUserId, pageNumber, pageSize);
    }

    async sendNewMessage(receiverId, text, groupId = null) {
        try {
            if (!this.currentUserId) throw new Error("User not initialized");
            
            const currentUserId = parseInt(this.currentUserId);
            receiverId = parseInt(receiverId);
    
            if (!groupId) {
                const sortedIds = [currentUserId, receiverId].sort((a, b) => a - b);
                await this.joinGroup(`direct_${sortedIds[0]}_${sortedIds[1]}`);
            }
    
            // Try SignalR first
            if (signalRService.isConnected()) {
                await signalRService.sendMessage(receiverId, text, groupId);
                return true;
            }
    
            // Fallback to API
            return await sendMessage({ text, receiverId, groupId });
        } catch (error) {
            console.error("Message sending failed:", error);
            return false;
        }
    }

    async joinGroup(groupId) {
        if (signalRService.isConnected()) {
            return await signalRService.joinGroup(groupId);
        }
        return false;
    }

    subscribeToConversation(userId, callback) {
        const currentUserId = parseInt(this.currentUserId);
        userId = parseInt(userId);
        
        const sortedIds = [currentUserId, userId].sort((a, b) => a - b);
        const conversationId = `direct_${sortedIds[0]}_${sortedIds[1]}`;
        
        console.log(`Subscribing to conversation: ${conversationId}`);
        
        if (signalRService.isConnected()) {
            signalRService.joinGroup(conversationId);
        }
        
        if (!this.messageListeners.has(conversationId)) {
            this.messageListeners.set(conversationId, []);
        }
        
        this.messageListeners.get(conversationId).push(callback);
        
        // Return unsubscribe function
        return () => {
            if (this.messageListeners.has(conversationId)) {
                const callbacks = this.messageListeners.get(conversationId);
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    subscribeToGroup(groupId, callback) {
        const conversationId = `group_${groupId}`;
        
        // Join the group
        if (signalRService.isConnected()) {
            signalRService.joinGroup(conversationId);
        }
        
        if (!this.messageListeners.has(conversationId)) {
            this.messageListeners.set(conversationId, []);
        }
        
        this.messageListeners.get(conversationId).push(callback);
        
        return () => {
            if (this.messageListeners.has(conversationId)) {
                const callbacks = this.messageListeners.get(conversationId);
                const index = callbacks.indexOf(callback);
                if (index !== -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    disconnect() {
        signalRService.disconnect();
        this.messageListeners.clear();
        this.isInitialized = false;
    }
}

const messagingService = new MessagingService();
export default messagingService;