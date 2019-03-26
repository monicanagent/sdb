/**
* @file Example showing the various ways to , bot synchronous and asynchronous, with or without processing pipes.
* There are a few more combinations not included here -- feel free to experiment.
*
*/

const SDB = require("../");

var JSONSDB = [
   {
      "entity":"api",
      "name": "CypherPoker.JS Services",
      "description": "API services endpoint",
      "transport":"wss",
      "url":"ws://192.168.0.1",
      "port":8090
   },
   {
      "entity":"p2p",
      "name": "CypherPoker.JS Services",
      "description": "P2P rendezvous endpoint",
      "transport":"wss",
      "url":"ws://192.168.0.3",
      "port":8091
   }
];

//async function example
async function exampleAsync() {
   console.log ("\"async\" function example with no processing pipes...");

   var JSONSDBString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSDBString.length;
   console.log ("Native (JSON) Minified SDB Data");
   console.log ("--------------------------------");
   console.log (JSONSDBString);
   console.log ("");
   console.log(" ");
   var testSDB = new SDB();
   var result = await testSDB.decode(JSONSDB); //assign the array data (doesn't actually decode)
   var base64SDB = await testSDB.encode("base64");
   var base64SDBSize = base64SDB.length;
   console.log ("Base64 SDB Data");
   console.log ("---------------");
   console.log (base64SDB);
   console.log ("");
   console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
   console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
   console.log(" ");
   console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
}

//synchronous function example using Promise.then
function exampleThen() {
   console.log ("Synchronous \"Promise.then\" example with no processing pipes...");

   var JSONSBDString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSBDString.length;
   var testSDB = new SDB();
   testSDB.decode(JSONSDB).then(result => {
      testSDB.encode("base64").then (base64SDB => {
         console.log ("Native (JSON) Minified SDB Data");
         console.log ("--------------------------------");
         console.log (JSONSBDString);
         console.log ("");
         console.log(" ");
         console.log ("base64SDB="+base64SDB);
         var base64SDBSize = base64SDB.length;
         console.log ("Base64 SDB Data");
         console.log ("---------------");
         console.log (base64SDB);
         console.log ("");
         console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
         console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
         console.log(" ");
         console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
      });
   });
}

//async function example using asynchronous processing pipes
async function examplePipeAsync() {
   console.log ("\"Async\" example with asynchronous processing pipes...");

   var JSONSDBString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSDBString.length;
   console.log ("Native (JSON) Minified SDB Data");
   console.log ("--------------------------------");
   console.log (JSONSDBString);
   console.log ("");
   console.log(" ");
   var testSDB = new SDB();
   var result = await testSDB.decode(JSONSDB, null, decodeProcessPipeAsync); //assign the array data (doesn't actually decode)
   var base64SDB = await testSDB.encode("base64", encodeProcessPipeAsync);
   var base64SDBSize = base64SDB.length;
   console.log ("Base64 SDB Data");
   console.log ("---------------");
   console.log (base64SDB);
   console.log ("");
   console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
   console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
   console.log(" ");
   console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
}

//async function example using synchronous processing pipes
async function examplePipeSync() {
   console.log ("\"Async\" example with synchronous (standard function) processing pipes...");

   var JSONSDBString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSDBString.length;
   console.log ("Native (JSON) Minified SDB Data");
   console.log ("--------------------------------");
   console.log (JSONSDBString);
   console.log ("");
   console.log(" ");
   var testSDB = new SDB();
   var result = await testSDB.decode(JSONSDB, null, decodeProcessPipeSync); //assign the array data (doesn't actually decode)
   var base64SDB = await testSDB.encode("base64", encodeProcessPipeSync);
   var base64SDBSize = base64SDB.length;
   console.log ("Base64 SDB Data");
   console.log ("---------------");
   console.log (base64SDB);
   console.log ("");
   console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
   console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
   console.log(" ");
   console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
}

//standard function example using asynchronous processing pipes
function examplePipeAsyncThen() {
   console.log ("Synchronous \"Promise.then\" example with asynchronous processing pipes...");

   var JSONSBDString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSBDString.length;
   var testSDB = new SDB();
   testSDB.decode(JSONSDB, null, decodeProcessPipeAsync).then(result => {
      testSDB.encode("base64", encodeProcessPipeAsync).then (base64SDB => {
         console.log ("Native (JSON) Minified SDB Data");
         console.log ("--------------------------------");
         console.log (JSONSBDString);
         console.log ("");
         console.log(" ");
         console.log ("base64SDB="+base64SDB);
         var base64SDBSize = base64SDB.length;
         console.log ("Base64 SDB Data");
         console.log ("---------------");
         console.log (base64SDB);
         console.log ("");
         console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
         console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
         console.log(" ");
         console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
      });
   });
}

//synchronous function example using Promise.then and synchronous pipe processing functions
function examplePipeSyncThen() {
   console.log ("Synchronous \"Promise.then\" example with synchronous \"Promise.then\" processing pipes...");

   var JSONSBDString = JSON.stringify(JSONSDB, 0);
   var JSONSDBSize = JSONSBDString.length;
   var testSDB = new SDB();
   testSDB.decode(JSONSDB, null, decodeProcessPipePromise).then(result => {
      testSDB.encode("base64", encodeProcessPipePromise).then (base64SDB => {
         console.log ("Native (JSON) Minified SDB Data");
         console.log ("--------------------------------");
         console.log (JSONSBDString);
         console.log ("");
         console.log(" ");
         console.log ("base64SDB="+base64SDB);
         var base64SDBSize = base64SDB.length;
         console.log ("Base64 SDB Data");
         console.log ("---------------");
         console.log (base64SDB);
         console.log ("");
         console.log ("Data Size (SDB-JSON-m): "+JSONSDBSize+" bytes");
         console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
         console.log(" ");
         console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / JSONSDBSize) * 100))+"% smaller than JSON-m SDB data.");
      });
   });
}

//asynchronous decode processing pipe example
async function decodeProcessPipeAsync (sdbBuffer) {
   console.log ("...doing some asynchronous pre-decoding processing on the SDB Buffer object now...")
   return (sdbBuffer); //or different Buffer if desired
}

//asynchronous encode processing pipe example
async function encodeProcessPipeAsync (sdbBuffer) {
   console.log ("...doing some asynchronous pre-encoding processing on the SDB Buffer object now...")
   return (sdbBuffer); //or different Buffer if desired
}

//synchronous (standard function) decode processing pipe example
function decodeProcessPipeSync (sdbBuffer) {
   console.log ("...doing some synchronous pre-decoding processing on the SDB Buffer object now...")
   return (sdbBuffer); //or different Buffer if desired
}

//synchronous (standard function) encode processing pipe example
function encodeProcessPipeSync (sdbBuffer) {
   console.log ("...doing some synchronous pre-encoding processing on the SDB Buffer object now...")
   return (sdbBuffer); //or different Buffer if desired
}

//asynchronous decode processing pipe example written as a synchronous function
function decodeProcessPipePromise (sdbBuffer) {
   var promise = new Promise((resolve, reject) => {
      console.log ("...doing some synchronous pre-decoding processing on the SDB Buffer object now...")
      resolve (sdbBuffer); //or different Buffer if desired
   })
   return (promise);
}

//asynchronous encode processing pipe example written as a synchronous function
function encodeProcessPipePromise (sdbBuffer) {
   var promise = new Promise((resolve, reject) => {
      console.log ("...doing some synchronous pre-encoding processing on the SDB Buffer object now...")
      return (sdbBuffer); //or different Buffer if desired
   })
   return (promise);
}

exampleAsync();
exampleThen();
examplePipeAsync();
examplePipeSync();
examplePipeAsyncThen();
examplePipeSyncThen();
//.. etc.
