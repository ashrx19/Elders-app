import mysql.connector

def connect():
    """Connect to the MySQL database."""
    return mysql.connector.connect(
        host="localhost",
        port=3306,  # Added port information
        user="root",  # Username as shown in the image
        password="#Kandhan@12345",  # Replace with your MySQL password
        database="elderlycare"  # Replace with your database name
    )
