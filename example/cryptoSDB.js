/**
* @file Demonstrates how a processing pipe can be used to encrypt and decrypt SDB data.
*
*/
const SDB = require("../");
const crypto = require('crypto');

const sharedPassphrase = "Super Secret Shared Password"; //shared between sender and recipient of SDB data
const passPhraseHash = crypto.createHash('sha256').update(sharedPassphrase).digest();
const nonce = crypto.randomBytes(16);


var JSONSDB = [
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

async function example() {
   console.log ("Native JSON SDB Data");
   console.log ("----------------------");
   console.log ("");
   console.dir (JSONSDB);
   console.log ("");
   var JSONSDBString = JSON.stringify(JSONSDB, 0);
   var encryptSDB = new SDB();
   var result = encryptSDB.decode(JSONSDB); //just assigns it since it's an array
   var plainBase85SDB = await encryptSDB.encode("base85"); //convert to plaintext Base58
   // Sender encrypts the SDB...
   console.log ("-------------------------");
   console.log ("Plaintext Base85 SDB Data");
   console.log ("-------------------------");
   console.log ("");
   console.log (plainBase85SDB);
   console.log ("");
   var base85SDB = await encryptSDB.encode("base85", encodePipe); //convert to Base58 with encoding (encryption) pipe
   console.log ("-------------------------");
   console.log ("Encrypted Base85 SDB Data");
   console.log ("-------------------------");
   console.log ("");
   console.log (base85SDB);
   console.log ("");
   // ... then sends base85SDB to receiving peer who can then...
   var decryptSDB = new SDB();
   var result = await decryptSDB.decode(base85SDB, "base85", decodePipe); //convert from Base58 with decoding (decryption) pipe
   console.log ("-------------------------");
   console.log ("Decrypted Base85 SDB Data");
   console.log ("-------------------------");
   console.log ("");
   console.dir (decryptSDB.data);
   // ... use decryptSDB.data to determine connectivity options.
}

//encoding pipe that encrypts the data using AES-256 in CBC mode
async function encodePipe(sdbBuffer) {
   var cipher = crypto.createCipheriv('aes-256-cbc', passPhraseHash, nonce);
   return (Buffer.concat([cipher.update(sdbBuffer), cipher.final()]));
}

//decoding pipe that decrypts the data using AES-256 in CBC mode
async function decodePipe(sdbBuffer) {
   var decipher = crypto.createDecipheriv('aes-256-cbc', passPhraseHash, nonce);
   return (Buffer.concat([decipher.update(sdbBuffer), decipher.final()]));
}

example();
