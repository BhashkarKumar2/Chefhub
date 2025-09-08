import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5000", 
          "http://127.0.0.1:5173",
          "http://127.0.0.1:5174",
          // "http://chefhub-poou.vercel.app", 
          // "https://chefhub-poou.vercel.app"
        ],
        credentials: true
      }
    });

    // Authentication middleware for socket connections
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          socket.userId = decoded.id;
          next();
        } catch (error) {
          console.error('Socket authentication error:', error);
          next(new Error('Authentication error'));
        }
      } else {
        // Allow anonymous connections for public features
        next();
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`🔗 Socket connected: ${socket.id}`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        console.log(`👤 User ${socket.userId} connected`);
        
        // Join user to their personal room for notifications
        socket.join(`user:${socket.userId}`);
      }

      // Handle chef status updates
      socket.on('chef-status-update', (data) => {
        this.broadcastChefStatusUpdate(data);
      });

      // Handle booking status updates
      socket.on('booking-status-update', (data) => {
        this.notifyBookingStatusUpdate(data);
      });

      // Handle real-time chat messages
      socket.on('send-message', (data) => {
        this.handleChatMessage(socket, data);
      });

      // Handle location updates for delivery tracking
      socket.on('location-update', (data) => {
        this.handleLocationUpdate(socket, data);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`👤 User ${socket.userId} disconnected`);
        }
      });
    });

    console.log('🚀 Socket.io server initialized');
  }

  // Notify specific user
  notifyUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
      console.log(`📨 Notification sent to user ${userId}:`, event);
    }
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📡 Broadcast sent:`, event);
    }
  }

  // Booking status updates
  notifyBookingStatusUpdate(data) {
    const { bookingId, status, userId, chefId, message } = data;
    
    // Notify the user
    this.notifyUser(userId, 'booking-status-changed', {
      bookingId,
      status,
      message,
      timestamp: new Date().toISOString()
    });

    // Notify the chef
    if (chefId) {
      this.notifyUser(chefId, 'chef-booking-update', {
        bookingId,
        status,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Chef availability updates
  broadcastChefStatusUpdate(data) {
    const { chefId, isAvailable, location } = data;
    
    this.broadcast('chef-availability-changed', {
      chefId,
      isAvailable,
      location,
      timestamp: new Date().toISOString()
    });
  }

  // Real-time chat between users and chefs
  handleChatMessage(socket, data) {
    const { recipientId, message, bookingId } = data;
    
    // Send message to recipient
    this.notifyUser(recipientId, 'new-message', {
      senderId: socket.userId,
      message,
      bookingId,
      timestamp: new Date().toISOString()
    });

    // Send confirmation back to sender
    socket.emit('message-sent', {
      recipientId,
      message,
      timestamp: new Date().toISOString()
    });
  }

  // Location tracking for chef arrival
  handleLocationUpdate(socket, data) {
    const { bookingId, latitude, longitude, estimatedArrival } = data;
    
    // Notify user about chef's location
    this.broadcast('chef-location-update', {
      chefId: socket.userId,
      bookingId,
      latitude,
      longitude,
      estimatedArrival,
      timestamp: new Date().toISOString()
    });
  }

  // Payment status updates
  notifyPaymentUpdate(data) {
    const { userId, bookingId, status, amount } = data;
    
    this.notifyUser(userId, 'payment-status-update', {
      bookingId,
      status,
      amount,
      timestamp: new Date().toISOString()
    });
  }

  // New booking notifications for chefs
  notifyNewBooking(chefId, bookingData) {
    this.notifyUser(chefId, 'new-booking-request', {
      ...bookingData,
      timestamp: new Date().toISOString()
    });
  }

  // Review and rating notifications
  notifyNewReview(chefId, reviewData) {
    this.notifyUser(chefId, 'new-review', {
      ...reviewData,
      timestamp: new Date().toISOString()
    });
  }

  // System announcements
  broadcastAnnouncement(message, type = 'info') {
    this.broadcast('system-announcement', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

export default new SocketService();
