/************************** APP ***************************/


// Imports

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Azure Imports

const guid = require('node-uuid');
const storage = require('azure-storage');
const users = require('./users');

// Globals 

var config;
var data = [];
var tableName = "chatlog";
var segments = 0;
var noofsegments=1;
var col1,col2;
var segmentSize = 20;


// Create and Setup the App
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');

const port = 9000;


// Routes

app.get('/', (req,res)=>{
	//console.log(users);
	res.render('home',{'users' : users});
});

app.get('/account/:id', (req,res)=>{
    config = connect(users[req.params.id].connectionString);
    nrows=20;
    if(req.params.id == 2) tableName="chatlogqa";
    else tableName="chatlog";

    if(req.query.noofrows != undefined) {
      noofsegments=req.query.noofrows/segmentSize;
      nrows=req.query.noofrows;
    }
    retrieveAllEntities(res,req.params.id,nrows);
});

app.get('/export/:id', (req,res)=>{
  config = connect(users[req.params.id].connectionString);
  downloadEntities(res);
});

app.get('/visualize/:id', (req,res)=>{
  config = connect(users[req.params.id].connectionString);
  nrows=20;
  if(req.query.noofrows != undefined) {
    noofsegments=req.query.noofrows/segmentSize;
    nrows=req.query.noofrows;
  }
  getFirstEntity(res,req.params.id,nrows);
});

app.post('/api/:id',urlencodedParser, (req,res)=>{
  config = connect(users[req.params.id].connectionString);
  col1=req.body.col1;
  col2=req.body.col2;
  retrieveColumnsData(res);
});

app.post('/join',urlencodedParser, (req,res)=>{
  //console.log(req.body);
  for(var id in req.body) {
    config = connect(users[id].connectionString);
    if(req.params.id == 2) tableName="chatlogqa";
    else tableName="chatlog";
    var retData = getAllEntities();
    console.log(retData);
  }
  res.send('Hello');
});


// Create Server

const server = app.listen(port, ()=>{
	console.log('Server is running on port' + port);
});


/************************** / APP ***************************/




/********************* Azure Functions ***************************/



// Connect Function

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


// Retrive All Entities

function retrieveAllEntities(res,reqid,nrows) {

  // Reset
  data = [];
  segments=0;

  var storageTableQuery = config.storage.TableQuery;
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

  retrieveAllEntitiesHelper(tableQuery, null, function (error) {

	if(error) console.log(error);
	else {
    res.render('table', {'data' : data, 'columns' : data[0], 'id' : reqid, 'nrows' : nrows});
  }
  });
}

// Download Entities

function downloadEntities(res) {

  // Reset
  data = [];
  segments=0;

  var storageTableQuery = config.storage.TableQuery;
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

  retrieveAllEntitiesHelper(tableQuery, null, function (error) {

  if(error) console.log(error);
  else {
    var str = exportToCsv(data);
    res.set('Content-Type', 'text/csv');
    res.send(str);
  }
  });
}

// Get First Entity

function getFirstEntity(res,reqid,nrows) {

  // Reset
  data = [];
  segments=0;
  segmentSize=1;

  var storageTableQuery = config.storage.TableQuery;  
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

  getFirstEntityHelper(tableQuery, null, function (error) {

  if(error) console.log(error);
  else {
    console.log("One Entity");
    console.log(data);
    res.render('visualize', {'data' : data, 'columns' : data[0], 'id' : reqid, 'tablename' : users[reqid].accountName, 'nrows' : nrows});
  }
  });
}


// Retrieve Columns Data

function retrieveColumnsData(res) {

  // Reset
  data = [];
  segments=0;
  segmentSize=20;

  var storageTableQuery = config.storage.TableQuery;
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

  retrieveColumnsDataHelper(tableQuery, null, function (error) {

  if(error) console.log(error);
  else {
    res.json(JSON.stringify(data));
  }
  });
}


// Get All Entities

function getAllEntities() {

  // Reset
  data = [];
  segments=0;
  segmentSize=20;

  var storageTableQuery = config.storage.TableQuery;
  var tableQuery = new storageTableQuery()
      .top(segmentSize);

  retrieveAllEntitiesHelper(tableQuery, null, function (error) {

  if(error) console.log(error);
  else {
    return data;
  }
  });
}


/************************** / Azure Functions ***************************/





/************************** Azure Helper Functions ***************************/

// Retrieve All Entities Helper
 
function retrieveAllEntitiesHelper(tableQuery, continuationToken, callback) {

  config.storageClient.queryEntities(tableName, tableQuery, continuationToken, function (error, result) {
    if (error) return callback(error);

    var entities = result.entries;
    entities.forEach(function (entity) {
      data.push(entity);
    });

    continuationToken = result.continuationToken;
    segments++;
    if (continuationToken && segments<noofsegments) {
      retrieveAllEntitiesHelper(tableQuery, continuationToken, callback);
    } else {
      console.log("Query completed.");
      callback();
    }
  });
}


// Get First Entity Helper

function getFirstEntityHelper(tableQuery, continuationToken, callback) {

  config.storageClient.queryEntities(tableName, tableQuery, continuationToken, function (error, result) {
    if (error) return callback(error);

    var entities = result.entries;
    entities.forEach(function (entity) {
      data.push(entity);
    });

    continuationToken = result.continuationToken;
    segments++;
    if (continuationToken && segments<noofsegments) {
      getFirstEntityHelper(tableQuery, continuationToken, callback);
    } else {
      console.log("Query completed.");
      callback();
    }
  });
}


// Retrieve Columns Data Helper

function retrieveColumnsDataHelper(tableQuery, continuationToken, callback) {

  config.storageClient.queryEntities(tableName, tableQuery, continuationToken, function (error, result) {
    if (error) return callback(error);

    var entities = result.entries;
    entities.forEach(function (entity) {
      data.push({
        'col1': entity[col1]._,
        'col2': entity[col2]._
      });
    });

    continuationToken = result.continuationToken;
    segments++;
    if (continuationToken && segments<noofsegments) {
      retrieveColumnsDataHelper(tableQuery, continuationToken, callback);
    } else {
      console.log("Query completed.");
      callback();
    }
  });
}

// Export to csv

function exportToCsv(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += JSON.stringify(array[i][index]['_']);
        }
        str += line + '\r\n';
    }
    return str;
}



/************************** / Azure Helper Functions ***************************/