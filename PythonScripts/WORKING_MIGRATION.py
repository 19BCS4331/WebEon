# import pandas as pd
# import numpy as np
# from sqlalchemy import create_engine, inspect, text, Integer, BigInteger, Boolean, String, DateTime, TIMESTAMP
# from sqlalchemy.engine import URL
# from datetime import datetime
# import logging
# import sys

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
#         logging.StreamHandler(sys.stdout)
#     ]
# )

# # MSSQL connection parameters
# mssql_params = {
#     'drivername': 'mssql+pyodbc',
#     'host': '101.53.148.243,9137',
#     'username': 'mil',
#     'password': 'mil@1234#',
#     # 'database': 'wsgfmastUAT',
#     'database': 'WAPR24AHMDUAT',
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

# def get_column_info(mssql_engine, table_name):
#     """Get detailed column information from MSSQL"""
#     # Get basic column info and primary key info
#     base_query = """
#     SELECT 
#         c.name AS column_name,
#         t.name AS data_type,
#         c.max_length,
#         c.precision,
#         c.scale,
#         c.is_nullable,
#         CAST(COLUMNPROPERTY(c.object_id, c.name, 'IsIdentity') AS bit) as is_identity,
#         CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key,
#         OBJECT_DEFINITION(c.default_object_id) as default_definition
#     FROM sys.columns c
#     INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
#     LEFT JOIN (
#         SELECT ic.column_id, ic.object_id
#         FROM sys.index_columns ic
#         INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
#         WHERE i.is_primary_key = 1
#     ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
#     WHERE c.object_id = OBJECT_ID(:table_name)
#     """
    
#     with mssql_engine.connect() as conn:
#         # Get basic column info
#         result = conn.execute(text(base_query), {"table_name": table_name}).fetchall()
        
#         # Combine the information
#         columns = {}
#         for row in result:
#             col_name = row[0]
#             is_identity = bool(row[6])
#             is_primary = bool(row[7])
#             default_def = row[8]
            
#             col_info = {
#                 'name': col_name,
#                 'type': row[1],
#                 'length': row[2],
#                 'precision': row[3],
#                 'scale': row[4],
#                 'nullable': row[5],
#                 'is_identity': is_identity,
#                 'is_primary_key': is_primary,
#                 'default': default_def
#             }
            
#             # Log identity column details
#             if is_identity:
#                 logging.info(f"Found identity column: {col_name}")
#                 logging.info(f"Column details: type={row[1]}, is_primary={is_primary}, nullable={row[5]}")
            
#             columns[col_name] = col_info
        
#         return columns

# def map_mssql_to_postgres_type(column_info):
#     """Map MSSQL data types to PostgreSQL data types"""
#     mssql_type = str(column_info['type']).lower()
#     length = column_info['length']
#     precision = column_info['precision']
#     scale = column_info['scale']
#     is_identity = column_info['is_identity']
    
#     # Log identity column type mapping
#     if is_identity:
#         logging.info(f"Mapping identity column type: {mssql_type}")
#         logging.info(f"Column info: {column_info}")
    
#     # Handle IDENTITY columns first
#     if is_identity:
#         if mssql_type == 'bigint':
#             logging.info("Mapping to BIGSERIAL")
#             return 'BIGSERIAL'
#         logging.info("Mapping to SERIAL")
#         return 'SERIAL'
    
#     # Handle other types
#     mapped_type = None
#     if mssql_type == 'varchar' or mssql_type == 'nvarchar':
#         if mssql_type == 'nvarchar':
#             length = length // 2 if length != -1 else None
#         mapped_type = f'VARCHAR({length})' if length and length != -1 else 'TEXT'
#     elif mssql_type == 'char' or mssql_type == 'nchar':
#         if mssql_type == 'nchar':
#             length = length // 2
#         mapped_type = f'CHAR({length})'
#     elif mssql_type == 'int':
#         mapped_type = 'INTEGER'
#     elif mssql_type == 'bigint':
#         mapped_type = 'BIGINT'
#     elif mssql_type == 'smallint':
#         mapped_type = 'SMALLINT'
#     elif mssql_type == 'tinyint':
#         mapped_type = 'SMALLINT'
#     elif mssql_type == 'bit':
#         mapped_type = 'BOOLEAN'
#     elif mssql_type in ('decimal', 'numeric'):
#         if precision and scale:
#             mapped_type = f'DECIMAL({precision},{scale})'
#         mapped_type = 'DECIMAL'
#     elif mssql_type == 'money':
#         mapped_type = 'MONEY'
#     elif mssql_type == 'float':
#         mapped_type = 'DOUBLE PRECISION'
#     elif mssql_type == 'real':
#         mapped_type = 'REAL'
#     elif mssql_type in ('datetime', 'datetime2', 'smalldatetime'):
#         mapped_type = 'TIMESTAMP'
#     elif mssql_type == 'date':
#         mapped_type = 'DATE'
#     elif mssql_type == 'time':
#         mapped_type = 'TIME'
#     elif mssql_type in ('text', 'ntext'):
#         mapped_type = 'TEXT'
#     elif mssql_type in ('image', 'binary', 'varbinary'):
#         mapped_type = 'BYTEA'
#     elif mssql_type == 'uniqueidentifier':
#         mapped_type = 'UUID'
#     elif mssql_type == 'sql_variant':
#         mapped_type = 'TEXT'
#     else:
#         mapped_type = 'TEXT'
    
#     if is_identity:
#         logging.info(f"Final mapped type for identity column: {mapped_type}")
    
#     return mapped_type

# def create_table_in_postgres(table_name, mssql_engine, postgres_engine):
#     """Create table in PostgreSQL with the same schema as MSSQL"""
#     try:
#         columns = get_column_info(mssql_engine, table_name)
        
#         # Generate column definitions
#         column_defs = []
#         identity_column = None
        
#         for col_name, col_info in columns.items():
#             if col_info['is_identity']:
#                 identity_column = col_name
            
#             if col_info['is_identity']:
#                 logging.info(f"Processing identity column {col_name} for table creation")
            
#             pg_type = map_mssql_to_postgres_type(col_info)
#             nullable = "NULL" if col_info['nullable'] else "NOT NULL"
#             default = ""
            
#             # Handle identity/serial columns
#             if col_info['is_identity'] and col_info['is_primary_key']:
#                 # For identity columns that are also primary keys, use SERIAL PRIMARY KEY
#                 if pg_type == 'BIGSERIAL':
#                     col_def = f'"{col_name}" BIGSERIAL PRIMARY KEY'
#                 else:
#                     col_def = f'"{col_name}" SERIAL PRIMARY KEY'
#                 logging.info(f"Created identity column definition: {col_def}")
#             elif col_info['is_identity']:
#                 # For identity columns that are not primary keys
#                 if pg_type == 'BIGSERIAL':
#                     col_def = f'"{col_name}" BIGSERIAL {nullable}'
#                 else:
#                     col_def = f'"{col_name}" SERIAL {nullable}'
#                 logging.info(f"Created identity column definition: {col_def}")
#             else:
#                 # Handle default values
#                 if col_info['default'] is not None:
#                     default_val = col_info['default']
#                     if pg_type == 'BOOLEAN':
#                         default_val = 'true' if default_val in ('1', 'true') else 'false'
#                     elif pg_type in ('INTEGER', 'BIGINT', 'SMALLINT'):
#                         default_val = str(default_val)
#                     elif pg_type.startswith('VARCHAR') or pg_type == 'TEXT':
#                         default_val = f"'{default_val}'"
#                     default = f" DEFAULT {default_val}"
                
#                 col_def = f'"{col_name}" {pg_type} {nullable}{default}'
            
#             column_defs.append(col_def)
        
#         # First, drop the table and its dependencies
#         drop_table_sql = f'DROP TABLE IF EXISTS public."{table_name}" CASCADE;'
        
#         # Create the table with explicit schema
#         create_table_sql = f'CREATE TABLE public."{table_name}" ('
#         create_table_sql += '\n    ' + ',\n    '.join(column_defs)
#         create_table_sql += '\n);'
        
#         # Set the owner
#         set_owner_sql = f'ALTER TABLE public."{table_name}" OWNER TO postgres;'
        
#         logging.info(f"Table creation SQL:\n{create_table_sql}")
        
#         with postgres_engine.connect() as conn:
#             # Drop existing table
#             logging.info(f"Dropping existing table {table_name}")
#             conn.execute(text(drop_table_sql))
            
#             # Create new table
#             logging.info(f"Creating table {table_name}")
#             conn.execute(text(create_table_sql))
            
#             # Set owner
#             conn.execute(text(set_owner_sql))
            
#             # Verify the sequence was created and is owned by the table
#             if identity_column:
#                 verify_sql = f"""
#                 SELECT pg_get_serial_sequence('public."{table_name}"', '{identity_column}') IS NOT NULL as has_sequence;
#                 """
#                 result = conn.execute(text(verify_sql)).fetchone()
#                 logging.info(f"Sequence verification result for column {identity_column}: {result}")
#                 if not result or not result[0]:
#                     raise Exception(f"Failed to create sequence for column {identity_column} in table {table_name}")
            
#             conn.commit()
            
#         logging.info(f'Successfully created table "{table_name}" in PostgreSQL')
        
#     except Exception as e:
#         logging.error(f"Error creating table {table_name}: {str(e)}")
#         raise

# def get_primary_keys(mssql_engine, table_name):
#     """Get primary key information for a table"""
#     inspector = inspect(mssql_engine)
#     return inspector.get_pk_constraint(table_name)

# def get_foreign_keys(mssql_engine, table_name):
#     """Get foreign key information for a table"""
#     inspector = inspect(mssql_engine)
#     return inspector.get_foreign_keys(table_name)

# def get_indexes(mssql_engine, table_name):
#     """Get index information for a table"""
#     inspector = inspect(mssql_engine)
#     return inspector.get_indexes(table_name)

# def create_db_connections():
#     """Create and test database connections"""
#     try:
#         mssql_engine = create_engine(URL.create(**mssql_params))
#         postgres_engine = create_engine(URL.create(**postgres_params))
        
#         # Test connections
#         mssql_engine.connect()
#         postgres_engine.connect()
        
#         logging.info("Database connections established successfully")
#         return mssql_engine, postgres_engine
#     except Exception as e:
#         logging.error(f"Failed to establish database connections: {str(e)}")
#         raise

# def get_table_schema(engine, table_name):
#     """Get table schema information"""
#     inspector = inspect(engine)
#     return inspector.get_columns(table_name)

# def handle_data_types(df, source_schema):
#     """Handle data type conversions"""
#     for col_name, column in source_schema.items():
#         if col_name not in df.columns:
#             continue
        
#         # Get the PostgreSQL type for this column
#         pg_type = map_mssql_to_postgres_type(column)
        
#         # Handle boolean (bit) fields
#         if pg_type == 'BOOLEAN':
#             df[col_name] = df[col_name].map({1: True, 0: False, '1': True, '0': False})
        
#         # Handle numeric fields
#         elif pg_type in ('INTEGER', 'BIGINT', 'SMALLINT', 'DECIMAL', 'NUMERIC'):
#             df[col_name] = pd.to_numeric(df[col_name], errors='coerce')
        
#         # Handle timestamp fields
#         elif pg_type == 'TIMESTAMP':
#             df[col_name] = pd.to_datetime(df[col_name], errors='coerce')
        
#         # Handle string fields
#         elif pg_type in ('VARCHAR', 'CHAR', 'TEXT'):
#             df[col_name] = df[col_name].astype(str)
    
#     return df

# def migrate_table(table_name, mssql_engine, postgres_engine):
#     """Migrate a single table from MSSQL to PostgreSQL"""
#     try:
#         logging.info(f"Starting migration of table: {table_name}")
        
#         # Create table in PostgreSQL
#         create_table_in_postgres(table_name, mssql_engine, postgres_engine)
        
#         # Get column information for type mapping during data transfer
#         columns = get_column_info(mssql_engine, table_name)
        
#         # Prepare column list, excluding identity columns for INSERT
#         insert_columns = []
#         identity_column = None
#         for col_name, col_info in columns.items():
#             if col_info['is_identity']:
#                 identity_column = col_name
#             else:
#                 insert_columns.append(f'"{col_name}"')
        
#         # Fetch data from MSSQL
#         select_columns = [f'"{col}"' for col in columns.keys()]
#         select_sql = f'SELECT {", ".join(select_columns)} FROM {table_name}'
        
#         with mssql_engine.connect() as mssql_conn:
#             # Read data in chunks
#             chunk_size = 1000
#             offset = 0
#             total_rows = 0
            
#             while True:
#                 # Fetch a chunk of data
#                 chunk_sql = f"{select_sql} ORDER BY (SELECT NULL) OFFSET {offset} ROWS FETCH NEXT {chunk_size} ROWS ONLY"
#                 chunk_df = pd.read_sql(chunk_sql, mssql_conn)
                
#                 if chunk_df.empty:
#                     break
                
#                 # Insert data into PostgreSQL
#                 if not chunk_df.empty:
#                     with postgres_engine.connect() as pg_conn:
#                         # Skip identity column in the INSERT
#                         insert_cols = [col for col in chunk_df.columns if col != identity_column]
                        
#                         # Process each row
#                         for _, row in chunk_df.iterrows():
#                             # Create a dictionary of values for this row
#                             row_dict = {}
#                             for col in insert_cols:
#                                 value = row[col]
#                                 if pd.isna(value):
#                                     row_dict[col] = None
#                                 else:
#                                     row_dict[col] = value
                            
#                             # Generate INSERT statement with parameter binding
#                             insert_sql = f'''
#                             INSERT INTO public."{table_name}" ({', '.join(f'"{col}"' for col in insert_cols)})
#                             VALUES ({', '.join(f':{col}' for col in insert_cols)})
#                             '''
                            
#                             # Execute insert with dictionary parameters
#                             pg_conn.execute(text(insert_sql), row_dict)
                        
#                         pg_conn.commit()
                
#                 total_rows += len(chunk_df)
#                 offset += chunk_size
#                 logging.info(f"Migrated {total_rows} rows for table {table_name}")
        
#         logging.info(f"Successfully completed migration of table: {table_name}")
        
#     except Exception as e:
#         logging.error(f"Error migrating table {table_name}: {str(e)}")
#         raise

# def get_all_tables(mssql_engine):
#     """Get list of all tables from MSSQL database"""
#     try:
#         inspector = inspect(mssql_engine)
#         tables = inspector.get_table_names()
#         logging.info(f"Found {len(tables)} tables in MSSQL database")
#         return tables
#     except Exception as e:
#         logging.error(f"Error getting table list: {str(e)}")
#         raise

# def main():
#     """Main migration function"""
#     try:
#         mssql_engine, postgres_engine = create_db_connections()
        
#         # Get all tables from MSSQL
#         all_tables = get_all_tables(mssql_engine)
        
#         # You can either migrate all tables
#         # tables = all_tables
        
#         # Or specify specific tables to migrate
#         tables = [
#             'BookD',
#             # Add more tables here
#         ]
        
#         for table in tables:
#             migrate_table(table, mssql_engine, postgres_engine)
            
#         logging.info("Migration completed successfully")
        
#     except Exception as e:
#         logging.error(f"Migration failed: {str(e)}")
#         raise
#     finally:
#         if 'mssql_engine' in locals():
#             mssql_engine.dispose()
#         if 'postgres_engine' in locals():
#             postgres_engine.dispose()

# if __name__ == "__main__":
#     main()



# WORKING WITH FOREIGN KEY 



# import pandas as pd
# import numpy as np
# from sqlalchemy import create_engine, inspect, text, Integer, BigInteger, Boolean, String, DateTime, TIMESTAMP
# from sqlalchemy.engine import URL
# from datetime import datetime
# import logging
# import sys

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
#         logging.StreamHandler(sys.stdout)
#     ]
# )

# # MSSQL connection parameters
# mssql_params = {
#     'drivername': 'mssql+pyodbc',
#     'host': '101.53.148.243,9137',
#     'username': 'mil',
#     'password': 'mil@1234#',
#     # 'database': 'wsgfmastUAT',
#     'database': 'WAPR24AHMDUAT',
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

# def get_column_info(mssql_engine, table_name):
#     """Get detailed column information from MSSQL"""
#     # Get basic column info and primary key info
#     base_query = """
#     SELECT 
#         c.name AS column_name,
#         t.name AS data_type,
#         c.max_length,
#         c.precision,
#         c.scale,
#         c.is_nullable,
#         CAST(COLUMNPROPERTY(c.object_id, c.name, 'IsIdentity') AS bit) as is_identity,
#         CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key,
#         OBJECT_DEFINITION(c.default_object_id) as default_definition
#     FROM sys.columns c
#     INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
#     LEFT JOIN (
#         SELECT ic.column_id, ic.object_id
#         FROM sys.index_columns ic
#         INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
#         WHERE i.is_primary_key = 1
#     ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
#     WHERE c.object_id = OBJECT_ID(:table_name)
#     """
    
#     with mssql_engine.connect() as conn:
#         # Get basic column info
#         result = conn.execute(text(base_query), {"table_name": table_name}).fetchall()
        
#         # Combine the information
#         columns = {}
#         for row in result:
#             col_name = row[0]
#             is_identity = bool(row[6])
#             is_primary = bool(row[7])
#             default_def = row[8]
            
#             col_info = {
#                 'name': col_name,
#                 'type': row[1],
#                 'length': row[2],
#                 'precision': row[3],
#                 'scale': row[4],
#                 'nullable': row[5],
#                 'is_identity': is_identity,
#                 'is_primary_key': is_primary,
#                 'default': default_def
#             }
            
#             # Log identity column details
#             if is_identity:
#                 logging.info(f"Found identity column: {col_name}")
#                 logging.info(f"Column details: type={row[1]}, is_primary={is_primary}, nullable={row[5]}")
            
#             columns[col_name] = col_info
        
#         return columns

# def map_mssql_to_postgres_type(col_info):
#     """Map MSSQL data type to PostgreSQL data type"""
#     mssql_type = col_info['type'].lower()
#     length = col_info.get('length')
#     precision = col_info.get('precision')
#     scale = col_info.get('scale')
    
#     # Log the mapping process for identity columns
#     if col_info['is_identity']:
#         logging.info(f"Mapping identity column type: {mssql_type}")
#         logging.info(f"Column info: {col_info}")
    
#     # Handle different data types
#     if mssql_type in ('varchar', 'nvarchar', 'char', 'nchar'):
#         if length == -1:  # MAX
#             return 'TEXT'
#         return f'VARCHAR({length})'
    
#     elif mssql_type in ('text', 'ntext'):
#         return 'TEXT'
    
#     elif mssql_type == 'bit':
#         return 'BOOLEAN'
    
#     elif mssql_type == 'datetime':
#         return 'TIMESTAMP'
    
#     elif mssql_type == 'date':
#         return 'DATE'
    
#     elif mssql_type == 'time':
#         return 'TIME'
    
#     elif mssql_type == 'money':
#         return 'DECIMAL(19,4)'
    
#     elif mssql_type == 'decimal':
#         return f'DECIMAL({precision},{scale})'
    
#     elif mssql_type == 'float':
#         return 'DOUBLE PRECISION'
    
#     elif mssql_type == 'real':
#         return 'REAL'
    
#     elif mssql_type == 'uniqueidentifier':
#         return 'UUID'
    
#     elif mssql_type == 'varbinary':
#         if length == -1:  # MAX
#             return 'BYTEA'
#         return 'BYTEA'
    
#     elif mssql_type == 'image':
#         return 'BYTEA'
        
#     elif mssql_type == 'int':
#         # Don't convert to SERIAL/BIGSERIAL here
#         return 'INTEGER'
        
#     elif mssql_type == 'bigint':
#         return 'BIGINT'
        
#     elif mssql_type == 'smallint':
#         return 'SMALLINT'
        
#     elif mssql_type == 'tinyint':
#         return 'SMALLINT'
    
#     # Default to TEXT for unknown types
#     logging.warning(f"Unknown type {mssql_type} - defaulting to TEXT")
#     return 'TEXT'

# def get_constraints_info(mssql_engine, table_name):
#     """Get all constraints for a table from MSSQL"""
#     # First get foreign key constraints
#     fk_query = """
#     SELECT 
#         fk.name AS constraint_name,
#         'F' as constraint_type,
#         c.name AS column_name,
#         rc.name AS referenced_column,
#         OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
#         NULL as check_definition,
#         0 as is_unique,
#         0 as is_primary_key,
#         0 as is_unique_constraint,
#         fk.delete_referential_action as delete_action,
#         fk.update_referential_action as update_action
#     FROM sys.foreign_keys fk
#     INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
#     INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
#     INNER JOIN sys.columns rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
#     WHERE fk.parent_object_id = OBJECT_ID(:table_name)
#     """
    
#     # Then get other constraints (PK, Check, Unique)
#     other_constraints_query = """
#     SELECT 
#         con.name AS constraint_name,
#         con.[type] as constraint_type,
#         col.name AS column_name,
#         NULL AS referenced_column,
#         NULL AS referenced_table,
#         chk.definition AS check_definition,
#         ISNULL(ind.is_unique, 0) as is_unique,
#         ISNULL(ind.is_primary_key, 0) as is_primary_key,
#         ISNULL(ind.is_unique_constraint, 0) as is_unique_constraint,
#         NULL as delete_action,
#         NULL as update_action
#     FROM sys.objects con
#     LEFT JOIN sys.check_constraints chk ON chk.object_id = con.object_id
#     LEFT JOIN sys.index_columns ic ON ic.object_id = con.parent_object_id AND ic.index_id = 1
#     LEFT JOIN sys.columns col ON col.object_id = con.parent_object_id AND col.column_id = ic.column_id
#     LEFT JOIN sys.indexes ind ON ind.object_id = con.parent_object_id AND ind.name = con.name
#     WHERE con.parent_object_id = OBJECT_ID(:table_name)
#     AND con.[type] IN ('PK', 'UQ', 'C')
#     """
    
#     with mssql_engine.connect() as conn:
#         fk_constraints = conn.execute(text(fk_query), {"table_name": table_name}).fetchall()
#         other_constraints = conn.execute(text(other_constraints_query), {"table_name": table_name}).fetchall()
        
#         # Combine all constraints
#         all_constraints = list(fk_constraints) + list(other_constraints)
        
#         # Log the constraints found
#         logging.info(f"Found constraints for table {table_name}:")
#         for con in all_constraints:
#             if con.constraint_type == 'F':
#                 action_map = {
#                     0: 'NO ACTION',
#                     1: 'CASCADE',
#                     2: 'SET NULL',
#                     3: 'SET DEFAULT'
#                 }
#                 delete_action = action_map.get(con.delete_action, 'NO ACTION')
#                 update_action = action_map.get(con.update_action, 'NO ACTION')
#                 logging.info(f"Foreign Key: {con.constraint_name} - {con.column_name} references {con.referenced_table}.{con.referenced_column}")
#                 logging.info(f"  ON DELETE {delete_action}, ON UPDATE {update_action}")
#             elif con.constraint_type == 'PK':
#                 logging.info(f"Primary Key: {con.constraint_name} on {con.column_name}")
#             elif con.constraint_type == 'UQ':
#                 logging.info(f"Unique: {con.constraint_name} on {con.column_name}")
#             elif con.constraint_type == 'C':
#                 logging.info(f"Check: {con.constraint_name} - {con.check_definition}")
        
#         return all_constraints

# def create_table_in_postgres(table_name, mssql_engine, postgres_engine):
#     """Create table in PostgreSQL with the same schema as MSSQL"""
#     try:
#         columns = get_column_info(mssql_engine, table_name)
#         constraints = get_constraints_info(mssql_engine, table_name)
        
#         # Generate column definitions
#         column_defs = []
#         identity_columns = []
        
#         for col_name, col_info in columns.items():
#             if col_info['is_identity']:
#                 identity_columns.append(col_name)
#                 logging.info(f"Found identity column: {col_name}")
#                 logging.info(f"Column details: type={col_info['type']}, is_primary={col_info['is_primary_key']}, nullable={col_info['nullable']}")
            
#             pg_type = map_mssql_to_postgres_type(col_info)
#             nullable = "NULL" if col_info['nullable'] else "NOT NULL"
#             default = ""
            
#             # Handle default values
#             if col_info['default'] is not None:
#                 default_val = col_info['default']
#                 if pg_type == 'BOOLEAN':
#                     default_val = 'true' if default_val in ('1', 'true') else 'false'
#                 elif pg_type in ('INTEGER', 'BIGINT', 'SMALLINT'):
#                     default_val = str(default_val)
#                 elif pg_type.startswith('VARCHAR') or pg_type == 'TEXT':
#                     default_val = f"'{default_val}'"
#                 default = f" DEFAULT {default_val}"
            
#             # For identity columns, just create as INTEGER/BIGINT initially
#             if col_info['is_identity'] and col_info['is_primary_key']:
#                 col_def = f'"{col_name}" {pg_type} PRIMARY KEY'
#             else:
#                 col_def = f'"{col_name}" {pg_type} {nullable}{default}'
            
#             column_defs.append(col_def)
        
#         # Generate constraint definitions
#         constraint_defs = []
#         for constraint in constraints:
#             con_name = constraint.constraint_name
#             con_type = constraint.constraint_type
            
#             if con_type == 'F':  # Foreign Key
#                 ref_table = constraint.referenced_table
#                 ref_col = constraint.referenced_column
#                 col_name = constraint.column_name
                
#                 # Map referential actions
#                 action_map = {
#                     0: 'NO ACTION',
#                     1: 'CASCADE',
#                     2: 'SET NULL',
#                     3: 'SET DEFAULT'
#                 }
#                 delete_action = action_map.get(constraint.delete_action, 'NO ACTION')
#                 update_action = action_map.get(constraint.update_action, 'NO ACTION')
                
#                 con_def = f'CONSTRAINT "{con_name}" FOREIGN KEY ("{col_name}") ' \
#                          f'REFERENCES public."{ref_table}" ("{ref_col}") ' \
#                          f'ON DELETE {delete_action} ON UPDATE {update_action}'
                         
#                 logging.info(f"Adding foreign key constraint: {con_def}")
#                 constraint_defs.append(con_def)
            
#             elif con_type == 'UQ':  # Unique Constraint
#                 col_name = constraint.column_name
#                 con_def = f'CONSTRAINT "{con_name}" UNIQUE ("{col_name}")'
#                 logging.info(f"Adding unique constraint: {con_def}")
#                 constraint_defs.append(con_def)
            
#             elif con_type == 'C':  # Check Constraint
#                 check_def = constraint.check_definition
#                 if check_def:
#                     # Convert MSSQL check syntax to PostgreSQL
#                     check_def = check_def.replace('dbo.', 'public.')
#                     con_def = f'CONSTRAINT "{con_name}" CHECK ({check_def})'
#                     logging.info(f"Adding check constraint: {con_def}")
#                     constraint_defs.append(con_def)
        
#         # First, drop the table and its dependencies
#         drop_table_sql = f'DROP TABLE IF EXISTS public."{table_name}" CASCADE;'
        
#         # Create the table with explicit schema
#         create_table_sql = f'CREATE TABLE public."{table_name}" ('
#         create_table_sql += '\n    ' + ',\n    '.join(column_defs)
#         if constraint_defs:
#             create_table_sql += ',\n    ' + ',\n    '.join(constraint_defs)
#         create_table_sql += '\n);'
        
#         logging.info(f"Table creation SQL:\n{create_table_sql}")
        
#         with postgres_engine.connect() as conn:
#             # Drop existing table
#             logging.info(f"Dropping existing table {table_name}")
#             conn.execute(text(drop_table_sql))
            
#             # Create new table
#             logging.info(f"Creating table {table_name}")
#             conn.execute(text(create_table_sql))
            
#             # Set owner
#             set_owner_sql = f'ALTER TABLE public."{table_name}" OWNER TO postgres;'
#             conn.execute(text(set_owner_sql))
            
#             conn.commit()
            
#         return identity_columns
        
#     except Exception as e:
#         logging.error(f"Error creating table {table_name}: {str(e)}")
#         raise

# def get_row_count(engine, table_name):
#     """Get the total number of rows in a table"""
#     try:
#         with engine.connect() as conn:
#             result = conn.execute(text(f'SELECT COUNT(*) FROM [{table_name}]')).scalar()
#             return result
#     except Exception as e:
#         logging.error(f"Error getting row count for table {table_name}: {str(e)}")
#         return 0

# def format_time(seconds):
#     """Format time in seconds to a human-readable string"""
#     if seconds < 60:
#         return f"{seconds:.0f} seconds"
#     elif seconds < 3600:
#         minutes = seconds / 60
#         return f"{minutes:.1f} minutes"
#     else:
#         hours = seconds / 3600
#         return f"{hours:.1f} hours"

# def migrate_table(table_name, mssql_engine, postgres_engine, table_number, total_tables):
#     """Migrate a single table from MSSQL to PostgreSQL"""
#     try:
#         start_time = datetime.now()
        
#         # Get total row count for progress tracking
#         total_rows = get_row_count(mssql_engine, table_name)
#         logging.info(f"Table {table_name} has {total_rows:,} rows to migrate")
        
#         # Create table in PostgreSQL and get identity columns
#         logging.info(f"[{table_number}/{total_tables}] Creating table structure for {table_name}")
#         identity_columns = create_table_in_postgres(table_name, mssql_engine, postgres_engine)
        
#         # Get column info to identify boolean columns
#         columns = get_column_info(mssql_engine, table_name)
#         boolean_columns = [col_name for col_name, col_info in columns.items() 
#                          if col_info['type'].lower() == 'bit']
        
#         # Get data from MSSQL in chunks for better memory management and progress tracking
#         chunk_size = 5000
#         processed_rows = 0
        
#         logging.info(f"Starting data migration for table {table_name}")
        
#         for chunk_start in range(0, total_rows, chunk_size):
#             chunk_end = min(chunk_start + chunk_size, total_rows)
            
#             # Calculate progress percentage and time estimates
#             progress = (processed_rows / total_rows) * 100 if total_rows > 0 else 100
#             elapsed_time = (datetime.now() - start_time).total_seconds()
            
#             if processed_rows > 0:
#                 rows_per_second = processed_rows / elapsed_time
#                 remaining_rows = total_rows - processed_rows
#                 estimated_remaining_time = remaining_rows / rows_per_second if rows_per_second > 0 else 0
                
#                 logging.info(
#                     f"Progress: {progress:.1f}% ({processed_rows:,}/{total_rows:,} rows) | "
#                     f"Table {table_number}/{total_tables} | "
#                     f"Elapsed: {format_time(elapsed_time)} | "
#                     f"Remaining: {format_time(estimated_remaining_time)}"
#                 )
            
#             # Fetch chunk of data
#             select_query = f"""
#                 SELECT * FROM [{table_name}]
#                 ORDER BY (SELECT NULL)
#                 OFFSET {chunk_start} ROWS 
#                 FETCH NEXT {chunk_size} ROWS ONLY
#             """
            
#             with mssql_engine.connect() as conn:
#                 df = pd.read_sql(select_query, conn)
            
#             if df.empty:
#                 break
            
#             # Convert bit columns to boolean
#             for col in boolean_columns:
#                 if col in df.columns:
#                     df[col] = df[col].map({1: True, 0: False, '1': True, '0': False, None: None})
            
#             # Write to PostgreSQL
#             with postgres_engine.connect() as conn:
#                 df.to_sql(table_name, conn, if_exists='append', index=False, schema='public')
            
#             processed_rows += len(df)
        
#         # Handle sequences for identity columns
#         if identity_columns:
#             logging.info(f"Setting up sequences for {len(identity_columns)} identity columns")
            
#             with postgres_engine.connect() as conn:
#                 for identity_column in identity_columns:
#                     # Get the maximum value
#                     max_id_query = f'SELECT COALESCE(MAX("{identity_column}"), 0) FROM public."{table_name}";'
#                     max_id = conn.execute(text(max_id_query)).scalar()
                    
#                     # Create sequence
#                     seq_name = f'{table_name}_{identity_column}_seq'
#                     create_seq_sql = f'CREATE SEQUENCE IF NOT EXISTS public."{seq_name}" START WITH {max_id + 1};'
#                     conn.execute(text(create_seq_sql))
                    
#                     # Set column default
#                     alter_col_sql = f'''ALTER TABLE public."{table_name}" 
#                         ALTER COLUMN "{identity_column}" 
#                         SET DEFAULT nextval('public."{seq_name}"');'''
#                     conn.execute(text(alter_col_sql))
                    
#                     # Set sequence owned by column
#                     set_owned_sql = f'ALTER SEQUENCE public."{seq_name}" OWNED BY public."{table_name}"."{identity_column}";'
#                     conn.execute(text(set_owned_sql))
                    
#                     logging.info(f"Created sequence public.{seq_name} starting from {max_id + 1}")
                
#                 conn.commit()
        
#         # Log completion time and statistics
#         end_time = datetime.now()
#         total_time = (end_time - start_time).total_seconds()
#         rows_per_second = total_rows / total_time if total_time > 0 else 0
        
#         logging.info(
#             f"Completed migration of table {table_name} "
#             f"({total_rows:,} rows in {format_time(total_time)}, "
#             f"{rows_per_second:.1f} rows/second)"
#         )
        
#     except Exception as e:
#         logging.error(f"Error migrating table {table_name}: {str(e)}")
#         raise

# def get_all_tables(mssql_engine):
#     """Get list of all tables from MSSQL database"""
#     try:
#         inspector = inspect(mssql_engine)
#         tables = inspector.get_table_names()
#         logging.info(f"Found {len(tables)} tables in MSSQL database")
#         return tables
#     except Exception as e:
#         logging.error(f"Error getting table list: {str(e)}")
#         raise

# def main():
#     """Main migration function"""
#     try:
#         start_time = datetime.now()
#         mssql_engine, postgres_engine = create_db_connections()
        
#         # Get all tables from MSSQL
#         all_tables = get_all_tables(mssql_engine)
        
#         # You can either migrate all tables
#         # tables = all_tables
        
#         # Or specify specific tables to migrate
#         tables = [
#             'BookH',
#             'BookD',
#             # Add more tables here
#         ]
        
#         total_tables = len(tables)
#         logging.info(f"Starting migration of {total_tables} tables")
        
#         # Get total row count across all tables
#         total_rows = sum(get_row_count(mssql_engine, table) for table in tables)
#         logging.info(f"Total rows to migrate: {total_rows:,}")
        
#         # Migrate each table
#         for i, table in enumerate(tables, 1):
#             migrate_table(table, mssql_engine, postgres_engine, i, total_tables)
        
#         # Log overall completion time and statistics
#         end_time = datetime.now()
#         total_time = (end_time - start_time).total_seconds()
#         rows_per_second = total_rows / total_time if total_time > 0 else 0
        
#         logging.info(
#             f"\nMigration completed successfully!\n"
#             f"Total tables: {total_tables}\n"
#             f"Total rows: {total_rows:,}\n"
#             f"Total time: {format_time(total_time)}\n"
#             f"Average speed: {rows_per_second:.1f} rows/second"
#         )
        
#     except Exception as e:
#         logging.error(f"Migration failed: {str(e)}")
#         raise
#     finally:
#         if 'mssql_engine' in locals():
#             mssql_engine.dispose()
#         if 'postgres_engine' in locals():
#             postgres_engine.dispose()

# def create_db_connections():
#     """Create and test database connections"""
#     try:
#         mssql_engine = create_engine(URL.create(**mssql_params))
#         postgres_engine = create_engine(URL.create(**postgres_params))
        
#         # Test connections
#         mssql_engine.connect()
#         postgres_engine.connect()
        
#         logging.info("Database connections established successfully")
#         return mssql_engine, postgres_engine
#     except Exception as e:
#         logging.error(f"Failed to establish database connections: {str(e)}")
#         raise

# if __name__ == "__main__":
#     main()














# WORKING WITH FOREIGN KEY v2


# import pandas as pd
# import numpy as np
# from sqlalchemy import create_engine, inspect, text, Integer, BigInteger, Boolean, String, DateTime, TIMESTAMP
# from sqlalchemy.engine import URL
# from datetime import datetime
# import logging
# import sys

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     handlers=[
#         logging.FileHandler(f'migration_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
#         logging.StreamHandler(sys.stdout)
#     ]
# )

# # MSSQL connection parameters
# mssql_params = {
#     'drivername': 'mssql+pyodbc',
#     'host': '101.53.148.243,9137',
#     'username': 'mil',
#     'password': 'mil@1234#',
#     # 'database': 'wsgfmastUAT',
#     'database': 'WAPR24AHMDUAT',
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

# def get_column_info(mssql_engine, table_name):
#     """Get detailed column information from MSSQL"""
#     # Get basic column info and primary key info
#     base_query = """
#     SELECT 
#         c.name AS column_name,
#         t.name AS data_type,
#         c.max_length,
#         c.precision,
#         c.scale,
#         c.is_nullable,
#         CAST(COLUMNPROPERTY(c.object_id, c.name, 'IsIdentity') AS bit) as is_identity,
#         CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key,
#         OBJECT_DEFINITION(c.default_object_id) as default_definition
#     FROM sys.columns c
#     INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
#     LEFT JOIN (
#         SELECT ic.column_id, ic.object_id
#         FROM sys.index_columns ic
#         INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
#         WHERE i.is_primary_key = 1
#     ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
#     WHERE c.object_id = OBJECT_ID(:table_name)
#     """
    
#     with mssql_engine.connect() as conn:
#         # Get basic column info
#         result = conn.execute(text(base_query), {"table_name": table_name}).fetchall()
        
#         # Combine the information
#         columns = {}
#         for row in result:
#             col_name = row[0]
#             is_identity = bool(row[6])
#             is_primary = bool(row[7])
#             default_def = row[8]
            
#             col_info = {
#                 'name': col_name,
#                 'type': row[1],
#                 'length': row[2],
#                 'precision': row[3],
#                 'scale': row[4],
#                 'nullable': row[5],
#                 'is_identity': is_identity,
#                 'is_primary_key': is_primary,
#                 'default': default_def
#             }
            
#             # Log identity column details
#             if is_identity:
#                 logging.info(f"Found identity column: {col_name}")
#                 logging.info(f"Column details: type={row[1]}, is_primary={is_primary}, nullable={row[5]}")
            
#             columns[col_name] = col_info
        
#         return columns

# def map_mssql_to_postgres_type(col_info):
#     """Map MSSQL data type to PostgreSQL data type"""
#     mssql_type = col_info['type'].lower()
#     length = col_info.get('length')
#     precision = col_info.get('precision')
#     scale = col_info.get('scale')
    
#     # Log the mapping process for identity columns
#     if col_info['is_identity']:
#         logging.info(f"Mapping identity column type: {mssql_type}")
#         logging.info(f"Column info: {col_info}")
    
#     # Handle different data types
#     if mssql_type in ('varchar', 'nvarchar', 'char', 'nchar'):
#         if length == -1:  # MAX
#             return 'TEXT'
#         return f'VARCHAR({length})'
    
#     elif mssql_type in ('text', 'ntext'):
#         return 'TEXT'
    
#     elif mssql_type == 'bit':
#         return 'BOOLEAN'
    
#     elif mssql_type == 'datetime':
#         return 'TIMESTAMP'
    
#     elif mssql_type == 'date':
#         return 'DATE'
    
#     elif mssql_type == 'time':
#         return 'TIME'
    
#     elif mssql_type == 'money':
#         return 'DECIMAL(19,4)'
    
#     elif mssql_type == 'decimal':
#         return f'DECIMAL({precision},{scale})'
    
#     elif mssql_type == 'float':
#         return 'DOUBLE PRECISION'
    
#     elif mssql_type == 'real':
#         return 'REAL'
    
#     elif mssql_type == 'uniqueidentifier':
#         return 'UUID'
    
#     elif mssql_type == 'varbinary':
#         if length == -1:  # MAX
#             return 'BYTEA'
#         return 'BYTEA'
    
#     elif mssql_type == 'image':
#         return 'BYTEA'
        
#     elif mssql_type == 'int':
#         # Don't convert to SERIAL/BIGSERIAL here
#         return 'INTEGER'
        
#     elif mssql_type == 'bigint':
#         return 'BIGINT'
        
#     elif mssql_type == 'smallint':
#         return 'SMALLINT'
        
#     elif mssql_type == 'tinyint':
#         return 'SMALLINT'
    
#     # Default to TEXT for unknown types
#     logging.warning(f"Unknown type {mssql_type} - defaulting to TEXT")
#     return 'TEXT'

# def get_constraints_info(mssql_engine, table_name):
#     """Get all constraints for a table from MSSQL"""
#     # First get foreign key constraints
#     fk_query = text("""
#     SELECT 
#         fk.name AS constraint_name,
#         'F' as constraint_type,
#         c.name AS column_name,
#         rc.name AS referenced_column,
#         OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
#         NULL as check_definition,
#         0 as is_unique,
#         0 as is_primary_key,
#         0 as is_unique_constraint,
#         CASE fk.delete_referential_action
#             WHEN 0 THEN 'NO ACTION'
#             WHEN 1 THEN 'CASCADE'
#             WHEN 2 THEN 'SET NULL'
#             WHEN 3 THEN 'SET DEFAULT'
#             ELSE 'NO ACTION'
#         END as delete_action,
#         CASE fk.update_referential_action
#             WHEN 0 THEN 'NO ACTION'
#             WHEN 1 THEN 'CASCADE'
#             WHEN 2 THEN 'SET NULL'
#             WHEN 3 THEN 'SET DEFAULT'
#             ELSE 'NO ACTION'
#         END as update_action
#     FROM sys.foreign_keys fk
#     INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
#     INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
#     INNER JOIN sys.columns rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
#     WHERE fk.parent_object_id = OBJECT_ID(:table_name)
#     """)
    
#     # Then get other constraints (PK, Check, Unique)
#     other_constraints_query = """
#     SELECT 
#         con.name AS constraint_name,
#         con.[type] as constraint_type,
#         col.name AS column_name,
#         NULL AS referenced_column,
#         NULL AS referenced_table,
#         chk.definition AS check_definition,
#         ISNULL(ind.is_unique, 0) as is_unique,
#         ISNULL(ind.is_primary_key, 0) as is_primary_key,
#         ISNULL(ind.is_unique_constraint, 0) as is_unique_constraint,
#         NULL as delete_action,
#         NULL as update_action
#     FROM sys.objects con
#     LEFT JOIN sys.check_constraints chk ON chk.object_id = con.object_id
#     LEFT JOIN sys.index_columns ic ON ic.object_id = con.parent_object_id AND ic.index_id = 1
#     LEFT JOIN sys.columns col ON col.object_id = con.parent_object_id AND col.column_id = ic.column_id
#     LEFT JOIN sys.indexes ind ON ind.object_id = con.parent_object_id AND ind.name = con.name
#     WHERE con.parent_object_id = OBJECT_ID(:table_name)
#     AND con.[type] IN ('PK', 'UQ', 'C')
#     """
    
#     with mssql_engine.connect() as conn:
#         fk_constraints = conn.execute(fk_query, {"table_name": table_name}).fetchall()
#         other_constraints = conn.execute(text(other_constraints_query), {"table_name": table_name}).fetchall()
        
#         # Combine all constraints
#         all_constraints = list(fk_constraints) + list(other_constraints)
        
#         # Log the constraints found
#         logging.info(f"Found constraints for table {table_name}:")
#         for con in all_constraints:
#             if con.constraint_type == 'F':
#                 logging.info(f"Foreign Key: {con.constraint_name} - {con.column_name} references {con.referenced_table}.{con.referenced_column}")
#                 logging.info(f"  ON DELETE {con.delete_action}, ON UPDATE {con.update_action}")
#             elif con.constraint_type == 'PK':
#                 logging.info(f"Primary Key: {con.constraint_name} on {con.column_name}")
#             elif con.constraint_type == 'UQ':
#                 logging.info(f"Unique: {con.constraint_name} on {con.column_name}")
#             elif con.constraint_type == 'C':
#                 logging.info(f"Check: {con.constraint_name} - {con.check_definition}")
        
#         return all_constraints

# def create_table_in_postgres(table_name, mssql_engine, postgres_engine):
#     """Create table in PostgreSQL with the same schema as MSSQL"""
#     try:
#         columns = get_column_info(mssql_engine, table_name)
#         constraints = get_constraints_info(mssql_engine, table_name)
        
#         # Generate column definitions
#         column_defs = []
#         identity_columns = []
        
#         for col_name, col_info in columns.items():
#             if col_info['is_identity']:
#                 identity_columns.append(col_name)
#                 logging.info(f"Found identity column: {col_name}")
#                 logging.info(f"Column details: type={col_info['type']}, is_primary={col_info['is_primary_key']}, nullable={col_info['nullable']}")
            
#             pg_type = map_mssql_to_postgres_type(col_info)
#             nullable = "NULL" if col_info['nullable'] else "NOT NULL"
#             default = ""
            
#             # Handle default values
#             if col_info['default'] is not None:
#                 default_val = col_info['default']
#                 if pg_type == 'BOOLEAN':
#                     default_val = 'true' if default_val in ('1', 'true') else 'false'
#                 elif pg_type in ('INTEGER', 'BIGINT', 'SMALLINT'):
#                     default_val = str(default_val)
#                 elif pg_type.startswith('VARCHAR') or pg_type == 'TEXT':
#                     default_val = f"'{default_val}'"
#                 default = f" DEFAULT {default_val}"
            
#             # For identity columns, just create as INTEGER/BIGINT initially
#             if col_info['is_identity'] and col_info['is_primary_key']:
#                 col_def = f'"{col_name}" {pg_type} PRIMARY KEY'
#             else:
#                 col_def = f'"{col_name}" {pg_type} {nullable}{default}'
            
#             column_defs.append(col_def)
        
#         # Generate constraint definitions
#         constraint_defs = []
#         for constraint in constraints:
#             con_name = constraint.constraint_name
#             con_type = constraint.constraint_type
            
#             if con_type == 'F':  # Foreign Key
#                 ref_table = constraint.referenced_table
#                 ref_col = constraint.referenced_column
#                 col_name = constraint.column_name
                
#                 # Map referential actions
#                 action_map = {
#                     0: 'NO ACTION',
#                     1: 'CASCADE',
#                     2: 'SET NULL',
#                     3: 'SET DEFAULT'
#                 }
#                 delete_action = action_map.get(constraint.delete_action, 'NO ACTION')
#                 update_action = action_map.get(constraint.update_action, 'NO ACTION')
                
#                 con_def = f'CONSTRAINT "{con_name}" FOREIGN KEY ("{col_name}") ' \
#                          f'REFERENCES public."{ref_table}" ("{ref_col}") ' \
#                          f'ON DELETE {delete_action} ON UPDATE {update_action}'
                         
#                 logging.info(f"Adding foreign key constraint: {con_def}")
#                 constraint_defs.append(con_def)
            
#             elif con_type == 'UQ':  # Unique Constraint
#                 col_name = constraint.column_name
#                 con_def = f'CONSTRAINT "{con_name}" UNIQUE ("{col_name}")'
#                 logging.info(f"Adding unique constraint: {con_def}")
#                 constraint_defs.append(con_def)
            
#             elif con_type == 'C':  # Check Constraint
#                 check_def = constraint.check_definition
#                 if check_def:
#                     # Convert MSSQL check syntax to PostgreSQL
#                     check_def = check_def.replace('dbo.', 'public.')
#                     con_def = f'CONSTRAINT "{con_name}" CHECK ({check_def})'
#                     logging.info(f"Adding check constraint: {con_def}")
#                     constraint_defs.append(con_def)
        
#         # First, drop the table and its dependencies
#         drop_table_sql = f'DROP TABLE IF EXISTS public."{table_name}" CASCADE;'
        
#         # Create the table with explicit schema
#         create_table_sql = f'CREATE TABLE public."{table_name}" ('
#         create_table_sql += '\n    ' + ',\n    '.join(column_defs)
#         if constraint_defs:
#             create_table_sql += ',\n    ' + ',\n    '.join(constraint_defs)
#         create_table_sql += '\n);'
        
#         logging.info(f"Table creation SQL:\n{create_table_sql}")
        
#         with postgres_engine.connect() as conn:
#             # Drop existing table
#             logging.info(f"Dropping existing table {table_name}")
#             conn.execute(text(drop_table_sql))
            
#             # Create new table
#             logging.info(f"Creating table {table_name}")
#             conn.execute(text(create_table_sql))
            
#             # Set owner
#             set_owner_sql = f'ALTER TABLE public."{table_name}" OWNER TO postgres;'
#             conn.execute(text(set_owner_sql))
            
#             conn.commit()
            
#         return identity_columns
        
#     except Exception as e:
#         logging.error(f"Error creating table {table_name}: {str(e)}")
#         raise

# def get_row_count(engine, table_name):
#     """Get the total number of rows in a table"""
#     try:
#         with engine.connect() as conn:
#             result = conn.execute(text(f'SELECT COUNT(*) FROM [{table_name}]')).scalar()
#             return result
#     except Exception as e:
#         logging.error(f"Error getting row count for table {table_name}: {str(e)}")
#         return 0

# def format_time(seconds):
#     """Format time in seconds to a human-readable string"""
#     if seconds < 60:
#         return f"{seconds:.0f} seconds"
#     elif seconds < 3600:
#         minutes = seconds / 60
#         return f"{minutes:.1f} minutes"
#     else:
#         hours = seconds / 3600
#         return f"{hours:.1f} hours"

# def migrate_table(table_name, mssql_engine, postgres_engine, table_number, total_tables):
#     """Migrate a single table from MSSQL to PostgreSQL"""
#     try:
#         start_time = datetime.now()
        
#         # Get total row count for progress tracking
#         total_rows = get_row_count(mssql_engine, table_name)
#         logging.info(f"Table {table_name} has {total_rows:,} rows to migrate")
        
#         # Create table in PostgreSQL and get identity columns
#         logging.info(f"[{table_number}/{total_tables}] Creating table structure for {table_name}")
#         identity_columns = create_table_in_postgres(table_name, mssql_engine, postgres_engine)
        
#         # Get column info to identify boolean columns
#         columns = get_column_info(mssql_engine, table_name)
#         boolean_columns = [col_name for col_name, col_info in columns.items() 
#                          if col_info['type'].lower() == 'bit']
        
#         # Get data from MSSQL in chunks for better memory management and progress tracking
#         chunk_size = 5000
#         processed_rows = 0
        
#         logging.info(f"Starting data migration for table {table_name}")
        
#         for chunk_start in range(0, total_rows, chunk_size):
#             chunk_end = min(chunk_start + chunk_size, total_rows)
            
#             # Calculate progress percentage and time estimates
#             progress = (processed_rows / total_rows) * 100 if total_rows > 0 else 100
#             elapsed_time = (datetime.now() - start_time).total_seconds()
            
#             if processed_rows > 0:
#                 rows_per_second = processed_rows / elapsed_time
#                 remaining_rows = total_rows - processed_rows
#                 estimated_remaining_time = remaining_rows / rows_per_second if rows_per_second > 0 else 0
                
#                 logging.info(
#                     f"Progress: {progress:.1f}% ({processed_rows:,}/{total_rows:,} rows) | "
#                     f"Table {table_number}/{total_tables} | "
#                     f"Elapsed: {format_time(elapsed_time)} | "
#                     f"Remaining: {format_time(estimated_remaining_time)}"
#                 )
            
#             # Fetch chunk of data
#             select_query = f"""
#                 SELECT * FROM [{table_name}]
#                 ORDER BY (SELECT NULL)
#                 OFFSET {chunk_start} ROWS 
#                 FETCH NEXT {chunk_size} ROWS ONLY
#             """
            
#             with mssql_engine.connect() as conn:
#                 df = pd.read_sql(select_query, conn)
            
#             if df.empty:
#                 break
            
#             # Convert bit columns to boolean
#             for col in boolean_columns:
#                 if col in df.columns:
#                     df[col] = df[col].map({1: True, 0: False, '1': True, '0': False, None: None})
            
#             # Write to PostgreSQL
#             with postgres_engine.connect() as conn:
#                 df.to_sql(table_name, conn, if_exists='append', index=False, schema='public')
            
#             processed_rows += len(df)
        
#         # Handle sequences for identity columns
#         if identity_columns:
#             logging.info(f"Setting up sequences for {len(identity_columns)} identity columns")
            
#             with postgres_engine.connect() as conn:
#                 for identity_column in identity_columns:
#                     # Get the maximum value
#                     max_id_query = f'SELECT COALESCE(MAX("{identity_column}"), 0) FROM public."{table_name}";'
#                     max_id = conn.execute(text(max_id_query)).scalar()
                    
#                     # Create sequence
#                     seq_name = f'{table_name}_{identity_column}_seq'
#                     create_seq_sql = f'CREATE SEQUENCE IF NOT EXISTS public."{seq_name}" START WITH {max_id + 1};'
#                     conn.execute(text(create_seq_sql))
                    
#                     # Set column default
#                     alter_col_sql = f'''ALTER TABLE public."{table_name}" 
#                         ALTER COLUMN "{identity_column}" 
#                         SET DEFAULT nextval('public."{seq_name}"');'''
#                     conn.execute(text(alter_col_sql))
                    
#                     # Set sequence owned by column
#                     set_owned_sql = f'ALTER SEQUENCE public."{seq_name}" OWNED BY public."{table_name}"."{identity_column}";'
#                     conn.execute(text(set_owned_sql))
                    
#                     logging.info(f"Created sequence public.{seq_name} starting from {max_id + 1}")
                
#                 conn.commit()
        
#         # Log completion time and statistics
#         end_time = datetime.now()
#         total_time = (end_time - start_time).total_seconds()
#         rows_per_second = total_rows / total_time if total_time > 0 else 0
        
#         logging.info(
#             f"Completed migration of table {table_name} "
#             f"({total_rows:,} rows in {format_time(total_time)}, "
#             f"{rows_per_second:.1f} rows/second)"
#         )
        
#     except Exception as e:
#         logging.error(f"Error migrating table {table_name}: {str(e)}")
#         raise

# def get_all_tables(mssql_engine):
#     """Get list of all tables from MSSQL database"""
#     try:
#         inspector = inspect(mssql_engine)
#         tables = inspector.get_table_names()
#         logging.info(f"Found {len(tables)} tables in MSSQL database")
#         return tables
#     except Exception as e:
#         logging.error(f"Error getting table list: {str(e)}")
#         raise

# def main():
#     """Main migration function"""
#     try:
#         start_time = datetime.now()
#         mssql_engine, postgres_engine = create_db_connections()
        
#         # Get all tables from MSSQL
#         all_tables = get_all_tables(mssql_engine)
        
#         # You can either migrate all tables
#         # tables = all_tables
        
#         # Or specify specific tables to migrate
#         tables = [
#             'BookH',
#             'BookD',
#             # Add more tables here
#         ]
        
#         total_tables = len(tables)
#         logging.info(f"Starting migration of {total_tables} tables")
        
#         # Get total row count across all tables
#         total_rows = sum(get_row_count(mssql_engine, table) for table in tables)
#         logging.info(f"Total rows to migrate: {total_rows:,}")
        
#         # Migrate each table
#         for i, table in enumerate(tables, 1):
#             migrate_table(table, mssql_engine, postgres_engine, i, total_tables)
        
#         # Log overall completion time and statistics
#         end_time = datetime.now()
#         total_time = (end_time - start_time).total_seconds()
#         rows_per_second = total_rows / total_time if total_time > 0 else 0
        
#         logging.info(
#             f"\nMigration completed successfully!\n"
#             f"Total tables: {total_tables}\n"
#             f"Total rows: {total_rows:,}\n"
#             f"Total time: {format_time(total_time)}\n"
#             f"Average speed: {rows_per_second:.1f} rows/second"
#         )
        
#     except Exception as e:
#         logging.error(f"Migration failed: {str(e)}")
#         raise
#     finally:
#         if 'mssql_engine' in locals():
#             mssql_engine.dispose()
#         if 'postgres_engine' in locals():
#             postgres_engine.dispose()

# def create_db_connections():
#     """Create and test database connections"""
#     try:
#         mssql_engine = create_engine(URL.create(**mssql_params))
#         postgres_engine = create_engine(URL.create(**postgres_params))
        
#         # Test connections
#         mssql_engine.connect()
#         postgres_engine.connect()
        
#         logging.info("Database connections established successfully")
#         return mssql_engine, postgres_engine
#     except Exception as e:
#         logging.error(f"Failed to establish database connections: {str(e)}")
#         raise

# if __name__ == "__main__":
#     main()





#WORKING WITH BRANCH ADDITION





import pandas as pd
import numpy as np
from sqlalchemy import create_engine, inspect, text, Integer, BigInteger, Boolean, String, DateTime, TIMESTAMP
from sqlalchemy.engine import URL
from datetime import datetime
import logging
import sys
import re

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
    # 'database': 'wsgfmastUAT',
    'database': 'WAPR24AHMDUAT',
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

def get_column_info(mssql_engine, table_name):
    """Get detailed column information from MSSQL"""
    # Get basic column info and primary key info
    base_query = """
    SELECT 
        c.name AS column_name,
        t.name AS data_type,
        c.max_length,
        c.precision,
        c.scale,
        c.is_nullable,
        CAST(COLUMNPROPERTY(c.object_id, c.name, 'IsIdentity') AS bit) as is_identity,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END as is_primary_key,
        OBJECT_DEFINITION(c.default_object_id) as default_definition
    FROM sys.columns c
    INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
    LEFT JOIN (
        SELECT ic.column_id, ic.object_id
        FROM sys.index_columns ic
        INNER JOIN sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        WHERE i.is_primary_key = 1
    ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
    WHERE c.object_id = OBJECT_ID(:table_name)
    """
    
    with mssql_engine.connect() as conn:
        # Get basic column info
        result = conn.execute(text(base_query), {"table_name": table_name}).fetchall()
        
        # Combine the information
        columns = {}
        for row in result:
            col_name = row[0]
            is_identity = bool(row[6])
            is_primary = bool(row[7])
            default_def = row[8]
            
            col_info = {
                'name': col_name,
                'type': row[1],
                'length': row[2],
                'precision': row[3],
                'scale': row[4],
                'nullable': row[5],
                'is_identity': is_identity,
                'is_primary_key': is_primary,
                'default': default_def
            }
            
            # Log identity column details
            if is_identity:
                logging.info(f"Found identity column: {col_name}")
                logging.info(f"Column details: type={row[1]}, is_primary={is_primary}, nullable={row[5]}")
            
            columns[col_name] = col_info
        
        return columns

def map_mssql_to_postgres_type(col_info):
    """Map MSSQL data type to PostgreSQL data type"""
    mssql_type = col_info['type'].lower()
    length = col_info.get('length')
    precision = col_info.get('precision')
    scale = col_info.get('scale')
    
    # Log the mapping process for identity columns
    if col_info['is_identity']:
        logging.info(f"Mapping identity column type: {mssql_type}")
        logging.info(f"Column info: {col_info}")
    
    # Handle different data types
    if mssql_type in ('varchar', 'nvarchar', 'char', 'nchar'):
        if length == -1:  # MAX
            return 'TEXT'
        return f'VARCHAR({length})'
    
    elif mssql_type in ('text', 'ntext'):
        return 'TEXT'
    
    elif mssql_type == 'bit':
        return 'BOOLEAN'
    
    elif mssql_type == 'datetime':
        return 'TIMESTAMP'
    
    elif mssql_type == 'date':
        return 'DATE'
    
    elif mssql_type == 'time':
        return 'TIME'
    
    elif mssql_type == 'money':
        return 'DECIMAL(19,4)'
    
    elif mssql_type == 'decimal':
        return f'DECIMAL({precision},{scale})'
    
    elif mssql_type == 'float':
        return 'DOUBLE PRECISION'
    
    elif mssql_type == 'real':
        return 'REAL'
    
    elif mssql_type == 'uniqueidentifier':
        return 'UUID'
    
    elif mssql_type == 'varbinary':
        if length == -1:  # MAX
            return 'BYTEA'
        return 'BYTEA'
    
    elif mssql_type == 'image':
        return 'BYTEA'
        
    elif mssql_type == 'int':
        # Don't convert to SERIAL/BIGSERIAL here
        return 'INTEGER'
        
    elif mssql_type == 'bigint':
        return 'BIGINT'
        
    elif mssql_type == 'smallint':
        return 'SMALLINT'
        
    elif mssql_type == 'tinyint':
        return 'SMALLINT'
    
    # Default to TEXT for unknown types
    logging.warning(f"Unknown type {mssql_type} - defaulting to TEXT")
    return 'TEXT'

def get_constraints_info(mssql_engine, table_name):
    """Get all constraints for a table from MSSQL"""
    # First get foreign key constraints
    fk_query = text("""
    SELECT 
        fk.name AS constraint_name,
        'F' as constraint_type,
        c.name AS column_name,
        rc.name AS referenced_column,
        OBJECT_NAME(fk.referenced_object_id) AS referenced_table,
        NULL as check_definition,
        0 as is_unique,
        0 as is_primary_key,
        0 as is_unique_constraint,
        CASE fk.delete_referential_action
            WHEN 0 THEN 'NO ACTION'
            WHEN 1 THEN 'CASCADE'
            WHEN 2 THEN 'SET NULL'
            WHEN 3 THEN 'SET DEFAULT'
            ELSE 'NO ACTION'
        END as delete_action,
        CASE fk.update_referential_action
            WHEN 0 THEN 'NO ACTION'
            WHEN 1 THEN 'CASCADE'
            WHEN 2 THEN 'SET NULL'
            WHEN 3 THEN 'SET DEFAULT'
            ELSE 'NO ACTION'
        END as update_action
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
    INNER JOIN sys.columns rc ON fkc.referenced_object_id = rc.object_id AND fkc.referenced_column_id = rc.column_id
    WHERE fk.parent_object_id = OBJECT_ID(:table_name)
    """)
    
    # Then get other constraints (PK, Check, Unique)
    other_constraints_query = """
    SELECT 
        con.name AS constraint_name,
        con.[type] as constraint_type,
        col.name AS column_name,
        NULL AS referenced_column,
        NULL AS referenced_table,
        chk.definition AS check_definition,
        ISNULL(ind.is_unique, 0) as is_unique,
        ISNULL(ind.is_primary_key, 0) as is_primary_key,
        ISNULL(ind.is_unique_constraint, 0) as is_unique_constraint,
        NULL as delete_action,
        NULL as update_action
    FROM sys.objects con
    LEFT JOIN sys.check_constraints chk ON chk.object_id = con.object_id
    LEFT JOIN sys.index_columns ic ON ic.object_id = con.parent_object_id AND ic.index_id = 1
    LEFT JOIN sys.columns col ON col.object_id = con.parent_object_id AND col.column_id = ic.column_id
    LEFT JOIN sys.indexes ind ON ind.object_id = con.parent_object_id AND ind.name = con.name
    WHERE con.parent_object_id = OBJECT_ID(:table_name)
    AND con.[type] IN ('PK', 'UQ', 'C')
    """
    
    with mssql_engine.connect() as conn:
        fk_constraints = conn.execute(fk_query, {"table_name": table_name}).fetchall()
        other_constraints = conn.execute(text(other_constraints_query), {"table_name": table_name}).fetchall()
        
        # Combine all constraints
        all_constraints = list(fk_constraints) + list(other_constraints)
        
        # Log the constraints found
        logging.info(f"Found constraints for table {table_name}:")
        for con in all_constraints:
            if con.constraint_type == 'F':
                logging.info(f"Foreign Key: {con.constraint_name} - {con.column_name} references {con.referenced_table}.{con.referenced_column}")
                logging.info(f"  ON DELETE {con.delete_action}, ON UPDATE {con.update_action}")
            elif con.constraint_type == 'PK':
                logging.info(f"Primary Key: {con.constraint_name} on {con.column_name}")
            elif con.constraint_type == 'UQ':
                logging.info(f"Unique: {con.constraint_name} on {con.column_name}")
            elif con.constraint_type == 'C':
                logging.info(f"Check: {con.constraint_name} - {con.check_definition}")
        
        return all_constraints

def get_branch_info(postgres_engine, db_name):
    """Get branch information from mstCompany table based on database name"""
    try:
        # Extract branch code from database name (e.g., 'WAPR24AHMDUAT' -> 'AHMD')
        match = re.search(r'[A-Z0-9]+([A-Z]{4})UAT$', db_name)
        if not match:
            logging.warning(f"Could not extract branch code from database name: {db_name}")
            return None, None
            
        branch_code = match.group(1)
        
        # Query mstCompany table for branch information
        query = text("""
            SELECT "nBranchID", "vBranchCode"
            FROM "mstCompany"
            WHERE "vBranchCode" = :branch_code
        """)
        
        with postgres_engine.connect() as conn:
            result = conn.execute(query, {"branch_code": branch_code}).fetchone()
            
        if result:
            return result[0], result[1]
        else:
            logging.warning(f"Branch code {branch_code} not found in mstCompany table")
            return None, None
            
    except Exception as e:
        logging.error(f"Error getting branch information: {str(e)}")
        return None, None

def create_table_in_postgres(table_name, mssql_engine, postgres_engine):
    """Create table in PostgreSQL with the same schema as MSSQL"""
    try:
        columns = get_column_info(mssql_engine, table_name)
        constraints = get_constraints_info(mssql_engine, table_name)
        
        # Only add branch columns if they don't exist in the source table
        should_add_branch_columns = "nBranchID" not in columns and "vBranchCode" not in columns
        
        # Add branch columns only if they don't exist in source
        if should_add_branch_columns:
            columns["nBranchID"] = {"type": "int", "nullable": True, "is_identity": False, "is_primary_key": False, "default": None}
            columns["vBranchCode"] = {"type": "varchar(10)", "nullable": True, "is_identity": False, "is_primary_key": False, "default": None}
            logging.info(f"Adding branch columns to table {table_name}")
        
        # Generate column definitions
        column_defs = []
        identity_columns = []
        
        for col_name, col_info in columns.items():
            if col_info['is_identity']:
                identity_columns.append(col_name)
                logging.info(f"Found identity column: {col_name}")
                logging.info(f"Column details: type={col_info['type']}, is_primary={col_info['is_primary_key']}, nullable={col_info['nullable']}")
            
            pg_type = map_mssql_to_postgres_type(col_info)
            nullable = "NULL" if col_info['nullable'] else "NOT NULL"
            default = ""
            
            # Handle default values
            if col_info['default'] is not None:
                default_val = col_info['default']
                if pg_type == 'BOOLEAN':
                    default_val = 'true' if default_val in ('1', 'true') else 'false'
                elif pg_type in ('INTEGER', 'BIGINT', 'SMALLINT'):
                    default_val = str(default_val)
                elif pg_type.startswith('VARCHAR') or pg_type == 'TEXT':
                    default_val = f"'{default_val}'"
                default = f" DEFAULT {default_val}"
            
            # For identity columns, just create as INTEGER/BIGINT initially
            if col_info['is_identity'] and col_info['is_primary_key']:
                col_def = f'"{col_name}" {pg_type} PRIMARY KEY'
            else:
                col_def = f'"{col_name}" {pg_type} {nullable}{default}'
            
            column_defs.append(col_def)
        
        # Generate constraint definitions
        constraint_defs = []
        for constraint in constraints:
            con_name = constraint.constraint_name
            con_type = constraint.constraint_type
            
            if con_type == 'F':  # Foreign Key
                ref_table = constraint.referenced_table
                ref_col = constraint.referenced_column
                col_name = constraint.column_name
                
                # Map referential actions
                action_map = {
                    0: 'NO ACTION',
                    1: 'CASCADE',
                    2: 'SET NULL',
                    3: 'SET DEFAULT'
                }
                delete_action = action_map.get(constraint.delete_action, 'NO ACTION')
                update_action = action_map.get(constraint.update_action, 'NO ACTION')
                
                con_def = f'CONSTRAINT "{con_name}" FOREIGN KEY ("{col_name}") ' \
                         f'REFERENCES public."{ref_table}" ("{ref_col}") ' \
                         f'ON DELETE {delete_action} ON UPDATE {update_action}'
                         
                logging.info(f"Adding foreign key constraint: {con_def}")
                constraint_defs.append(con_def)
            
            elif con_type == 'UQ':  # Unique Constraint
                col_name = constraint.column_name
                con_def = f'CONSTRAINT "{con_name}" UNIQUE ("{col_name}")'
                logging.info(f"Adding unique constraint: {con_def}")
                constraint_defs.append(con_def)
            
            elif con_type == 'C':  # Check Constraint
                check_def = constraint.check_definition
                if check_def:
                    # Convert MSSQL check syntax to PostgreSQL
                    check_def = check_def.replace('dbo.', 'public.')
                    con_def = f'CONSTRAINT "{con_name}" CHECK ({check_def})'
                    logging.info(f"Adding check constraint: {con_def}")
                    constraint_defs.append(con_def)
        
        # First, drop the table and its dependencies
        drop_table_sql = f'DROP TABLE IF EXISTS public."{table_name}" CASCADE;'
        
        # Create the table with explicit schema
        create_table_sql = f'CREATE TABLE public."{table_name}" ('
        create_table_sql += '\n    ' + ',\n    '.join(column_defs)
        if constraint_defs:
            create_table_sql += ',\n    ' + ',\n    '.join(constraint_defs)
        create_table_sql += '\n);'
        
        logging.info(f"Table creation SQL:\n{create_table_sql}")
        
        with postgres_engine.connect() as conn:
            # Drop existing table
            logging.info(f"Dropping existing table {table_name}")
            conn.execute(text(drop_table_sql))
            
            # Create new table
            logging.info(f"Creating table {table_name}")
            conn.execute(text(create_table_sql))
            
            # Set owner
            set_owner_sql = f'ALTER TABLE public."{table_name}" OWNER TO postgres;'
            conn.execute(text(set_owner_sql))
            
            conn.commit()
            
        return identity_columns
        
    except Exception as e:
        logging.error(f"Error creating table {table_name}: {str(e)}")
        raise

def get_row_count(engine, table_name):
    """Get the total number of rows in a table"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f'SELECT COUNT(*) FROM [{table_name}]')).scalar()
            return result
    except Exception as e:
        logging.error(f"Error getting row count for table {table_name}: {str(e)}")
        return 0

def format_time(seconds):
    """Format time in seconds to a human-readable string"""
    if seconds < 60:
        return f"{seconds:.0f} seconds"
    elif seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f} minutes"
    else:
        hours = seconds / 3600
        return f"{hours:.1f} hours"

def migrate_table(table_name, mssql_engine, postgres_engine, table_number, total_tables):
    """Migrate a single table from MSSQL to PostgreSQL"""
    try:
        start_time = datetime.now()
        
        # Get column information first
        columns = get_column_info(mssql_engine, table_name)
        should_add_branch_columns = "nBranchID" not in columns and "vBranchCode" not in columns
        
        # Only get branch information if we need to add the columns
        branch_id = None
        branch_code = None
        if should_add_branch_columns:
            branch_id, branch_code = get_branch_info(postgres_engine, mssql_params["database"])
            if branch_id and branch_code:
                logging.info(f"Found branch information: ID={branch_id}, Code={branch_code}")
        
        # Get total row count for progress tracking
        total_rows = get_row_count(mssql_engine, table_name)
        logging.info(f"Table {table_name} has {total_rows:,} rows to migrate")
        
        # Create table in PostgreSQL and get identity columns
        logging.info(f"[{table_number}/{total_tables}] Creating table structure for {table_name}")
        identity_columns = create_table_in_postgres(table_name, mssql_engine, postgres_engine)
        
        # Get column info to identify boolean columns
        boolean_columns = [col_name for col_name, col_info in columns.items() 
                         if col_info['type'].lower() == 'bit']
        
        # Get data from MSSQL in chunks for better memory management and progress tracking
        chunk_size = 5000
        processed_rows = 0
        
        logging.info(f"Starting data migration for table {table_name}")
        
        for chunk_start in range(0, total_rows, chunk_size):
            chunk_end = min(chunk_start + chunk_size, total_rows)
            
            # Calculate progress percentage and time estimates
            progress = (processed_rows / total_rows) * 100 if total_rows > 0 else 100
            elapsed_time = (datetime.now() - start_time).total_seconds()
            
            if processed_rows > 0:
                rows_per_second = processed_rows / elapsed_time
                remaining_rows = total_rows - processed_rows
                estimated_remaining_time = remaining_rows / rows_per_second if rows_per_second > 0 else 0
                
                logging.info(
                    f"Progress: {progress:.1f}% ({processed_rows:,}/{total_rows:,} rows) | "
                    f"Table {table_number}/{total_tables} | "
                    f"Elapsed: {format_time(elapsed_time)} | "
                    f"Remaining: {format_time(estimated_remaining_time)}"
                )
            
            # Fetch chunk of data
            select_query = f"""
                SELECT * FROM [{table_name}]
                ORDER BY (SELECT NULL)
                OFFSET {chunk_start} ROWS 
                FETCH NEXT {chunk_size} ROWS ONLY
            """
            
            with mssql_engine.connect() as conn:
                df = pd.read_sql(select_query, conn)
            
            if df.empty:
                break
            
            # Convert bit columns to boolean
            for col in boolean_columns:
                if col in df.columns:
                    df[col] = df[col].map({1: True, 0: False, '1': True, '0': False, None: None})
            
            # Only add branch columns if they didn't exist in source
            if should_add_branch_columns and branch_id is not None and branch_code is not None:
                df['nBranchID'] = branch_id
                df['vBranchCode'] = branch_code
            
            # Write to PostgreSQL
            with postgres_engine.connect() as conn:
                df.to_sql(table_name, conn, if_exists='append', index=False, schema='public')
            
            processed_rows += len(df)
        
        # Handle sequences for identity columns
        if identity_columns:
            logging.info(f"Setting up sequences for {len(identity_columns)} identity columns")
            
            with postgres_engine.connect() as conn:
                for identity_column in identity_columns:
                    # Get the maximum value
                    max_id_query = f'SELECT COALESCE(MAX("{identity_column}"), 0) FROM public."{table_name}";'
                    max_id = conn.execute(text(max_id_query)).scalar()
                    
                    # Create sequence
                    seq_name = f'{table_name}_{identity_column}_seq'
                    create_seq_sql = f'CREATE SEQUENCE IF NOT EXISTS public."{seq_name}" START WITH {max_id + 1};'
                    conn.execute(text(create_seq_sql))
                    
                    # Set column default
                    alter_col_sql = f'''ALTER TABLE public."{table_name}" 
                        ALTER COLUMN "{identity_column}" 
                        SET DEFAULT nextval('public."{seq_name}"');'''
                    conn.execute(text(alter_col_sql))
                    
                    # Set sequence owned by column
                    set_owned_sql = f'ALTER SEQUENCE public."{seq_name}" OWNED BY public."{table_name}"."{identity_column}";'
                    conn.execute(text(set_owned_sql))
                    
                    logging.info(f"Created sequence public.{seq_name} starting from {max_id + 1}")
                
                conn.commit()
        
        # Log completion time and statistics
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        rows_per_second = total_rows / total_time if total_time > 0 else 0
        
        logging.info(
            f"Completed migration of table {table_name} "
            f"({total_rows:,} rows in {format_time(total_time)}, "
            f"{rows_per_second:.1f} rows/second)"
        )
        
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
        start_time = datetime.now()
        mssql_engine, postgres_engine = create_db_connections()
        
        # Get all tables from MSSQL
        all_tables = get_all_tables(mssql_engine)
        
        # You can either migrate all tables
        # tables = all_tables
        
        # Or specify specific tables to migrate
        tables = [
            'BookH',
            'BookD'
            # Add more tables here
        ]
        
        total_tables = len(tables)
        logging.info(f"Starting migration of {total_tables} tables")
        
        # Get total row count across all tables
        total_rows = sum(get_row_count(mssql_engine, table) for table in tables)
        logging.info(f"Total rows to migrate: {total_rows:,}")
        
        # Migrate each table
        for i, table in enumerate(tables, 1):
            migrate_table(table, mssql_engine, postgres_engine, i, total_tables)
        
        # Log overall completion time and statistics
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        rows_per_second = total_rows / total_time if total_time > 0 else 0
        
        logging.info(
            f"\nMigration completed successfully!\n"
            f"Total tables: {total_tables}\n"
            f"Total rows: {total_rows:,}\n"
            f"Total time: {format_time(total_time)}\n"
            f"Average speed: {rows_per_second:.1f} rows/second"
        )
        
    except Exception as e:
        logging.error(f"Migration failed: {str(e)}")
        raise
    finally:
        if 'mssql_engine' in locals():
            mssql_engine.dispose()
        if 'postgres_engine' in locals():
            postgres_engine.dispose()

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

if __name__ == "__main__":
    main()

