# Chefhub Architecture

This document outlines the high-level architecture and data flows of the Chefhub platform. It provides a visual understanding of how the various components interact with each other.

## System Architecture

The overall system architecture demonstrates the interaction between the frontend, backend, database, and external services.

```mermaid
graph TD
    Client[Web Browser / Client]
    
    subgraph Frontend
        React[React 19 Vite App]
        State[TanStack Query]
        SocketClient[Socket.io Client]
        React --> State
        React --> SocketClient
    end
    
    subgraph Backend
        Express[Node.js / Express Server]
        Auth[Passport.js Auth]
        SocketServer[Socket.io Server]
        Express --> Auth
        Express --> SocketServer
    end
    
    subgraph Data & Caching
        MongoDB[(MongoDB)]
        Redis[(Redis Cache)]
    end
    
    subgraph External Services
        Gemini[Google Gemini AI]
        Razorpay[Razorpay Payments]
        Cloudinary[Cloudinary Images]
    end
    
    Client -->|HTTP/REST| React
    React -->|API Requests| Express
    SocketClient <-->|WebSockets| SocketServer
    
    Express --> MongoDB
    Express --> Redis
    Express --> Gemini
    Express --> Razorpay
    Express --> Cloudinary
```

## Booking Flow

The booking flow illustrates the steps taken from when a user selects a chef to the final payment confirmation.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Razorpay
    participant Database
    
    User->>Frontend: Select Chef & Time
    Frontend->>Backend: POST /api/bookings/create
    Backend->>Database: Save Pending Booking
    Backend->>Razorpay: Create Payment Order
    Razorpay-->>Backend: Order ID
    Backend-->>Frontend: Payment Details & Order ID
    User->>Frontend: Complete Payment
    Frontend->>Razorpay: Process Payment
    Razorpay-->>Backend: Webhook (Payment Success)
    Backend->>Database: Update Booking Status (Confirmed)
    Backend-->>Frontend: Confirmation
    Frontend-->>User: Booking Success Page
```

## AI Chef Assistant Flow

This flow shows how the AI Assistant integrates with the Google Gemini API to provide smart culinary advice.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Gemini AI
    
    User->>Frontend: Ask for recipe/tip
    Frontend->>Backend: POST /api/ai/chat
    Backend->>Gemini AI: Send Prompt & Context
    Gemini AI-->>Backend: AI Response
    Backend-->>Frontend: Formatted Response
    Frontend-->>User: Display AI Tip
```

## Real-time Tracking Flow

This demonstrates how WebSocket connections are used to provide live updates of the chef's location to the user.

```mermaid
sequenceDiagram
    participant Chef
    participant SocketServer
    participant Redis
    participant User
    
    Chef->>SocketServer: Emit Location Update
    SocketServer->>Redis: Publish Location Event
    Redis-->>SocketServer: Distribute to Subscribed Clients
    SocketServer-->>User: Push Location Update
    User->>User: Update Map UI
```
