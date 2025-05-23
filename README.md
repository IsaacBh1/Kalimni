# Kalimni 💬

**Kalimni** is a real-time chat application featuring user authentication, group chats, and live messaging powered by SignalR. It consists of a .NET Core backend and a React frontend built with Vite.

---

## 🧱 Project Structure

Kalimni/

├── ChatApp_Backend/
└── ChatApp_Frontend/



---

## 📦 Backend – ChatApp_Backend

### 🔧 Tech Stack

- ASP.NET Core  
- Entity Framework Core  
- SQLite  
- SignalR  

### 🚀 Key Features

- User authentication  
- Group and member models  
- Real-time messaging with SignalR  
- SQLite database with migrations  

### 📁 Important Files

- `Program.cs`: Entry point  
- `Data/ChatDbContext.cs`: Database context  
- `Features/`: Contains modular features (Auth, Chats, Messages)  
- `Hubs/ChatHub.cs`: SignalR hub for real-time chat  
- `Migrations/`: EF Core migration files  
- `Models/`: Entity models for User, Group, Message, etc.  
- `chatapp.db`: SQLite database file  

### ▶️ Run the Backend

```bash
cd ChatApp_Backend
dotnet run

```
## 🌐 Frontend – ChatApp_Frontend

### 🔧 Tech Stack

- React  
- Vite  
- SignalR (via JavaScript client)  

### 📁 Key Directories

- `Api/`: API service and SignalR client logic  
- `components/`: Auth, chat window, sidebar, etc.  
- `src/`: React entry points and styling  
- `utils/`: Utility functions



### ▶️ Run the Frontend

```bash
cd ChatApp_Frontend
npm install 
npm run dev
```
