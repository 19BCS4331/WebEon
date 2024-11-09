# import pandas as pd
# from sqlalchemy import create_engine
# from sqlalchemy.engine import URL

# # MSSQL connection parameters
# mssql_params = {
#     'drivername': 'mssql+pyodbc',
#     'host': '101.53.148.243,9137',  # changed 'server' to 'host'
#     'username': 'mil',
#     'password': 'mil@1234#',
#     'database': 'wsgfmastUAT',
#     'query': {'driver': 'ODBC Driver 17 for SQL Server'}
# }

# # PostgreSQL connection parameters
# postgres_params = {
#     'drivername': 'postgresql',
#     'username': 'postgres',
#     'password': 'J1c2m@raekat',
#     'host': 'localhost',
#     'port': 5432,
#     'database': 'mil'
# }

# # Create engines
# mssql_engine = create_engine(URL.create(**mssql_params))
# postgres_engine = create_engine(URL.create(**postgres_params))

# # List of tables to migrate
# tables = ['mstpax']

# for table in tables:
#     # Read data from MSSQL
#     df = pd.read_sql_table(table, mssql_engine)
    
#     # Write data to PostgreSQL without double quotes around the table name
#     df.to_sql(table, postgres_engine, if_exists='append', index=False)

import pandas as pd
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL
import numpy as np

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

# Create engines
mssql_engine = create_engine(URL.create(**mssql_params))
postgres_engine = create_engine(URL.create(**postgres_params))

# List of tables to migrate
tables = ['mstpax']

def map_mssql_to_postgres_type(mssql_type):
    type_map = {
        'int': 'INTEGER',
        'bigint': 'BIGINT',
        'smallint': 'SMALLINT',
        'bit': 'BOOLEAN',
        'decimal': 'DECIMAL',
        'numeric': 'NUMERIC',
        'money': 'MONEY',
        'float': 'FLOAT',
        'real': 'REAL',
        'date': 'DATE',
        'datetime': 'TIMESTAMP',
        'smalldatetime': 'TIMESTAMP',
        'time': 'TIME',
        'char': 'CHAR',
        'varchar': 'VARCHAR',
        'text': 'TEXT',
        'nchar': 'CHAR',
        'nvarchar': 'VARCHAR',
        'ntext': 'TEXT'
    }
    return type_map.get(mssql_type.lower(), 'TEXT')

def add_missing_columns(table_name, mssql_engine, postgres_engine):
    mssql_columns = pd.read_sql_query(f"SELECT TOP 0 * FROM {table_name}", mssql_engine).columns
    inspector = inspect(postgres_engine)
    postgres_columns = [col['name'] for col in inspector.get_columns(table_name)]
    
    missing_columns = set(mssql_columns) - set(postgres_columns)
    with postgres_engine.connect() as conn:
        for col in missing_columns:
            col_type_query = f"""
                SELECT DATA_TYPE 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '{table_name}' AND COLUMN_NAME = '{col}'
            """
            col_type = pd.read_sql_query(col_type_query, mssql_engine).iloc[0, 0]
            postgres_col_type = map_mssql_to_postgres_type(col_type)
            
            alter_table_query = text(f'ALTER TABLE "{table_name}" ADD COLUMN "{col}" {postgres_col_type}')
            print(f'Executing: {alter_table_query}')
            try:
                conn.execute(alter_table_query)
            except Exception as e:
                print(f"Error adding column {col}: {e}")

for table in tables:
    # Ensure the table exists in PostgreSQL
    inspector = inspect(postgres_engine)
    if not inspector.has_table(table):
        print(f"Table {table} does not exist in PostgreSQL. Please create the table first.")
        continue
    
    # Add missing columns
    add_missing_columns(table, mssql_engine, postgres_engine)
    
    # Verify columns after adding
    postgres_columns = [col['name'] for col in inspect(postgres_engine).get_columns(table)]
    print(f"Columns in PostgreSQL table '{table}' after adding missing columns: {postgres_columns}")
    
 # Replace 'NaT' and 'nan' with None specifically for datetime columns
    df = pd.read_sql_table(table, mssql_engine, parse_dates=False)
    df = df.replace({pd.NaT: None, np.nan: None, 'NaT': None, 'nan': None})
    
    # Ensure numeric columns have integer zero instead of '0.0' where applicable
for col in df.columns:
    if pd.api.types.is_numeric_dtype(df[col]):
        df[col] = df[col].replace('0.0', 0).astype(object).where(df[col].notna(), None)
    elif pd.api.types.is_datetime64_any_dtype(df[col]):
        # Force NaT replacement in datetime columns
            df[col] = df[col].where(df[col].notna(), None)
    
    # Insert data into PostgreSQL with logging and debugging
    total_rows = len(df)
    # Insert data into PostgreSQL with better NaT handling
with postgres_engine.connect() as conn:
    for i, row in enumerate(df.itertuples(index=False)):
        row_dict = row._asdict()
        columns = ", ".join([f'"{col}"' for col in row_dict.keys()])
        values = ", ".join([f"'{v}'" if v is not None else "NULL" for v in row_dict.values()])
        insert_query = text(f'INSERT INTO "{table}" ({columns}) VALUES ({values})')
        
        try:
            conn.execute(insert_query)
        except Exception as e:
            print(f"Error inserting row {i + 1}: {e}")
        if (i + 1) % (total_rows // 10) == 0:
            print(f"Loading {table}: {((i + 1) / total_rows) * 100:.2f}% complete")

print("Completed loading table.")

print("Data migration completed.")