# import psycopg2

# # Connection parameters
# conn = psycopg2.connect(
#     dbname='dummy2',
#     user='postgres',
#     password='J1c2m@raekat',
#     host='localhost',
#     port=5432,  # default PostgreSQL port is 5432
# )
# cursor = conn.cursor()

# # Function to insert data
# def insert_data(nUserID, branch_ids, counter_ids,vUID, is_active=True):
#     """
#     Inserts data into the mstCounterUserLink table for the given nUserID,
#     with multiple nBranchID and nCounterID combinations.

#     Parameters:
#     nUserID (int): The user ID
#     branch_ids (list of int): List of branch IDs
#     counter_ids (list of int): List of counter IDs
#     is_active (bool): The active status (default is True)
#     """
#     for branch_id in branch_ids:
#         for counter_id in counter_ids:
#             cursor.execute('''
#                 INSERT INTO "mstCounterUserLink" ("nUserID", "nBranchID", "nCounterID", "vUID","bIsActive")
#                 VALUES (%s, %s, %s, %s, %s)
#             ''', (nUserID, branch_id, counter_id, vUID, is_active))

# # Example usage
# nUserID = 1
# branch_ids = [1, 2, 3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]
# counter_ids = [1, 2, 3]
# vUID = 'ADMIN'

# insert_data(nUserID, branch_ids, counter_ids, vUID)

# # Commit the changes and close the connection
# conn.commit()
# conn.close()





import psycopg2

# Connection parameters
conn = psycopg2.connect(
    dbname='dummy2',
    user='postgres',
    password='J1c2m@raekat',
    host='localhost',
    port=5432,  # default PostgreSQL port is 5432
)
cursor = conn.cursor()

# Function to insert data
def insert_data(branch_ids, counter_ids,is_active=True):
    """
    Inserts data into the mstCounterUserLink table for the given nUserID,
    with multiple nBranchID and nCounterID combinations.

    Parameters:
    nUserID (int): The user ID
    branch_ids (list of int): List of branch IDs
    counter_ids (list of int): List of counter IDs
    is_active (bool): The active status (default is True)
    """
    for branch_id in branch_ids:
        for counter_id in counter_ids:
            cursor.execute('''
                INSERT INTO "mstBranchCounterLink" ("nBranchID", "nCounterID", "bIsActive")
                VALUES (%s, %s, %s)
            ''', (branch_id, counter_id, is_active))

# Example usage
# nUserID = 1
branch_ids = [2, 3,4,5,6,11,12,13,14,16,17,18,20,22,23,24,25]
counter_ids = [1, 2, 3]

insert_data(branch_ids, counter_ids)

# Commit the changes and close the connection
conn.commit()
conn.close()
