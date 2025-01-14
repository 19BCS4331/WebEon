import logging
import pandas as pd
from sqlalchemy import create_engine, text, URL
import re
from MSSQLtoPG_Migration_v3 import (
    get_column_info, 
    create_table_in_postgres, 
    get_branch_info, 
    migrate_table,
    format_time
)
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# PostgreSQL connection parameters (central database)
postgres_params = {
    'drivername': 'postgresql',
    'username': 'postgres',
    'password': 'J1c2m@raekat',
    'host': 'localhost',
    'port': 5432,
    'database': 'NEWTEST'
}

# Base MSSQL connection parameters
mssql_base_params = {
    'drivername': 'mssql+pyodbc',
    'host': '101.53.148.243,9137',
    'username': 'mil',
    'password': 'mil@1234#',
    'query': {'driver': 'ODBC Driver 17 for SQL Server'}
}


# List of branch databases to migrate
branch_databases = [
    'WAPR24AHMDUAT',
    'WAPR24HOUAT',
    'WApr24MUMMRDUAT'
    # Add more branch databases as needed
]

def get_branch_info(postgres_engine, db_name):
    """Get branch information from mstCompany table in SQL Server"""
    try:
        # Extract branch code from database name using specific patterns
        patterns = [
            r'WAPR24(\w+)UAT$',  # Matches WAPR24AHMDUAT -> AHMD
            r'WApr24(\w+)UAT$',  # Matches WApr24MUMMRDUAT -> MUMMRD
        ]
        
        branch_code = None
        for pattern in patterns:
            match = re.search(pattern, db_name, re.IGNORECASE)
            if match:
                branch_code = match.group(1).upper()
                break
                
        if not branch_code:
            logging.warning(f"Could not extract branch code from database name: {db_name}")
            return None, None
            
        logging.info(f"Extracted branch code: {branch_code} from database: {db_name}")
        
        # Create SQL Server connection to wsgfmastUAT database
        mssql_master_params = mssql_base_params.copy()
        mssql_master_params['database'] = 'wsgfmastUAT'
        
        mssql_url = URL.create(
            "mssql+pyodbc",
            username=mssql_master_params["username"],
            password=mssql_master_params["password"],
            host=mssql_master_params["host"],
            database=mssql_master_params["database"],
            query={
                "driver": "ODBC Driver 17 for SQL Server",
                "TrustServerCertificate": "yes"
            }
        )
        
        try:
            mssql_master_engine = create_engine(mssql_url)
            # Test connection
            with mssql_master_engine.connect() as conn:
                conn.execute(text("SELECT 1")).fetchone()
            logging.info("Successfully connected to wsgfmastUAT")
        except Exception as e:
            logging.error(f"Failed to connect to wsgfmastUAT: {str(e)}")
            return None, None
        
        # Query mstCompany table from SQL Server
        query = text("""
            SELECT nBranchID, vBranchCode
            FROM mstCompany
            WHERE vBranchCode = :branch_code
        """)
        
        with mssql_master_engine.connect() as conn:
            result = conn.execute(query, {"branch_code": branch_code}).fetchone()
            
        if result:
            return result[0], result[1]
        else:
            logging.warning(f"Branch code {branch_code} not found in mstCompany table")
            return None, None
            
    except Exception as e:
        logging.error(f"Error getting branch information: {str(e)}")
        return None, None

def migrate_branch_database(branch_db_name, postgres_engine):
    """Migrate a single branch database to the central database"""
    try:
        logging.info(f"\nStarting migration of branch database: {branch_db_name}")
        start_time = datetime.now()
        
        # Create MSSQL connection for this branch
        mssql_params = mssql_base_params.copy()
        mssql_params['database'] = branch_db_name
        
        # Create MSSQL connection string using URL.create
        mssql_url = URL.create(
            "mssql+pyodbc",
            username=mssql_params["username"],
            password=mssql_params["password"],
            host=mssql_params["host"],
            database=mssql_params["database"],
            query={
                "driver": "ODBC Driver 17 for SQL Server",
                "TrustServerCertificate": "yes"
            }
        )
        
        try:
            mssql_engine = create_engine(mssql_url)
            # Test connection
            with mssql_engine.connect() as conn:
                conn.execute(text("SELECT 1")).fetchone()
            logging.info(f"Successfully connected to {branch_db_name}")
        except Exception as e:
            logging.error(f"Failed to connect to {branch_db_name}: {str(e)}")
            return False
        
        # Get branch information
        branch_id, branch_code = get_branch_info(postgres_engine, branch_db_name)
        if not branch_id or not branch_code:
            logging.error(f"Could not get branch information for {branch_db_name}. Skipping...")
            return False
            
        logging.info(f"Found branch information: ID={branch_id}, Code={branch_code}")
        
        # Get list of tables with error handling
        try:
            query = text("""
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_TYPE = 'BASE TABLE' 
                AND TABLE_SCHEMA = 'dbo'
            """)
            
            with mssql_engine.connect() as conn:
                tables = [row[0] for row in conn.execute(query)]
        except Exception as e:
            logging.error(f"Failed to get table list from {branch_db_name}: {str(e)}")
            return False
        
        total_tables = len(tables)
        logging.info(f"Found {total_tables} tables in branch database")
        
        # Migrate each table
        for i, table in enumerate(tables, 1):
            try:
                migrate_table(table, mssql_engine, postgres_engine, i, total_tables)
                logging.info(f"Successfully migrated table {table} from {branch_db_name}")
            except Exception as e:
                logging.error(f"Error migrating table {table} from {branch_db_name}: {str(e)}")
                continue
        
        # Log completion
        end_time = datetime.now()
        total_time = (end_time - start_time).total_seconds()
        logging.info(
            f"\nCompleted migration of branch database {branch_db_name}\n"
            f"Total tables: {total_tables}\n"
            f"Total time: {format_time(total_time)}"
        )
        
        return True
        
    except Exception as e:
        logging.error(f"Error migrating branch database {branch_db_name}: {str(e)}")
        return False
    finally:
        if 'mssql_engine' in locals():
            mssql_engine.dispose()

def main():
    """Main function to migrate multiple branch databases"""
    try:
        overall_start_time = datetime.now()
        
        # Create PostgreSQL connection using URL.create
        postgres_url = URL.create(
            "postgresql+psycopg2",
            username=postgres_params['username'],
            password=postgres_params['password'],
            host=postgres_params['host'],
            port=postgres_params['port'],
            database=postgres_params['database']
        )
        postgres_engine = create_engine(postgres_url)
        
        # Test PostgreSQL connection
        try:
            with postgres_engine.connect() as conn:
                conn.execute(text("SELECT 1")).fetchone()
            logging.info("Successfully connected to PostgreSQL database")
        except Exception as e:
            logging.error(f"Failed to connect to PostgreSQL: {str(e)}")
            return
        
        logging.info("Starting multi-branch database migration")
        
        # Track success/failure
        successful_migrations = []
        failed_migrations = []
        
        # Migrate each branch database
        for branch_db in branch_databases:
            success = migrate_branch_database(branch_db, postgres_engine)
            if success:
                successful_migrations.append(branch_db)
            else:
                failed_migrations.append(branch_db)
        
        # Log overall results
        overall_end_time = datetime.now()
        total_time = (overall_end_time - overall_start_time).total_seconds()
        
        logging.info(f"\nMulti-branch migration completed in {format_time(total_time)}")
        logging.info(f"Successfully migrated: {', '.join(successful_migrations)}")
        if failed_migrations:
            logging.warning(f"Failed to migrate: {', '.join(failed_migrations)}")
        
    except Exception as e:
        logging.error(f"Migration failed: {str(e)}")
        raise
    finally:
        if 'postgres_engine' in locals():
            postgres_engine.dispose()

if __name__ == "__main__":
    main()
