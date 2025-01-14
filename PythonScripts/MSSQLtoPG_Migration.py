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
    # 'database': 'WAPR24AHMDUAT',
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
