# Utilities Documentation

## Overview
Documentation for utility functions and helpers in NewEonPgServer.

## Query Builder (`queryBuilder.js`)

Utility for building SQL queries dynamically.

```javascript
const queryBuilder = require('../utils/queryBuilder');

// Example usage
const query = queryBuilder
  .select(['id', 'name'])
  .from('users')
  .where({ active: true })
  .build();
```

Features:
- Dynamic query construction
- Parameter binding
- SQL injection prevention
- Complex query support

## Table Configurations (`tableConfigs.js`)

Manages database table configurations.

```javascript
const tableConfigs = require('../utils/tableConfigs');

// Example usage
const userConfig = tableConfigs.getConfig('users');
```

Features:
- Table schemas
- Field definitions
- Relationship mappings
- Default values

## Data Transformation (`transformEmptyToNull.js`)

Handles data transformation between application and database.

```javascript
const transform = require('../utils/transformEmptyToNull');

// Example usage
const cleanData = transform(rawData);
```

Features:
- Empty string to NULL conversion
- Data type normalization
- Value sanitization
- Format standardization

## Best Practices

### Query Building
```javascript
// Good Practice
const query = queryBuilder
  .select()
  .from('table')
  .where('id = ?', [id])
  .build();

// Avoid
const query = `SELECT * FROM table WHERE id = ${id}`; // SQL injection risk
```

### Data Transformation
```javascript
// Good Practice
const cleanData = transform({
  name: '',
  age: '25',
  notes: null
});

// Result
{
  name: null,
  age: 25,
  notes: null
}
```

### Table Configuration
```javascript
// Good Practice
const config = {
  tableName: 'users',
  fields: {
    id: { type: 'INTEGER', primary: true },
    name: { type: 'STRING', required: true }
  }
};
```

## Error Handling

```javascript
try {
  const query = queryBuilder.build();
} catch (error) {
  logger.error('Query building error:', error);
  throw new QueryBuildError(error.message);
}
```

## Performance Considerations

1. **Query Builder**
   - Use appropriate indexes
   - Optimize JOIN operations
   - Limit result sets

2. **Data Transformation**
   - Batch processing for large datasets
   - Caching transformed values
   - Async processing when possible

3. **Table Configurations**
   - Cache configuration objects
   - Lazy loading of configs
   - Regular cleanup

## Security

1. **Query Building**
   - Parameter binding
   - Input validation
   - Escape special characters

2. **Data Transformation**
   - Data sanitization
   - Type checking
   - XSS prevention

3. **Configuration**
   - Secure storage
   - Access control
   - Validation rules

## Maintenance

- Regular updates
- Performance monitoring
- Error logging
- Documentation updates
