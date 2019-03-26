# Services Descriptor Bundle

SDP is an efficient and compact binary format used for connectivity establishment between peers, clients, and servers, designed for CypherPoker.JS

Detailed background and technical information can be found in [TECHNICAL.md](./TECHNICAL.md)

## Usage

### Node.js

1. Install the module from npm:

`npm i sdbnode`

2. Include in your code:

```
const SDB = require("SDB");
var sdb = new SDB();
```

### Browser

1. Include the SDB library bundle in your page `<head>`:

`<script src="https://monicanagent.github.io/sdb/bundle.min.js" type="text/javascript" language="javascript"></script>`

2. Include in your code:

```
var sdb = new SDB();
```

#### Now you can:

#### Decode Base85-encoded SDB data:

```
   let sdbBase85 = '<~z!\'^G`(INIeBOu3\\Deip)/kT%b;e9umBk(^q!<<j#:e;dNATDs.@qB^(ASu$tDeX*2!W`B)"9?69!!*6FRK3Bg!%J3R!<E0::bkiiEb0-!AU8N<F`S[:DId^)Bl8"o!<WB+!5PN5!sKd9~>';   
   sdb.decode(sdbBase85).then(result => {
      if (result) {
         console.dir(sdb.data);
      }
   });

   /*
   Console output:

   [ { entity: 'api',
    name: 'CypherPoker.JS Services',
    description: 'API services endpoint',
    transport: 'wss',
    protocol: 'ws',
    host: '192.168.0.0',
    port: 8090 },
  { entity: 'p2p',
    name: 'CypherPoker.JS Services',
    description: 'P2P rendezvous endpoint',
    transport: 'wss',
    protocol: 'ws',
    host: '192.168.0.0',
    port: 8091 } ]
   */
```
#### Decode Base64-encoded SDB data:
```
   let sdbBase64 = "AAAAAAA/AAAXQ3lwaGVyUG9rZXIuSlMgU2VydmljZXMBABVBUEkgc2VydmljZXMgZW5kcG9pbnQCAQMCBADAqAABBR+aAQAAACoHAAEBABdQMlAgcmVuZGV6dm91cyBlbmRwb2ludAIBAwIEAMCoAAMFH5s=";   
   sdb.decode(sdbBase64).then(result => {
      if (result) {
         console.dir(sdb.data);
      }
   });

   /*
   Console output:

   [ { entity: 'api',
    name: 'CypherPoker.JS Services',
    description: 'API services endpoint',
    transport: 'wss',
    protocol: 'ws',
    host: '192.168.0.0',
    port: 8090 },
  { entity: 'p2p',
    name: 'CypherPoker.JS Services',
    description: 'P2P rendezvous endpoint',
    transport: 'wss',
    protocol: 'ws',
    host: '192.168.0.0',
    port: 8091 } ]
   */
```
#### Encode SDB data to Base85:
```
   /* compact form combines 'protocol', 'host', and 'port' into single 'url' property */
   var sdbJS = [
      {
         entity: "api",
         url: "ws://127.0.0.1:8090"
      }
   ]
   sdb.decode (sdbJS); //already a native array object so this simply assigns the data
   sdb.encode("base85").then (result => {
      console.log ("Base85 SDB: "+result);
      console.log ("Base85 size: "+result.length);
      console.log ("Compact JSON: "+JSON.stringify(sdbJS, 0));
      console.log ("Compact JSON size: "+JSON.stringify(sdbJS, 0).length); //strips out whitespace
   });

   /*
   Console output:

   Base85 SDB: <~z!"/l1"9<oO!!*6FRK*<f~>
   Base85 size: 25
   Compact JSON: [{"entity":"api","url":"ws://127.0.0.1:8090"}]
   Compact JSON size: 46
   */
```
<small>Note that the Base85 data book-ends `<~` and `~>` may be omitted to reduce the data size by an additional 4 bytes.</small>
#### Encode SDB data to Base64:
```   
   var sdbJS = [
      {
         entity: "api",
         url: "ws://127.0.0.1:8090"
      }
   ]
   sdb.decode (sdbJS);
   sdb.encode("base64").then(result => {
      console.log ("Base64 SDB: "+result);
      console.log ("Base64 size: "+result.length);
      console.log ("Compact JSON: "+JSON.stringify(sdbJS, 0));
      console.log ("Compact JSON size: "+JSON.stringify(sdbJS, 0).length);
   });

   /*
   Console output:

   sdbBase64 SDB: AAAAAAALAwIEAH8AAAEFH5o=
   sdbBase64 size: 24
   Compact JSON: [{"entity":"api","url":"ws://127.0.0.1:8090"}]
   Compact JSON size: 46
   */
```
#### Encode SDB data to Hexadecimal:
<small>Hexadecimal encoding is not included in the `encode` function due to the (usually) large output size but here's how to do it anyway.</small>
```   
   var sdbJS = [
      {
         entity: "api",
         url: "ws://127.0.0.1:8090"
      }
   ]
   sdb.decode (sdbJS);
   sdb.encode("none").then (result => {
      console.log ("Hex SDB: "+sdb.bin.toString("hex"));
      console.log ("Hex size: "+sdb.bin.toString("hex").length);
      console.log ("Compact JSON: "+JSON.stringify(sdbJS, 0));
      console.log ("Compact JSON size: "+JSON.stringify(sdbJS, 0).length);
   });

   /*
   Console output:

   Hex SDB: 00000000000b030204007f000001051f9a
   Hex size: 34
   Compact JSON: [{"entity":"api","url":"ws://127.0.0.1:8090"}]
   Compact JSON size: 46
   */
```
#### Decode SDB data from Hexadecimal:
<small>Hexadecimal encoding is not included in the `decode` function due to the (usually) large input string size but here's how to do it anyway.</small>
```   
   let sdbHex = "00000000000b030204007f000001051f9a";
   let sdbBuffer = Buffer.from(sdbHex, "hex");
   sdb.decode(sdbBuffer).then(result => {
      if (result) {
         console.dir(sdb.data);
      }
   });   

   /*
   Console output:

   [ { entity: 'api', protocol: 'ws', host: '127.0.0.0', port: 8090 } ]
   */
```
#### And More

Other examples of SDB encoding and decoding using a mixture of asynchronous and synchronous functions as well as processing pipes can be found in the examples directory: [https://github.com/monicanagent/sdb/blob/master/example/](https://github.com/monicanagent/sdb/blob/master/example/)
