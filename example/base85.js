/**
* @file Data size comparison between minified JSON data, Base58 SDB data, and Base58-s (short) SDB data.
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
var base85SDB = testSDB.encode("base85");
var base85SDBs = base85SDB.substring(2, base85SDB.length);
base85SDBs = base85SDBs.substring(0, (base85SDBs.length-2));
var base85SDBSize = base85SDB.length;
var base85SDBsSize = base85SDBs.length;
console.log ("Base85 SDB Data");
console.log ("---------------");
console.log (base85SDB);
console.log ("");
console.log ("Base85 SDB-s (short) Data");
console.log ("-------------------------");
console.log (base85SDBs);
console.log ("");
console.log ("Data Size (SDB-JSON-m): "+nativeSize+" bytes");
console.log ("Data Size (SDB-b85): "+base85SDBSize+" bytes");
console.log ("Data Size (SDB-b85-s): "+base85SDBsSize+" bytes");

console.log(" ");

console.log ("Base58 SDB is approximately "+(100 - Math.floor((base85SDBSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
console.log ("Base58 SDB-s is approximately "+(100 - Math.floor((base85SDBsSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
