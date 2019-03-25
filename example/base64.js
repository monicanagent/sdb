/**
* @file Data size comparison between minified JSON SDB data and Base64 SDB data.
*
*/

const SDB = require("../");

var nativeSDB = [
   {
      "entity":"api",
      "name": "CypherPoker.JS Services",
      "description": "API services endpoint",
      "type":"wss",
      "url":"ws://192.168.0.1",
      "port":8090
   },
   {
      "entity":"p2p",
      "name": "CypherPoker.JS Services",
      "description": "P2P rendezvous endpoint",
      "type":"wss",
      "url":"ws://192.168.0.3",
      "port":8091
   }
];

var nativeSDBString = JSON.stringify(nativeSDB, 0);
var nativeSize = nativeSDBString.length;
console.log ("Native (JSON) Minified SDB Data");
console.log ("--------------------------------");
console.log (nativeSDBString);
console.log ("");
console.log(" ");
var testSDB = new SDB(nativeSDB);
var base64SDB = testSDB.encode("base64");
var base64SDBSize = base64SDB.length;
console.log ("Base64 SDB Data");
console.log ("---------------");
console.log (base64SDB);
console.log ("");
console.log ("Data Size (SDB-JSON-m): "+nativeSize+" bytes");
console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");

console.log(" ");

console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
