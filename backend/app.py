from pymongo import MongoClient

# Paste your Atlas connection string here
uri = "mongodb+srv://<db_username>:<db_password>@<clusterName>.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(uri)
db = client["my_database"]          # choose a database name
collection = db["my_collection"]    # choose a collection name

# Insert a document
doc_id = collection.insert_one({"name": "Alice", "age": 25}).inserted_id
print("Inserted document id:", doc_id)

# Query a document
user = collection.find_one({"name": "Alice"})
print("Found user:", user)
