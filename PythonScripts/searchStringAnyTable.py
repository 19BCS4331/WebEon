import pyodbc

# Replace these with your actual database connection details
server = '101.53.148.243,9137'
# database = 'WAPR24AHMDUAT'
database = 'wsgfmastUAT'
username = 'mil'
password = 'mil@1234#'
search_string = 'INVOICE DELETION'

# Establish connection
conn = pyodbc.connect(
    f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
)
cursor = conn.cursor()

# Get the list of tables
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema = 'dbo'")
tables = cursor.fetchall()
# Loop through each table
for table in tables:
    table_name = table[0]
    found_in_table = False  # Flag to check if any match is found in the table
    
    # Get columns in the current table
    cursor.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table_name}'")
    columns = cursor.fetchall()
    
    # Loop through each column in the table
    for column in columns:
        column_name = column[0]
        data_type = column[1]
        
        # Only search in text-like columns
        if data_type in ['varchar', 'nvarchar', 'text']:
            try:
                cursor.execute(f"SELECT * FROM {table_name} WHERE {column_name} LIKE ?", ('%' + search_string + '%',))
                results = cursor.fetchall()
                if results:
                    if not found_in_table:
                        print(f"Found in table: {table_name}")
                        found_in_table = True
                    print(f"- Found in column: {column_name}")
            except pyodbc.Error as err:
                print(f"Error searching {table_name}.{column_name}: {err}")
    
    if not found_in_table:
        print(f"No match found in table: {table_name}")

# Close the connection
cursor.close()
conn.close()
print("Search completed.")
