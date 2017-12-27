NodePad
=======

Basic Node web app using MongoDb - can be run against a local instance of Mongo and then the connstring changed to run against Azure CosmosDb.

## Instructions ##

1. Run up the app using the localhost connstring.
2. Spin up a MongoDb instance on CosmosDb
3. Copy/paste the CosmosDb connstring into model/db.js
4. Run up the app again to show no other changes are needed to run against CosmosDb