var config;
var tableName = "chatlog";
var retObj = [];
function main(con) {
  config=con;
}

function createTable() {
  config.storageClient.createTableIfNotExists(tableName, function (error, createResult) {
    if (error) console.log(error);

    if (createResult.isSuccessful) {
      console.log("1. Create Table operation executed successfully for: ", tableName);
    }
  });
}

function insertEntity(entityObject) {
  config.storageClient.insertOrMergeEntity(tableName, entityObject, function (error, result, response) {
    if (error) console.log(error);

    console.log("\nInsertOrMergeEntity succeeded.");
  });
}

function retrieveEntity(entityObject) {
  config.storageClient.retrieveEntity(tableName, entityObject.PartitionKey._, entityObject.RowKey._, function (error, result) {
    if (error) console.log(error);

    console.log("\nRetrieveEntity succeeded: ", result.PartitionKey._, result.RowKey._, result.email._, result.phone._);
  });
}

function deleteEntity(entityObject) {
  config.storageClient.deleteEntity(tableName, entityObject, function entitiesQueried(error, result) {
    if (error) console.log(error);

    console.log("   deleteEntity succeeded.");
  });

}


function createCustomerEntityDescriptor(partitionKey, rowKey, email, phone) {
  var customerEntity = {
    PartitionKey: config.entityGen.String(partitionKey),
    RowKey: config.entityGen.String(rowKey),
    email: config.entityGen.String(email),
    phone: config.entityGen.String(phone),
    code: config.entityGen.Int32(1),
    isEnterprise: config.entityGen.Boolean(false),
    since: config.entityGen.DateTime(new Date(Date.UTC(2011, 10, 25))),
  };
  return customerEntity;
}
function retrieveAllEntities() {
  console.log(config);
  var storageTableQuery = config.storage.TableQuery;
  var segmentSize = 20;
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

    runPageQuery(tableQuery, null, function (error) {

      if(error) console.log(error);
      else return;
    });
}


function runPageQuery(tableQuery, continuationToken, callback) {

  config.storageClient.queryEntities(tableName, tableQuery, continuationToken, function (error, result) {
    if (error) return callback(error);

    var entities = result.entries;
    entities.forEach(function (entity) {
      retObj.push(entity);
      //console.log("  chatlog: %s,%s,%s", entity.PartitionKey._, entity.RowKey._, entity.Sentiment._)
      console.log(entity);
    });

    continuationToken = result.continuationToken;
    if (continuationToken) {
      runPageQuery(tableQuery, continuationToken, callback);
    } else {
      console.log("Query completed.");
      callback();
    }
  });
}





module.exports = {
  retrieveAllEntities,
  retrieveEntity,
  deleteEntity,
  insertEntity,
  createTable,
  main
}