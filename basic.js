var tableName = "chatlog";
var config;


function main(config) {
  config = config;
  retrieveAllEntities(tableName);
}
//var entityObject = createCustomerEntityDescriptor("Harp", "Walter", "Walter@contoso.com", "425-555-0101");





// function basicTableOperations(callback) {
//   storageClient.createTableIfNotExists(tableName, function (error, createResult) {
//     if (error) return callback(error);

//     if (createResult.isSuccessful) {
//       console.log("1. Create Table operation executed successfully for: ", tableName);
//     }

//     console.log("2. Inserting or updating an entity using insertOrMergeEntity function.");
//     var customer = createCustomerEntityDescriptor("Harp", "Walter", "Walter@contoso.com", "425-555-0101");

//     storageClient.insertOrMergeEntity(tableName, customer, function (error, result, response) {
//       if (error) return callback(error);

//       console.log("   insertOrMergeEntity succeeded.");

//       console.log("3. Reading the updated entity.");

//       // Demonstrate the most efficient storage query - the point query - where both partition key and row key are specified. 
//       storageClient.retrieveEntity(tableName, customer.PartitionKey._, customer.RowKey._, function (error, result) {
//         if (error) return callback(error);

//         console.log("   retrieveEntity succeeded: ", result.PartitionKey._, result.RowKey._, result.email._, result.phone._);

//         console.log("4. Deleting the entity. ");

//         storageClient.deleteEntity(tableName, customer, function entitiesQueried(error, result) {
//           if (error) return callback(error);

//           console.log("   deleteEntity succeeded.");

//           // Demonstrates upsert and batch table operations
//           console.log("5. Inserting a batch of entities. ");

//           // create batch operation
//           var batch = new storage.TableBatch();
//           var lastName = "Smith";

//           // The following code  generates test data for use during the query samples.  
//           for (var i = 0; i < 100; i++) {
//             var name = zeroPaddingString(i, 4);
//             var customerToInsert = createCustomerEntityDescriptor(lastName, name, name + "@contoso.com", "425-555-" + name)

//             batch.insertEntity(customerToInsert);
//           }

//           //  Demonstrate inserting of a large batch of entities. Some considerations for batch operations:
//           //  1. You can perform updates, deletes, and inserts in the same single batch operation.
//           //  2. A single batch operation can include up to 100 entities.
//           //  3. All entities in a single batch operation must have the same partition key.
//           //  4. While it is possible to perform a query as a batch operation, it must be the only operation in the batch.
//           //  5. Batch size must be <= 4MB  
//           storageClient.executeBatch(tableName, batch, function (error, result, response) {
//             if (error) return callback(error);

//             console.log("   Batch insert completed.");
//             console.log("6. Retrieving entities with surname of Smith and first names > 1 and <= 75");

//             var storageTableQuery = storage.TableQuery;
//             var segmentSize = 10;

//             // Demonstrate a partition range query whereby we are searching within a partition for a set of entities that are within a specific range. 
//             var tableQuery = new storageTableQuery()
//               .top(segmentSize)
//               .where('PartitionKey eq ?', lastName)
//               .and('RowKey gt ?', "0001").and('RowKey le ?', "0075");

//             runPageQuery(tableQuery, null, function (error, result) {

//               if (error) return callback(error);

//               // Demonstrate a partition scan whereby we are searching for all the entities within a partition. 
//               // Note this is not as efficient as a range scan - but definitely more efficient than a full table scan. 
//               console.log("7. Retrieve entities with surname of %s.", lastName);

//               var tableQuery = new storageTableQuery()
//                 .top(segmentSize)
//                 .where('PartitionKey eq ?', lastName);

//               runPageQuery(tableQuery, null, function (error) {

//                 if (error) return callback(error);

//                 storageClient.deleteTable(tableName, function (error, response) {
//                   if (error) return callback(error);

//                   console.log("   deleteTable succeeded.");

//                   callback();
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// };




// function zeroPaddingString(str, len) {
//   var paddingStr = '0000000000' + str;
//   if (paddingStr.length < len) {
//     return zeroPaddingString(paddingStr, len);
//   } else {
//     return paddingStr.substr(-1 * len);
//   }
// }


module.exports = main;
// retrieveEntity(tableName,entityObject);
// deleteEntity(tableName,entityObject);