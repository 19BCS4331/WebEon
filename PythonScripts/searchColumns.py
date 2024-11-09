import pyodbc

# Replace these with your actual database connection details
server = '101.53.148.243,9137'
database = 'WAPR24AHMDUAT'
username = 'mil'
password = 'mil@1234#'
search_string = 'vBankType'


# Establish connection
conn = pyodbc.connect(
    f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
)
cursor = conn.cursor()

# Get the list of tables
cursor.execute("""
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_type = 'BASE TABLE'
""")
tables = cursor.fetchall()
print(f"Total tables found: {len(tables)}")

tables_checked = 0
found_columns = []

# Loop through each table
for schema, table_name in tables:
    print(f"Searching in table: {schema}.{table_name}")
    cursor.execute(f"""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = '{schema}' AND table_name = '{table_name}'
    """)
    columns = cursor.fetchall()
    
    # Loop through each column in the table
    for column in columns:
        column_name = column[0]
        print(f"Checking column: {schema}.{table_name}.{column_name}")
        
        # Check if the search string is in the column name
        if search_string.lower() in column_name.lower():
            print(f"Found in table: {schema}.{table_name}, column: {column_name}")
            found_columns.append((schema, table_name, column_name))
    
    tables_checked += 1

# Close the connection
cursor.close()
conn.close()

print(f"Search completed. Total tables checked: {tables_checked}")

if found_columns:
    print("Columns containing the search string were found in the following tables:")
    for schema, table_name, column_name in found_columns:
        print(f"Table: {schema}.{table_name}, Column: {column_name}")
else:
    print("No columns containing the search string were found.")
