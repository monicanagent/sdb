/**
* @file Data size comparison between minified JSON data, Base58 SDB data, Base58-s (short) SDB data,
* and Base64 SDB data using a bare-bones descriptor.
*
*/
const SDB = require("../");

var JSONSDB = [
   {
      "entity":"api",
      "url":"http://localhost:8090"
   }
];

async function example() {
   var JSONSDBString = JSON.stringify(JSONSDB, 0);
   var nativeSize = JSONSDBString.length;
   console.log ("Native (JSON) Minified SDB Data");
   console.log ("--------------------------------");
   console.log (JSONSDBString);
   console.log ("");
   console.log(" ");
   var testSDB = new SDB();
   var result = await testSDB.decode(JSONSDB); //just assigns it since it's an array
   var base85SDB = await testSDB.encode("base85");
   var base85SDBs = base85SDB.substring(2, base85SDB.length);
   var base64SDB = await testSDB.encode("base64");
   base85SDBs = base85SDBs.substring(0, (base85SDBs.length-2));
   var base85SDBSize = base85SDB.length;
   var base85SDBsSize = base85SDBs.length;
   var base64SDBSize = base64SDB.length;
   console.log ("Base85 SDB Data");
   console.log ("---------------");
   console.log (base85SDB);
   console.log ("");
   console.log ("Base85 SDB-s (short) Data");
   console.log ("-------------------------");
   console.log (base85SDBs);
   console.log ("");
   console.log ("Base64 SDB Data");
   console.log ("---------------");
   console.log (base64SDB);
   console.log ("");
   console.log ("Data Size (SDB-JSON-m): "+nativeSize+" bytes");
   console.log ("Data Size (SDB-b85): "+base85SDBSize+" bytes");
   console.log ("Data Size (SDB-b85-s): "+base85SDBsSize+" bytes");
   console.log ("Data Size (SDB-b64): "+base64SDBSize+" bytes");
   console.log(" ");
   console.log ("Base58 SDB is approximately "+(100 - Math.floor((base85SDBSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
   console.log ("Base58 SDB-s is approximately "+(100 - Math.floor((base85SDBsSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
   console.log ("Base64 SDB is approximately "+(100 - Math.floor((base64SDBSize / nativeSize) * 100))+"% smaller than JSON-m SDB data.");
}

example();
