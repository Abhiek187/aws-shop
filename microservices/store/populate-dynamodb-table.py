# So here me out:
# We can create a regular JSON file with the items we want to include.
# Then using boto3, we can apply a UUID to each item and split the items into chunks of 25 to make
# batch-write-item happy. (And apply other formatting required for that command.)
# This would normally be done by a DBA, but we'll use the admin account for now.
# That is the create part. But we also need to handle upserts and deletions.
# So we could query the database to see if the service exists.
# If it does, check if there's a difference between your local JSON and what's stored in the database
# (minus the UUID).
# If it doesn't, insert the item into the database like earlier.
# Good, creation and upserts are taken care of, but what about deletions?
# I'm sort of handling this like Git for databases.
# Maybe get all the items in the database and keep track of which items you queried.
# Every item already present will be queried, so items that were never queried must have been deleted.
# So remove those items at the end. Maybe with a prompt?
