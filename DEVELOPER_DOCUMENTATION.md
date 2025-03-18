# WebEon Developer Documentation

This documentation provides a comprehensive overview of the WebEon project, detailing its architecture, structure, and implementation details to help developers understand and contribute to the codebase effectively.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Frontend Architecture](#frontend-architecture)
   - [Component Structure](#component-structure)
   - [Routing](#routing)
   - [State Management](#state-management)
   - [Theme System](#theme-system)
   - [API Integration](#api-integration)
5. [Backend Architecture](#backend-architecture)
   - [Server Setup](#server-setup)
   - [Database Integration](#database-integration)
   - [Models](#models)
   - [Routes](#routes)
   - [Middleware](#middleware)
6. [Authentication and Security](#authentication-and-security)
7. [Development Guidelines](#development-guidelines)
8. [Common Patterns and Best Practices](#common-patterns-and-best-practices)

## Project Overview

WebEon is a comprehensive financial management system designed to handle various transactions, including currency exchange, buying/selling, and other financial operations. The application provides a robust platform for managing financial data with a user-friendly interface.

## Technology Stack

### Frontend
- **React**: Core library for building the user interface
- **React Router**: For navigation and routing
- **Material UI**: Component library for consistent UI design
- **Axios**: HTTP client for API requests
- **Context API**: For state management
- **Framer Motion**: For animations and transitions

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **PostgreSQL**: Relational database
- **Helmet**: Security middleware for Express
- **Cookie Parser**: Middleware for cookie handling
- **CORS**: Cross-Origin Resource Sharing middleware

## Project Structure

The project is organized into two main directories:

### Root Directory
```
/
├── NewEonPgServer/      # Backend server code
├── src/                 # Frontend React application
├── public/              # Static assets
├── PythonScripts/       # Python utility scripts
├── node_modules/        # Node.js dependencies
├── package.json         # Project dependencies and scripts
└── README.md            # Project documentation
```

## Frontend Architecture

The frontend is built with React and follows a modular approach to component organization. The application is structured as follows:

### Component Structure

```
src/
├── apis/                # API integration modules
├── assets/              # Static assets (images, colors, etc.)
├── components/          # Reusable UI components
│   ├── global/          # Global components used across the app
│   ├── Masters/         # Components for Master data screens
│   └── Transactions/    # Components for Transaction screens
├── contexts/            # React Context providers
├── css/                 # CSS stylesheets
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── Dashboard/       # Dashboard-related components
│   ├── Master/          # Master data management pages
│   │   ├── Master Profiles/
│   │   ├── Party Profiles/
│   │   ├── SystemSetup/
│   │   └── Miscellaneous/
│   └── Transactions/    # Transaction-related pages
│       ├── BuySellTransactions/
│       ├── OtherTransactions/
│       └── Transfers/
├── services/            # Service modules
├── App.js               # Main App component
├── index.js             # Application entry point
└── routes.js            # Route definitions
```

### Routing

The application uses React Router for navigation. Routes are defined in `src/routes.js`, which contains a comprehensive list of all routes in the application. The routes are organized by functional areas (Masters, Transactions, etc.) and are protected using the `ProtectedRoute` component.

Example route definition:
```javascript
const routes = [
  { path: "/", element: <LoginNew />, protected: false },
  { path: "/dashboard", element: <Dashboard />, protected: true },
  // Master routes
  { path: "/master/currency-profile", element: <CurrencyProfile />, protected: true },
  // Transaction routes
  { path: "/transactions/buy-sell/:With/:Type", element: <BuySellTransactions />, protected: true },
  // ...more routes
];
```

### State Management

The application uses React Context API for state management. Key contexts include:

1. **AuthContext**: Manages user authentication state
2. **ThemeContext**: Manages application theming
3. **ToastContext**: Manages toast notifications
4. **TransactionContext**: Manages transaction-related state

Example usage of context:
```javascript
// In a component
import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

const MyComponent = () => {
  const { Colortheme } = useContext(ThemeContext);
  
  return (
    <div style={{ backgroundColor: Colortheme.background, color: Colortheme.text }}>
      {/* Component content */}
    </div>
  );
};
```

### Theme System

The application implements a comprehensive theming system through the `ThemeContext`. Multiple theme options are available, each with light and dark variants. The theme context provides color values that are used throughout the application.

Key theme properties include:
- `background`: Main background color
- `secondaryBG`: Secondary background color
- `text`: Main text color
- `primary`: Primary accent color
- `secondary`: Secondary accent color

When creating or editing components, always use the Colortheme properties for consistent styling:

```javascript
// Example of using Colortheme in a component
const MyComponent = () => {
  const { Colortheme } = useContext(ThemeContext);
  
  return (
    <Box sx={{ 
      backgroundColor: Colortheme.background,
      color: Colortheme.text,
      borderColor: Colortheme.primary
    }}>
      {/* Component content */}
    </Box>
  );
};
```

### API Integration

The frontend communicates with the backend using Axios through a centralized `apiClient` service. API calls are organized by functional area.

Example API call:
```javascript
import { apiClient } from '../services/apiClient';

// Fetching data
const fetchData = async () => {
  try {
    const response = await apiClient.get('/pages/Transactions/getTransactions', {
      params: { vTrnwith, vTrntype }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
```

## Backend Architecture

The backend is built with Node.js and Express, following a modular architecture for maintainability and scalability.

### Server Setup

The main server configuration is in `NewEonPgServer/server.js`, which sets up Express, middleware, and routes.

```javascript
// Server setup
const app = express();
const port = process.env.PORT || 5002;

// Middleware
app.use(bodyParser.json());
app.use(cors({ /* CORS configuration */ }));
app.use(helmet({ /* Security configuration */ }));
app.use(cookieParser());
app.use(csrfMiddleware);

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/nav", navRoutes);
app.use("/pages/Master/MasterProfiles", MasterProfileRoutes);
app.use("/pages/Transactions", TransactionsRoutes);
// ...more routes
```

### Database Integration

The application uses PostgreSQL as its database, configured in `NewEonPgServer/config/db.js`:

```javascript
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

### Models

Models are organized in the `NewEonPgServer/models` directory, with a base model that provides common database operations:

```
models/
├── base/
│   └── BaseModel.js     # Base model with common database operations
└── pages/               # Domain-specific models
    ├── Dashboard/
    ├── Master/
    └── Transactions/
```

The `BaseModel` provides essential database operations:
- `executeQuery`: Executes a single SQL query
- `executeTransactionQuery`: Executes multiple queries in a transaction
- `generateCode`: Generates unique codes for entities
- `buildWhereClause`: Builds SQL WHERE clauses from conditions

When creating APIs, always use the functions from BaseModel.js:

```javascript
// Example model method
static async getTransactions(params) {
  try {
    const query = `SELECT * FROM "Transact" WHERE "vTrnwith" = $1 AND "vTrntype" = $2`;
    const values = [params.vTrnwith, params.vTrntype];
    return await this.executeQuery(query, values);
  } catch (error) {
    throw new DatabaseError("Failed to fetch transactions", error);
  }
}
```

### Routes

Routes are organized by domain in the `NewEonPgServer/routes` directory:

```
routes/
├── authRoutes.js        # Authentication routes
├── userRoutes.js        # User management routes
├── navRoutes.js         # Navigation routes
└── pages/               # Domain-specific routes
    ├── Dashboard/
    ├── Master/
    └── Transactions/
```

Example route implementation:
```javascript
// routes/pages/Transactions/index.js
const express = require("express");
const router = express.Router();
const TransactionController = require("../../../controllers/TransactionController");

// Get transactions
router.get("/getTransactions", TransactionController.getTransactions);

// Create transaction
router.post("/createTransaction", TransactionController.createTransaction);

module.exports = router;
```

### Middleware

The application uses several middleware components for security and functionality:

- **CSRF Protection**: Prevents cross-site request forgery attacks
- **Rate Limiting**: Prevents abuse through request rate limiting
- **Authentication**: Verifies user identity and permissions
- **Helmet**: Provides various HTTP headers for security

## Authentication and Security

The application implements several security measures:

1. **JWT Authentication**: JSON Web Tokens for user authentication
2. **CSRF Protection**: Prevents cross-site request forgery
3. **Helmet**: Sets security-related HTTP headers
4. **Rate Limiting**: Prevents abuse through request rate limiting
5. **CORS Configuration**: Controls cross-origin resource sharing

## Development Guidelines

When developing for WebEon, follow these guidelines:

1. **Code Organization**: Keep code organized according to the existing structure
2. **API Development**: 
   - Always use functions from `BaseModel.js` (executeQuery, executeTransactionQuery, etc.)
   - Implement proper error handling and validation
   - Follow the existing pattern for route and controller organization

3. **Frontend Development**:
   - Always use the Colortheme context for styling components
   - Follow the existing component structure and patterns
   - Use context API for state management
   - Implement proper error handling for API calls

4. **Security Considerations**:
   - Never expose sensitive information in client-side code
   - Always validate user input on both client and server sides
   - Use the authentication middleware for protected routes

## Common Patterns and Best Practices

### Transaction Flow

The application follows a multi-step approach for transactions:

1. **Basic Details**: Initial transaction information
2. **Party Details**: Customer/party information
3. **Agent/Reference Details**: Optional agent or reference information
4. **Transaction Details**: Specific transaction data
5. **Charges and Payments**: Fee and payment information
6. **Review and Submit**: Final review and submission

### Error Handling

Error handling follows a consistent pattern:

```javascript
// Backend error handling
try {
  // Operation
} catch (error) {
  throw new DatabaseError("Descriptive error message", error);
}

// Frontend error handling
try {
  // API call
} catch (error) {
  console.error("Error description:", error);
  showToast("error", "User-friendly error message");
}
```

### Data Fetching

Data fetching follows a consistent pattern:

```javascript
// In a React component
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, [dependencies]);
```

---

This documentation provides an overview of the WebEon project structure and architecture. For specific implementation details, refer to the codebase and comments within the code.
