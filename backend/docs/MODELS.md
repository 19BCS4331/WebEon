# Database Models Documentation

## Overview
Documentation for database models and data structures in NewEonPgServer.

## Base Models

Located in `/models/base` directory, these models provide core functionality:
- Base database operations
- Common field definitions
- Shared validation rules

## Page-Specific Models

### Master Profiles
Models for master data management:
- Company profiles
- Branch profiles
- Department configurations
- User roles and permissions

### Party Profiles
Models for external party management:
- Client profiles
- Vendor profiles
- Partner information
- Contact details

### System Setup
System configuration models:
- Global settings
- System parameters
- Configuration templates
- Setup workflows

### Transactions
Transaction-related models:
- Financial transactions
- Order processing
- Payment records
- Transaction history

## Model Structure

Each model follows a standard structure:
```javascript
{
  tableName: 'table_name',
  fields: {
    // Field definitions
  },
  validations: {
    // Validation rules
  },
  relationships: {
    // Related models
  }
}
```

## Field Types

Common field types used across models:
- `STRING`: Text data
- `INTEGER`: Whole numbers
- `DECIMAL`: Decimal numbers
- `DATE`: Date values
- `BOOLEAN`: True/false values
- `JSON`: JSON data
- `ARRAY`: Array values

## Validation Rules

Standard validation rules:
- Required fields
- Data type validation
- Range validation
- Pattern matching
- Custom validations

## Relationships

Types of model relationships:
- One-to-One
- One-to-Many
- Many-to-Many
- Polymorphic relations

## Database Operations

Common operations:
```javascript
// Create
Model.create(data)

// Read
Model.findById(id)
Model.findAll(criteria)

// Update
Model.update(id, data)

// Delete
Model.delete(id)
```

## Best Practices

1. **Data Integrity**
   - Use appropriate data types
   - Implement validation rules
   - Maintain referential integrity

2. **Performance**
   - Index important fields
   - Optimize queries
   - Handle large datasets

3. **Security**
   - Sanitize input data
   - Implement access control
   - Protect sensitive data

## Error Handling

Standard error handling for models:
```javascript
try {
  // Database operation
} catch (error) {
  // Error handling
  logger.error(error);
  throw new DatabaseError(error.message);
}
```

## Model Updates

When updating models:
1. Document changes
2. Update validations
3. Test relationships
4. Verify migrations
5. Update related routes
