# Soketi Real-time Integration Plan

## 🎯 Overview

This document outlines the plan to integrate Soketi as the real-time communication solution for Bhavya Bazaar, replacing the problematic WebSocket implementation.

## 📋 Background

### Issues with Previous WebSocket Implementation:
- ❌ Deployment errors on production
- ❌ Connection stability issues
- ❌ Complex server-side setup
- ❌ Nginx proxy configuration problems

### Why Soketi:
- ✅ Available as managed service on Coolify
- ✅ Pusher-compatible API (mature ecosystem)
- ✅ Easy deployment and scaling
- ✅ No complex server-side setup required
- ✅ Built-in authentication and authorization

## 🏗️ Implementation Plan

### Phase 1: Soketi Service Setup
**Timeline**: 1-2 days

#### 1.1 Coolify Deployment
- [ ] Deploy Soketi service on Coolify
- [ ] Configure environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Test service connectivity

#### 1.2 Service Configuration
```javascript
// Example Soketi configuration
const soketiConfig = {
  app_id: process.env.SOKETI_APP_ID,
  key: process.env.SOKETI_APP_KEY,
  secret: process.env.SOKETI_APP_SECRET,
  cluster: process.env.SOKETI_CLUSTER,
  host: process.env.SOKETI_HOST,
  port: process.env.SOKETI_PORT,
  useTLS: true
};
```

### Phase 2: Frontend Integration
**Timeline**: 2-3 days

#### 2.1 Install Pusher Client Library
```bash
npm install pusher-js
```

#### 2.2 Create Soketi Client Service
```javascript
// src/utils/soketiClient.js
import Pusher from 'pusher-js';

class SoketiClient {
  constructor() {
    this.pusher = new Pusher(process.env.REACT_APP_SOKETI_KEY, {
      wsHost: process.env.REACT_APP_SOKETI_HOST,
      wsPort: process.env.REACT_APP_SOKETI_PORT,
      forceTLS: true,
      disableStats: true,
      cluster: process.env.REACT_APP_SOKETI_CLUSTER
    });
  }

  subscribeToChannel(channelName, eventHandlers) {
    const channel = this.pusher.subscribe(channelName);
    
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      channel.bind(event, handler);
    });
    
    return channel;
  }

  unsubscribeFromChannel(channelName) {
    this.pusher.unsubscribe(channelName);
  }
}

export default new SoketiClient();
```

#### 2.3 Update Components for Real-time Features

##### Messaging System Enhancement
- [ ] Update `DashboardMessages.jsx` for real-time message delivery
- [ ] Update `UserInbox.jsx` for live notifications
- [ ] Add typing indicators
- [ ] Add online/offline presence

##### Admin Dashboard Enhancement
- [ ] Live order updates
- [ ] Real-time user statistics
- [ ] Live seller activity monitoring
- [ ] System alerts and notifications

##### Seller Dashboard Enhancement
- [ ] Real-time order notifications
- [ ] Live inventory alerts
- [ ] Customer message notifications

### Phase 3: Backend Integration
**Timeline**: 2-3 days

#### 3.1 Install Pusher Server Library
```bash
cd backend
npm install pusher
```

#### 3.2 Create Soketi Server Service
```javascript
// backend/utils/soketiServer.js
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.SOKETI_APP_ID,
  key: process.env.SOKETI_APP_KEY,
  secret: process.env.SOKETI_APP_SECRET,
  cluster: process.env.SOKETI_CLUSTER,
  host: process.env.SOKETI_HOST,
  port: process.env.SOKETI_PORT,
  useTLS: true
});

module.exports = pusher;
```

#### 3.3 Update API Endpoints for Real-time Events

##### Message Controller Updates
```javascript
// Trigger real-time message delivery
await pusher.trigger(`chat-${conversationId}`, 'new-message', {
  message: newMessage,
  sender: senderId,
  timestamp: Date.now()
});
```

##### Order Controller Updates
```javascript
// Notify seller of new order
await pusher.trigger(`seller-${sellerId}`, 'new-order', orderData);

// Notify customer of order status change
await pusher.trigger(`customer-${customerId}`, 'order-update', {
  orderId,
  status: newStatus,
  message: statusMessage
});
```

### Phase 4: Channel Architecture
**Timeline**: 1-2 days

#### 4.1 Channel Naming Convention
- `user-{userId}` - Personal notifications
- `seller-{sellerId}` - Seller-specific updates
- `admin` - Admin dashboard updates
- `chat-{conversationId}` - Message conversations
- `order-{orderId}` - Order-specific updates
- `public` - System-wide announcements

#### 4.2 Authentication & Authorization
```javascript
// Backend: Channel authentication endpoint
app.post('/api/v2/soketi/auth', authenticateUser, (req, res) => {
  const { socket_id, channel_name } = req.body;
  const user = req.user;

  // Validate user access to channel
  if (channel_name.startsWith(`user-${user._id}`) || 
      channel_name.startsWith(`seller-${user._id}`)) {
    
    const auth = pusher.authenticate(socket_id, channel_name);
    res.send(auth);
  } else {
    res.status(403).send('Forbidden');
  }
});
```

### Phase 5: Event System Design
**Timeline**: 2-3 days

#### 5.1 Event Types
- **Messages**: `new-message`, `typing-start`, `typing-stop`
- **Orders**: `new-order`, `order-update`, `payment-received`
- **Products**: `stock-low`, `product-approved`, `product-rejected`
- **Users**: `user-online`, `user-offline`
- **Admin**: `new-user`, `new-seller`, `system-alert`

#### 5.2 Event Payloads
```javascript
// Example event payloads
const eventPayloads = {
  'new-message': {
    messageId: 'string',
    conversationId: 'string',
    senderId: 'string',
    content: 'string',
    timestamp: 'number',
    type: 'text|image|file'
  },
  
  'order-update': {
    orderId: 'string',
    status: 'string',
    message: 'string',
    timestamp: 'number',
    estimatedDelivery: 'date'
  },
  
  'stock-low': {
    productId: 'string',
    productName: 'string',
    currentStock: 'number',
    threshold: 'number'
  }
};
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```bash
REACT_APP_SOKETI_KEY=your_app_key
REACT_APP_SOKETI_HOST=your_soketi_host
REACT_APP_SOKETI_PORT=443
REACT_APP_SOKETI_CLUSTER=mt1
```

#### Backend (.env)
```bash
SOKETI_APP_ID=your_app_id
SOKETI_APP_KEY=your_app_key
SOKETI_APP_SECRET=your_app_secret
SOKETI_HOST=your_soketi_host
SOKETI_PORT=443
SOKETI_CLUSTER=mt1
```

## 🧪 Testing Strategy

### 1. Connection Testing
- [ ] Verify Soketi service connectivity
- [ ] Test channel subscription/unsubscription
- [ ] Validate authentication flow

### 2. Feature Testing
- [ ] Real-time message delivery
- [ ] Order status notifications
- [ ] Admin dashboard updates
- [ ] Presence indicators

### 3. Load Testing
- [ ] Multiple concurrent connections
- [ ] High-frequency message delivery
- [ ] Channel scaling limits

## 🚀 Deployment

### 1. Coolify Service Deployment
- [ ] Create Soketi service in Coolify
- [ ] Configure service settings
- [ ] Set up monitoring and alerts
- [ ] Test service health endpoints

### 2. Application Deployment
- [ ] Update environment variables
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Test end-to-end functionality

## 📊 Monitoring

### 1. Service Metrics
- Connection count
- Message throughput
- Channel subscriptions
- Error rates

### 2. Application Metrics
- Real-time feature usage
- Message delivery success rate
- User engagement with live features

## 🔄 Fallback Strategy

### If Soketi is Unavailable:
1. **Graceful Degradation**: Fall back to HTTP polling
2. **User Notification**: Inform users of reduced functionality
3. **Retry Logic**: Automatic reconnection attempts
4. **Manual Refresh**: Option for users to manually refresh

```javascript
// Example fallback implementation
class RealTimeManager {
  constructor() {
    this.soketiConnected = false;
    this.fallbackInterval = null;
  }

  connect() {
    try {
      this.soketi = new SoketiClient();
      this.soketiConnected = true;
      this.clearFallback();
    } catch (error) {
      this.enableFallback();
    }
  }

  enableFallback() {
    this.fallbackInterval = setInterval(() => {
      this.pollForUpdates();
    }, 10000); // Poll every 10 seconds
  }

  clearFallback() {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }
}
```

## ✅ Success Criteria

- [ ] Soketi service deployed and stable on Coolify
- [ ] Real-time messaging working without errors
- [ ] Order notifications delivered instantly
- [ ] Admin dashboard showing live metrics
- [ ] No deployment issues or connection problems
- [ ] Performance better than or equal to HTTP-only version
- [ ] Graceful fallback working when service unavailable

## 📚 Documentation

### For Developers:
- API documentation for real-time events
- Channel authentication guide
- Testing procedures
- Troubleshooting guide

### For Users:
- Real-time features overview
- What to expect from live notifications
- How to enable/disable real-time features

---

**Priority**: High - This will restore real-time functionality without the deployment issues that plagued the WebSocket implementation.
