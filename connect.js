var fs = require('fs');
var guid = require('node-uuid');
var storage = require('azure-storage');

function connect(connectionString) {

  entityGen = storage.TableUtilities.entityGenerator;
  storageClient = storage.createTableService(connectionString);

  retObj = {
    entityGen : entityGen,
    storageClient : storageClient,
    storage : storage,
    guid : guid
  };
  return retObj;
}

module.exports = connect;
