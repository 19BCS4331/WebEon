import pandas as pd
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL
from datetime import datetime
import logging
import sys

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# MSSQL connection parameters
mssql_params = {
    'drivername': 'mssql+pyodbc',
    'host': '101.53.148.243,9137',
    'username': 'mil',
    'password': 'mil@1234#',
    'database': 'wsgfmastUAT',
    'query': {'driver': 'ODBC Driver 17 for SQL Server'}
}

# PostgreSQL connection parameters
postgres_params = {
    'drivername': 'postgresql',
    'username': 'postgres',
    'password': 'J1c2m@raekat',
    'host': 'localhost',
    'port': 5432,
    'database': 'mil'
}

def map_mssql_to_postgres_type(mssql_type, length=None):
    """Map MSSQL data types to PostgreSQL data types"""
    type_map = {
        'int': 'INTEGER',
        'bigint': 'BIGINT',
        'smallint': 'SMALLINT',
        'tinyint': 'SMALLINT',
        'bit': 'BOOLEAN',
        'decimal': 'DECIMAL',
        'numeric': 'NUMERIC',
        'money': 'MONEY',
        'float': 'DOUBLE PRECISION',
        'real': 'REAL',
        'datetime': 'TIMESTAMP',
        'datetime2': 'TIMESTAMP',
        'smalldatetime': 'TIMESTAMP',
        'date': 'DATE',
        'time': 'TIME',
        'char': f'CHAR({length})' if length else 'CHAR',
        'varchar': f'VARCHAR({length})' if length else 'VARCHAR',
        'text': 'TEXT',
        'nchar': f'CHAR({length})' if length else 'CHAR',
        'nvarchar': f'VARCHAR({length})' if length else 'VARCHAR',
        'ntext': 'TEXT',
        'binary': 'BYTEA',
        'varbinary': 'BYTEA',
        'image': 'BYTEA',
        'uniqueidentifier': 'UUID'
    }
    
    # Convert the type to lowercase for case-insensitive matching
    mssql_type_lower = str(mssql_type).lower()
    
    # Handle types with precision/scale like decimal(18,2)
    if '(' in mssql_type_lower:
        base_type = mssql_type_lower.split('(')[0]
        if base_type in ['decimal', 'numeric']:
            return mssql_type_lower.replace('decimal', 'DECIMAL').replace('numeric', 'NUMERIC').upper()
    
    # Get the mapped type or default to TEXT
    return type_map.get(mssql_type_lower, 'TEXT')

def create_db_connections():
    """Create and test database connections"""
    try:
        mssql_engine = create_engine(URL.create(**mssql_params))
        postgres_engine = create_engine(URL.create(**postgres_params))
        
        # Test connections
        mssql_engine.connect()
        postgres_engine.connect()
        
        logging.info("Database connections established successfully")
        return mssql_engine, postgres_engine
    except Exception as e:
        logging.error(f"Failed to establish database connections: {str(e)}")
        raise

def get_table_schema(engine, table_name):
    """Get table schema information"""
    inspector = inspect(engine)
    return inspector.get_columns(table_name)

def get_primary_keys(mssql_engine, table_name):
    """Get primary key information for a table"""
    inspector = inspect(mssql_engine)
    return inspector.get_pk_constraint(table_name)

def get_foreign_keys(mssql_engine, table_name):
    """Get foreign key information for a table"""
    inspector = inspect(mssql_engine)
    return inspector.get_foreign_keys(table_name)

def get_indexes(mssql_engine, table_name):
    """Get index information for a table"""
    inspector = inspect(mssql_engine)
    return inspector.get_indexes(table_name)

def create_table_in_postgres(table_name, mssql_engine, postgres_engine):
    """Create table in PostgreSQL with proper schema"""
    try:
        inspector = inspect(mssql_engine)
        columns = inspector.get_columns(table_name)
        pk_constraint = get_primary_keys(mssql_engine, table_name)
        foreign_keys = get_foreign_keys(mssql_engine, table_name)
        indexes = get_indexes(mssql_engine, table_name)
        
        # Generate CREATE TABLE statement
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name.lower()} (\n"
        
        # Add columns
        column_definitions = []
        for column in columns:
            length = column.get('length')
            pg_type = map_mssql_to_postgres_type(column['type'], length)
            nullable = "NULL" if column['nullable'] else "NOT NULL"
            default = f"DEFAULT {column['default']}" if column.get('default') else ""
            
            column_def = f"    {column['name']} {pg_type} {nullable} {default}".strip()
            column_definitions.append(column_def)
        
        # Add primary key constraint
        if pk_constraint and pk_constraint['constrained_columns']:
            pk_cols = ', '.join(pk_constraint['constrained_columns'])
            column_definitions.append(f"    PRIMARY KEY ({pk_cols})")
        
        create_table_sql += ',\n'.join(column_definitions)
        create_table_sql += "\n);"
        
        # Create the table
        with postgres_engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
            
        # Create indexes (excluding primary key index)
        with postgres_engine.connect() as conn:
            for index in indexes:
                if not index.get('primary'):  # Skip primary key indexes
                    index_cols = ', '.join(index['column_names'])
                    index_unique = "UNIQUE" if index['unique'] else ""
                    index_name = f"{table_name.lower()}_{index['name'].lower()}"
                    index_sql = f"CREATE {index_unique} INDEX IF NOT EXISTS {index_name} ON {table_name.lower()} ({index_cols});"
                    conn.execute(text(index_sql))
                    conn.commit()
        
        # Add foreign key constraints
        with postgres_engine.connect() as conn:
            for fk in foreign_keys:
                constrained_cols = ', '.join(fk['constrained_columns'])
                referred_cols = ', '.join(fk['referred_columns'])
                fk_name = f"fk_{table_name.lower()}_{fk['name'].lower() if fk.get('name') else 'fkey'}"
                fk_sql = f"""
                ALTER TABLE {table_name.lower()}
                ADD CONSTRAINT {fk_name}
                FOREIGN KEY ({constrained_cols})
                REFERENCES {fk['referred_table'].lower()} ({referred_cols})
                ON DELETE {fk.get('ondelete', 'NO ACTION')}
                ON UPDATE {fk.get('onupdate', 'NO ACTION')};
                """
                try:
                    conn.execute(text(fk_sql))
                    conn.commit()
                except Exception as e:
                    logging.warning(f"Could not create foreign key {fk_name}: {str(e)}")
        
        logging.info(f"Successfully created table {table_name.lower()} in PostgreSQL")
        
    except Exception as e:
        logging.error(f"Error creating table {table_name}: {str(e)}")
        raise

def handle_data_types(df, source_schema):
    """Handle data type conversions"""
    for column in source_schema:
        col_name = column['name']
        if col_name not in df.columns:
            continue
            
        # Handle datetime columns
        if 'DATETIME' in str(column['type']).upper():
            df[col_name] = pd.to_datetime(df[col_name], errors='coerce')
            df[col_name] = df[col_name].where(df[col_name].notna(), None)
            
        # Handle numeric columns
        elif 'DECIMAL' in str(column['type']).upper() or 'NUMERIC' in str(column['type']).upper():
            df[col_name] = pd.to_numeric(df[col_name], errors='coerce')
            
    return df

def migrate_table(table_name, mssql_engine, postgres_engine, batch_size=1000):
    """Migrate a single table with batching"""
    try:
        logging.info(f"Starting migration of table: {table_name}")
        
        # Create table in PostgreSQL first
        create_table_in_postgres(table_name, mssql_engine, postgres_engine)
        
        # Get source schema
        source_schema = get_table_schema(mssql_engine, table_name)
        
        # Get total count
        count_query = f"SELECT COUNT(*) FROM {table_name}"
        total_rows = pd.read_sql(count_query, mssql_engine).iloc[0, 0]
        
        # Batch processing
        for offset in range(0, total_rows, batch_size):
            query = f"SELECT * FROM {table_name} ORDER BY (SELECT NULL) OFFSET {offset} ROWS FETCH NEXT {batch_size} ROWS ONLY"
            df_batch = pd.read_sql(query, mssql_engine)
            
            # Handle data types
            df_batch = handle_data_types(df_batch, source_schema)
            
            # Write to PostgreSQL
            df_batch.to_sql(
                table_name.lower(),  # PostgreSQL prefers lowercase table names
                postgres_engine,
                if_exists='append' if offset > 0 else 'replace',
                index=False
            )
            
            logging.info(f"Migrated {min(offset + batch_size, total_rows)}/{total_rows} rows for table {table_name}")
            
        logging.info(f"Successfully completed migration of table: {table_name}")
        
    except Exception as e:
        logging.error(f"Error migrating table {table_name}: {str(e)}")
        raise

def get_all_tables(mssql_engine):
    """Get list of all tables from MSSQL database"""
    try:
        inspector = inspect(mssql_engine)
        tables = inspector.get_table_names()
        logging.info(f"Found {len(tables)} tables in MSSQL database")
        return tables
    except Exception as e:
        logging.error(f"Error getting table list: {str(e)}")
        raise

def main():
    """Main migration function"""
    try:
        mssql_engine, postgres_engine = create_db_connections()
        
        # Get all tables from MSSQL
        all_tables = get_all_tables(mssql_engine)
        
        # You can either migrate all tables
        # tables = all_tables
        
        # Or specify specific tables to migrate
        tables = [
            'BookD',
            # Add more tables here
        ]
        
        for table in tables:
            migrate_table(table, mssql_engine, postgres_engine)
            
        logging.info("Migration completed successfully")
        
    except Exception as e:
        logging.error(f"Migration failed: {str(e)}")
        raise
    finally:
        if 'mssql_engine' in locals():
            mssql_engine.dispose()
        if 'postgres_engine' in locals():
            postgres_engine.dispose()

if __name__ == "__main__":
    main()
