# Services Descriptor Bundle

## Background

SDP was created for use in CypherPoker.JS connectivity establishment. It is offered independently in the hope that it may also be useful outside of this scope.

## Motivation

In peer-to-peer networking there's often a need for bootstrap nodes and service providers to share their public connectivity information with their fellow peers; information such as neighbouring peers, alternate ports, addresses, or transports with which to connect. This information often consists of more than one URL, IP address, or port, along with additional information about the endpoints being advertised. This can lead to messy, large, and disjointed data structures that introduce various points of failure, especially when such information is intended for manual bootstrapping by peers (for example, cut-and-paste from secondary communication channels such as email, instant messaging, and so on).

The current state-of-the-art in this field is the [Session Description Protocol](https://tools.ietf.org/id/draft-ietf-mmusic-ice-sip-sdp-14.html) which, although robust and proven, suffers from a lack of _portability_ in that it cannot be easily embedded in URLs or included in short text fields, a lack of _extensibility_ in that one SDP describes just _one_ endpoint, while simultaneously exposing connectivity information to any casual observer that may see it in a secondary public channel that peers may be using to connect.

SDB addresses these limitations with an efficient and extensible binary message format. In fact, SDP data can easily be embedded within SDB (as a `parameter` option).

The SDB library includes encoding and decoding pipes that make [encryption of SDB data](https://github.com/monicanagent/sdb/blob/master/example/cryptoSDB.js) or connectivity automation relatively easy.

## Terminology

Information about a single connection within SDB data is called an _entity_. Entities may have information such as a peer or service URL, port, transport, protocol, and additional free-form parameters when this type of information is unsuitable (in relay networks, for example).

## SDB Format

The best way to illustrate the SDB format is through a couple of native JavaScript (JSON) examples:

### Entity Descriptor JSON data
```
{
   "entity": "api or p2p or peer",
   "name": "A descriptive name for the entity",
   "description": "Additional details for the entity",
   "transport": "http or wss or webrtc",
   "protocol": "http or https or ws or wss",
   "host": "www.someserver.com or IPv4 address or IPv6 address",
   "port": 80,
   "parameters":"?additional_data=to_include&plus=more"
}
```

### Entity Descriptor JSON data, compact form
```
{
   "entity": "api or p2p or peer",
   "name": "A descriptive name for the entity",
   "description": "Additional details for the entity",
   "transport": "http or wss or webrtc",
   "url": "protocol://www.someserver.com:80?additional_data=to_include&plus=more"
}
```

Descriptors **must** be stored in an indexed array, even when it's just a single entity. The two examples above are valid entity descriptors but wouldn't be valid SDB objects unless enclosed in an array:

```
[{
   "entity": "api",
   "name": "A remote API service",
   "description": "Connect to the greatest API on earth!",
   "transport": "http",
   "protocol": "https",
   "host": "www.someserver.com",
   "port": 443,
   "parameters":"?user_name=me"
}]
```

All of the descriptor properties are optional except _entity_. The following would be a valid SDB:

```
[{
   "entity": "api"
}]
```
The following is _not_ a valid SDB:
```
[{
   "name": "A descriptive name for the entity",
   "description": "Additional details for the entity",
   "transport": "http or wss or webrtc",
   "protocol": "http or https or ws or wss",
   "host": "www.someserver.com or IPv4 address or IPv6 address",
   "port": 80,
   "parameters":"?additional_data=to_include&plus=more"
}]
```

Once a valid SDB array is constructed it is reduced to a binary format by the SDB library and encoded into a human-usable form such as Base64 or Base85 / Ascii85.

### Reference Reduction

As part of the reduction process, any entities that contain properties which are contained in preceding entities (for example, the same `name`), are replaced with _reference_ values instead of their actual values. These _reference_ values are simply the indexes of the preceding entities where the values should be copied from.

Consider the following example:

```
[{
   "name": "CypherPoker.JS Services",
   "description": "API Services Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": "168.43.68.120",
   "port": 8090
},
{
   "name": "CypherPoker.JS Services",
   "description": "P2P Rendezvous Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": "168.43.68.120",
   "port": 8091
}]
```

In this example the `name`, `transport`, `protocol`, and `host` properties are the same between entities. Instead of keeping both copies, SDB replaces some of these values with the _index_ of the entity to copy them from...something like this:

```
[{
   "name": "CypherPoker.JS Services",
   "description": "API Services Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": "168.43.68.120",
   "port": 8090
},
{
   "name": 0,
   "description": "P2P Rendezvous Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": 0,
   "port": 0
}]
```

In the binary format it would take more space to replace the `transport` and `protocol` properties with references so they're copied (this would not be true in the JSON version above). The `name`, `host`, and `protocol` values, however, are replaced with a 0 meaning "get the value for these from the entity at index 0".

## SDB Binary Data Structure

While SDB data is intended to ultimately be consumed as a native JavaScript object, it's stored in a compact binary format for transmission.

A typical binary SDB looks something like this

`[SDB Header (1 byte)] + [Entity Header (5 bytes)] + [Entity Data (variable size)] + [Entity Data (variable size)] + [Entity Data (variable size)] ... [Entity Header (5 bytes)] + [Entity Data]`

This structure is made up of the following pieces:

### SDB Header (1 byte)

0 - Version number, included for forward compatibility checking.

### Entity Header (5 bytes)

Each entity begins with a 5 byte header that describes the entity type (`entity` property in the JavaScript object), and subsequent entity data size. An entity header is structured like this:

`[Entity Type] + [Entity Size]`

#### Entity Type (1 byte)

This part of the entity header indicates what type of entity is being described. This correlates with the `entity` property in JavaScript object.

0 - Services API endpoint (accounts, blockchain, etc.)<br/>
1 - Peer-to-peer Rendezvous endpoint<br/>
3 - Peer connection endpoint

#### Entity Size (4 bytes)

The total size of the following entity (excluding header). Maximum size 4294967295 bytes. It's unlikely that this limit will ever be reached but is required in order to accommodate some of the larger data structures of the entity.

### Entity Data

The entity data contains the binary equivalents of the name-value pairs that would be contained in the JavaScript entity object. Any number of data items may be contained for the entity up the limit specified in the `Entity Size` value. Entity data _may_ be duplicated but this is wasteful since only the last data item for any name will be used.

All data items are optional.

##### Entity Data Properties (1 byte)

This byte represents the name portion of the correlated JavaScript data for each entity. The following list is a summary of each supported data property:

0 - Name<br/>
1 - Description<br/>
2 - Transport<br/>
3 - Protocol<br/>
4 - Host<br/>
5 - Port<br/>
6 - Parameters<br/>
7 - Name reference<br/>
8 - Description reference<br/>
9 - Host reference<br/>
10 - Port reference<br/>
11 - Parameters reference<br/>

##### Entity Data Property Details

Each of the items in the list above are detailed below:

###### Type 0 - _Name_ (3 to 65537 bytes)

Followed by 2 bytes indicating the length of the following string, and then the string itself. Max string length is therefore 65535 bytes.

###### Type 1 - _Description_ (3 to 65537 bytes)

Followed by 2 bytes indicating the length of the following string, and then the string itself. Max string length is therefore 65535 bytes.

###### Type 2 - _Transport_ (1 byte)

The entity transport type. Defined types are:

0 - HTTP<br/>
1 - WebSocket Sessions<br/>
2 - WebRTC

The `Transport` may different from the `Protocol` in that the `Protocol` is used _over_ the transport; for example, `http` (Protocol) can be sent over `Tor` (Transport). Similarly, `HTTP` transport requests are handled nearly identically in an application whether the protocol is `HTTP` or `HTTPS`. As long as communicating parties are capable it may also be possible to mix seemingly incompatible transports and protocols: `HTTP` (Protocol) sent over `WebRTC` (Transport), for example.

###### Type 3 - _Protocol_ (1 byte)

0 - HTTP<br/>
1 - HTTPS<br/>
2 - WS<br/>
3 - WSS<br/>

###### Type 4 - _Host_ (3 to 65537 bytes)

Two types of host are defined: resolved (by IP address) or named (typically requires resolution).

0 - IPv4 (resolved) - followed by the 4 bytes of the IPv4 address.<br/>
1 - IPv6 (resolved) - followed by the 16 bytes of the IPv6 address.<br/>
2 - Named - followed by 2 bytes denoting the length of the following string, followed by the string (max length 65535 bytes)

###### Type 5 - _Port_ (5 bytes)

If excluded, the default port for the specified protocol should be used (e.g. 80 for `HTTP`).

###### Type 6 - _Parameters_ (4 to 16777215 bytes, optional)

Followed by 3 bytes indicating the length of the following string, and then the string itself. The parameters string may be URL-encoded name-value pairs, JSON data, CSV data, plain text, or other data types. Max string length is therefore 16777215 bytes.

###### Type 7 - _Name Reference_ (3 bytes)

Followed by 2 bytes denoting the index of a preceding entity's name value to use in this entity.

###### Type 8 - _Description Reference_ (3 bytes)

Followed by 2 bytes denoting the index of a preceding entity's description value to use in this entity.

###### Type 9 - _Host Reference_ (3 bytes)

Followed by 2 bytes denoting the index of a preceding entity's host value to use in this entity.

###### Type 10 - _Port Reference_ (3 bytes)

Followed by 2 bytes denoting the index of a preceding entity's port value to use in this entity.

###### Type 11 - _Parameters Reference_ (3 bytes)

Followed by 2 bytes denoting the index of a preceding entity's parameters value to use in this entity.


## Example

The following JavaScript SDB...

```
[{
   "entity":"api",
   "name": "CypherPoker.JS Services",
   "description": "API Services Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": "168.43.68.120",
   "port": 8090
},
{
   "entity":"p2p",
   "name": "CypherPoker.JS Services",
   "description": "P2P Rendezvous Endpoint",
   "transport": "wss",
   "protocol": "wss",
   "host": "168.43.68.120",
   "port": 8091
}]
```

...is reduced to the following binary SDB (in hexadecimal):

```
00 00 00 00  00 3f 00 00
17 43 79 70  68 65 72 50
6f 6b 65 72  2e 4a 53 20
53 65 72 76  69 63 65 73
01 00 15 41  50 49 20 53
65 72 76 69  63 65 73 20
45 6e 64 70  6f 69 6e 74
02 01 03 02  04 00 a8 2b
44 78 05 1f  9a 01 00 00
00 27 07 00  01 01 00 17
50 32 50 20  52 65 6e 64
65 7a 76 6f  75 73 20 45
6e 64 70 6f  69 6e 74 02
01 03 02 09  00 05 05 1f
9b
```

The first byte `00` is the version (0).

This is followed by the first 5-byte entity header `00 00 00 00 3f`.

The first byte of this entity identifies it as a type 0 ("api") entity. The next four bytes denote the size of the entity, in this
case `0000003f`, or 63 bytes (the next entity starts 64 bytes later).

Now the entity's data properties begin.

The first one is a type 0 property (`00`), a `name`. This is followed by 2 bytes denoting the length of the `name` data in this case `0017` or 23 bytes. The following 23 bytes (`43 79 70 68 65 72 ...`), are the ASCII values of the `name` data:

`43` = C<br/>
`79` = y<br/>
`70` = p<br/>
`68` = h<br/>
`65` = e<br/>
`72` = r<br/>
...

After 23 bytes the following string is assembled: `CypherPoker.JS Services`

As this entity is re-created its index (in this case 0), is stored so that any entity data _reference_ properties that refer to index 0 actually refer to the data contained in this entity.

All reference entities are exactly 3 bytes long. For example:

```
07 00 00
```

This represents a `name` data reference (`7`), which points to entity `0` (`00 00`). When this reference is encountered it would be created as a `name` property with the value of the `name` property of the entity at index `0` (which should already exist at this point).
