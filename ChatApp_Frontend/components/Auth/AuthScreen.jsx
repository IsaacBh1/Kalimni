import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import messagingService from "../../Api/messagingService"; // Update this path to match your project structure

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const host = "localhost:5142";
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear any previous error message
    setIsLoading(true);

    try {
      const url = isLogin
        ? `http://${host}/api/auth/login`
        : `http://${host}/api/auth/register`;

      const payload = isLogin
        ? { username, password }
        : { username, email, password };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Authentication failed!");
      }

      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);
      
      // Decode the token to get user ID
      const decodedToken = JSON.parse(atob(token.split(".")[1])); 
      const userId = decodedToken.id;
      localStorage.setItem("userId", userId);

      // Initialize SignalR connection after successful login
      const signalRConnected = await messagingService.initialize(userId, token);
      
      if (!signalRConnected) {
        console.warn("SignalR connection could not be established. Some real-time features may be unavailable.");
        // We continue with navigation even if SignalR fails, as this is not critical
      }

      console.log("Authentication successful!");
      navigate("/chat");
      
      if (!isLogin) {
        setIsLogin(true);
      }
    } catch (error) {
      setErrorMessage("Failed to login. Please check your credentials.");
      console.error("Error:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setEmail("");
    setPassword("");
    setErrorMessage("");
  };

  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      fontFamily: "Arial, sans-serif",
      width: "100%",
    },
    formContainer: {
      width: "100%",
      maxWidth: "400px",
      padding: "32px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    logoContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: "24px",
    },
    formTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: "24px",
      color: "#333333",
    },
    formGroup: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "6px",
      color: "#333333",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #cccccc",
      borderRadius: "4px",
      fontSize: "16px",
      boxSizing: "border-box",
      backgroundColor: "#f9f9f9",
      color: "#333333",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#635bff",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "8px",
      position: "relative",
    },
    toggleContainer: {
      textAlign: "center",
      marginTop: "16px",
    },
    toggleButton: {
      background: "none",
      border: "none",
      color: "#635bff",
      fontSize: "14px",
      cursor: "pointer",
      textDecoration: "underline",
    },
    errorMessage: {
      color: "red",
      fontSize: "14px",
      textAlign: "center",
      marginBottom: "16px",
    },
    loadingSpinner: {
      display: "inline-block",
      width: "16px",
      height: "16px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderRadius: "50%",
      borderTopColor: "#fff",
      animation: "spin 1s linear infinite",
      marginRight: "8px",
      verticalAlign: "middle",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <svg viewBox="0 0 240 80" width="200" height="60">
            <path
              d="M40 20 L60 20 L60 60 L40 60 Z"
              fill="#635bff"
              stroke="none"
            />
            <path
              d="M70 20 L90 20 L90 60 L70 40 Z"
              fill="#635bff"
              stroke="none"
            />
            <text
              x="100"
              y="50"
              fontFamily="Arial"
              fontSize="32"
              fontWeight="bold"
              fill="#333"
            >
              Kalimni
            </text>
          </svg>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 style={styles.formTitle}>{isLogin ? "Login" : "Sign Up"}</h2>
          {errorMessage && (
            <p style={styles.errorMessage}>{errorMessage}</p>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          {!isLogin && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? (
              <>
                <span style={{
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderRadius: "50%",
                  borderTopColor: "#fff",
                  animation: "spin 1s linear infinite",
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}></span>
                {isLogin ? "Signing In..." : "Registering..."}
              </>
            ) : (
              isLogin ? "Sign In" : "Register"
            )}
          </button>
          <div style={styles.toggleContainer}>
            <button
              type="button"
              onClick={toggleAuthMode}
              style={styles.toggleButton}
              disabled={isLoading}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AuthComponent;