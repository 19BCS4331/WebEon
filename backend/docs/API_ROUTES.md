# API Routes Documentation

## Overview
This document details all API routes in the NewEonPgServer application.

## Core Routes

### Authentication Routes (`authRoutes.js`)
Authentication and authorization endpoints.

```javascript
POST /auth/login          // User login
POST /auth/logout         // User logout
POST /auth/refresh-token  // Refresh JWT token
```

### User Routes (`userRoutes.js`)
User management endpoints.

```javascript
GET    /user/profile      // Get user profile
PUT    /user/profile      // Update user profile
POST   /user/password     // Change password
```

### Navigation Routes (`navRoutes.js`)
Navigation and menu-related endpoints.

```javascript
GET    /nav/menu          // Get navigation menu
GET    /nav/permissions   // Get user permissions
```

### AI Routes (`aiRoutes.js`)
AI-powered functionality endpoints.

```javascript
POST   /api/ai/process    // Process AI requests
GET    /api/ai/status     // Check AI process status
```

## Page-Specific Routes

### Master Profiles
Routes for managing master profiles and configurations.

```javascript
GET    /pages/Master/MasterProfiles/*    // Master profile operations
POST   /pages/Master/MasterProfiles/*    // Create master profile
PUT    /pages/Master/MasterProfiles/*    // Update master profile
DELETE /pages/Master/MasterProfiles/*    // Delete master profile
```

### Party Profiles
Routes for managing party/client profiles.

```javascript
GET    /pages/Master/PartyProfiles/*     // Party profile operations
POST   /pages/Master/PartyProfiles/*     // Create party profile
PUT    /pages/Master/PartyProfiles/*     // Update party profile
DELETE /pages/Master/PartyProfiles/*     // Delete party profile
```

### System Setup
System configuration routes.

```javascript
GET    /pages/Master/SystemSetup/*       // System setup operations
POST   /pages/Master/SystemSetup/*       // Create system config
PUT    /pages/Master/SystemSetup/*       // Update system config
```

### Transactions
Transaction management routes.

```javascript
GET    /pages/Transactions/*             // Transaction operations
POST   /pages/Transactions/*             // Create transaction
PUT    /pages/Transactions/*             // Update transaction
DELETE /pages/Transactions/*             // Delete transaction
```

## Route Configuration

Routes are configured using `routes-config.json` which defines:
- Route paths
- Required permissions
- Validation rules
- Request/Response schemas

## Authentication

Most routes require authentication via JWT token:
- Token should be included in Authorization header
- Format: `Authorization: Bearer <token>`
- Token expiration: 1 hour

## Error Responses

Standard error response format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## Rate Limiting

- Default limit: 100 requests per 15 minutes
- Applies to all API endpoints
- Custom limits for specific routes
