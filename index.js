'use strict';

/**
* @file Services Descriptor Bundle encoding and decoding library.
*
* @version 0.1.3
* @author Patrick Bay (Monican Agent)
* @copyright MIT License
*/

/**
* @class  Handles encoding and decoding of Services Descriptor Bundle data to / from
* various formats.
*
* @see  Ascii85/Base85 encoding and decoding adapted from ascii85.js by Yuri Konotopov -
* <a href="https://github.com/nE0sIghT/ascii85.js">https://github.com/nE0sIghT/ascii85.js</a>
*/
module.exports = class SDB {

   /**
   * Creates a new SDB instance.
   */
   constructor() {
   }

   /**
   * @property {Number} version=0 The SDB header / data format version
   * used with coded binary data.
   */
   static get version() {
      return (0);
   }

   /**
   * @property {Array} data=null The native JavaScript indexed array containing
   * the SDB associated with this instance.
   *
   * @readonly
   */
   get data() {
      if (this._data == undefined) {
         this._data = null;
      }
      return (this._data);
   }

   /**
   * @property {Buffer} bin=null The native binary Buffer containing the SDB
   * associated with this instance.
   *
   * @readonly
   */
   get bin() {
      if (this._bin == undefined) {
         this._bin = null;
      }
      return (this._bin);
   }

   /**
   * Encodes the native SDB [data]{@link SDB@data} object to a compressed
   * base85 or base64 string. The processed binary data is also set to the
   * [bin]{@link SDB@bin} Buffer.
   *
   * @param {String} [encoding="base85"] The desired data encoding to use,
   * either "base85" or "base64".
   * @param {Function} [processPipe=null] An optional processing function
   * to be applied to the SDB binary Buffer before applying the <code>encoding</code>.
   * If the referenced function is asynchronous (it returns a <code>Promise</code>),
   * then This function will also return a <code>Promise</code> that will
   * resolve when the <code>processPipe</code> has resolved, otherwise
   * this function will be trated as a synchronous inline function.
   *
   * @return {Promise} An asynchronous promise is returned that resolves withthe
   * SDB [data]{@link SDB@data} in the desired encoding.
   *
   */
   encode(encoding="base85", processPipe=null) {
      if (this.data == null) {
         throw (new Error("No SDB to encode."));
      }
      var entitiesBuff = Buffer.alloc(0);
      var historyArr = new Array();
      for (var count=0; count < this.data.length; count++) {
         var entityData = this.data[count];
         var encodedEntity = this.encodeEntity(entityData, count, historyArr);
         var newLength = entitiesBuff.length + encodedEntity.length;
         entitiesBuff = Buffer.concat([entitiesBuff, encodedEntity], newLength);
      }
      //prepend version
      var versionBuff = Buffer.from([SDB.version]);
      newLength = entitiesBuff.length + 1;
      entitiesBuff = Buffer.concat([versionBuff, entitiesBuff], newLength);
      this._bin = entitiesBuff;
      var promise = new Promise((resolve, reject) => {
         if (processPipe != null) {
            var result = processPipe(entitiesBuff);
            if (result instanceof Promise) {
               result.then(entitiesBuff => {
                  if ((encoding == "base85") || (encoding == "ascii85")) {
                     var returnStr = this.bufferToBase85(entitiesBuff);
                  } else if (encoding == "base64") {
                     returnStr = entitiesBuff.toString(encoding);
                  } else if (encoding == "none") {
                     returnStr = null;
                  }
                  resolve(returnStr);
               })
            } else {
               if ((encoding == "base85") || (encoding == "ascii85")) {
                  var returnStr = this.bufferToBase85(entitiesBuff);
               } else if (encoding == "base64") {
                  returnStr = entitiesBuff.toString(encoding);
               } else if (encoding == "none") {
                  returnStr = null;
               }
               resolve(returnStr);
            }
         } else {
            if ((encoding == "base85") || (encoding == "ascii85")) {
               var returnStr = this.bufferToBase85(entitiesBuff);
            } else if (encoding == "base64") {
               returnStr = entitiesBuff.toString(encoding);
            } else if (encoding == "none") {
               returnStr = null;
            }
            resolve(returnStr);
         }
      });
      return (promise);
   }

   /**
   * Decodes the supplied SDB data and assigns it to the [data]{@link SDB@data}
   * and [bin]{@link SDB@bin} properties if successful.
   *
   * @param {String|Array|Buffer} SDBData The data to decode. If this is a string,
   * it is decoded using either the detected encoding method or the one specified
   * by the <code>encoding</code> parameter. If this is an array it's assumed to
   * be a native object and assigned to [data]{@link SDB@data} and [data]{@link SDB@data}.
   * If this is a Buffer, it's assigned directly to the [data]{@link SDB@data} and
   * decoded to [data]{@link SDB@data}.
   * @param {String} [encoding=null] The string encoding used for <code>SDBData</code>
   * if it's a string. If <code>SDBData</code> is not a string this parameter is ignored.
   * If <code>processPipe</code> was supplied and was asynchronous (it returned a
   * <code>Promise</code>) then a <code>Promise</code> will also be returned here and
   * resolved when the <code>processPipe</code> resolves.
   * @param {Function} [processPipe=null] An optional processing function
   * to be applied to the decoded but unparsed SDB binary Buffer before applying
   * the <code>decoding</code>.
   *
   * @return {Promise} An asynchronous promise is returned that resolves when the
   * decoding process has completed.
   */
   decode(SDBData, encoding=null, processPipe=null) {
      if (SDBData instanceof Array) {
         //no need to parse this
         this._data = SDBData;
         var promise = new Promise((resolve, reject) => {
            this.encode("none").then(result => {
               if (processPipe != null) {
                  if (processPipe instanceof Promise) {
                     processPipe(this.bin).then(result => {
                        resolve (this.bin);
                     })
                  } else {
                     result = processPipe(this.bin);
                     resolve (this.bin);
                  }
               } else {
                  resolve (this.bin);
               }
            });
         });
         return (promise);
      } else if (SDBData instanceof Buffer) {
         //already native
         var decodeBuff = SDBData;
      } else if (typeof(SDBData) == "string") {
         //either Base85 or Base64
         SDBData = SDBData.trim();
         if ((SDBData.indexOf("<~") > -1) || (encoding == "base85") || (encoding == "ascii85")) {
            decodeBuff = this.base85ToBuffer(SDBData);
         } else {
            decodeBuff = Buffer.from(SDBData, "base64");
         }
      } else {
         throw (new Error("Data type not recognized."));
      }
      var promise = new Promise((resolve, reject) => {
         if (processPipe != null) {
            var response = processPipe(decodeBuff);
            if (response instanceof Promise) {
               response.then(decodeBuff => {
                  var sdbVersion = decodeBuff.readUInt8(0);
                  if (sdbVersion != SDB.version) {
                     //future revisions may need more comlex checks
                     throw (new Error("SDB verion "+sdbVersion+ " does not match supported version "+SDB.version));
                  }
                  this._data = new Array();
                  var historyArr = new Array();
                  var entityIndex = 0;
                  var offset = 1;
                  while (offset < decodeBuff.length) {
                     var entityObj = this.readEntity(decodeBuff, offset);
                     offset = entityObj.nextOffset;
                     this._data.push(this.decodeEntity(entityObj, entityIndex, historyArr));
                     entityIndex++;
                  }
               });
               resolve(true);
            } else {
               var sdbVersion = decodeBuff.readUInt8(0);
               if (sdbVersion != SDB.version) {
                  //future revisions may need more comlex checks
                  throw (new Error("SDB verion "+sdbVersion+ " does not match supported version "+SDB.version));
               }
               this._data = new Array();
               var historyArr = new Array();
               var entityIndex = 0;
               var offset = 1;
               while (offset < decodeBuff.length) {
                  var entityObj = this.readEntity(decodeBuff, offset);
                  offset = entityObj.nextOffset;
                  this._data.push(this.decodeEntity(entityObj, entityIndex, historyArr));
                  entityIndex++;
               }
               resolve(true);
            }
         } else {
            var sdbVersion = decodeBuff.readUInt8(0);
            if (sdbVersion != SDB.version) {
               //future revisions may need more comlex checks
               throw (new Error("SDB verion "+sdbVersion+ " does not match supported version "+SDB.version));
            }
            this._data = new Array();
            var historyArr = new Array();
            var entityIndex = 0;
            var offset = 1;
            while (offset < decodeBuff.length) {
               var entityObj = this.readEntity(decodeBuff, offset);
               offset = entityObj.nextOffset;
               this._data.push(this.decodeEntity(entityObj, entityIndex, historyArr));
               entityIndex++;
            }
            resolve(true);
         }
      });
      return (promise);
   }

   /**
   * Encodes a binary Buffer to a Base85 / Ascii85 string.
   *
   * @param {Buffer} dataBuff The binary buffer to encode.
   * @param {Boolean} [useDelimiters=true] If true, the Base85 <code><~ .. ~></code>
   * bookend delimiters are included with the encoded string, otherwise the string
   * is returned without them.
   *
   *  @return {String} The Base85 / Ascii85 encoded string representation of the
   * <code>dataBuff</code> Buffer.
   */
   bufferToBase85(dataBuff, useDelimiters=true)	{
      var output = new Array();
      if (useDelimiters) {
      	output.push(0x3c);
      	output.push(0x7e);
      }
      for (var count = 0; count < dataBuff.length; count += 4) {
      	let uint32 = Buffer.alloc(4);
      	let bytes = 4;
      	for (var count2 = 0; count2 < 4; count2++) {
      		if ((count + count2) < dataBuff.length) {
      			uint32[count2] = dataBuff[count + count2];
      		} else {
      			uint32[count2] = 0x00;
      			bytes--;
      		}
      	}
      	var chunk = this.getB85EncChunk(uint32, bytes);
      	for (count2 = 0; count2 < chunk.length; count2++) {
      		output.push(chunk[count2]);
      	}
      }
      if (useDelimiters) {
      	output.push(0x7e);
      	output.push(0x3e);
      }
      var outBuff = Buffer.from(output);
      output = outBuff.toString("ascii");
      return (output);
   }

   /**
   * Encodes a Base85 / Ascii85 representation of a 32-bit unsigned integer.
   *
   * @param {Array} uint32 The data array containing values to encode.
   *
   * @return {String} A Base85 / Ascii85 representation if the input <code>uint32</code>.
   *
   * @private
   */
   getB85EncChunk(uint32) {
      var bytes = 4;
		var dataChunk = ((uint32[0] << 24) | (uint32[1] << 16) | (uint32[2] << 8) | uint32[3]) >>> 0;
		if (dataChunk === 0 && bytes == 4) {
			var output = Buffer.alloc(1);
			output[0] = 0x7a;
		} else {
			output = Buffer.alloc(bytes + 1);
			for (var count = 4; count >= 0; count--) {
				if (count <= bytes) {
					output[count] = dataChunk % 85 + 0x21;
				}
				dataChunk /= 85;
			}
		}
		return (output);
	}

   /**
   * Converts a native 32-bit value to a multibyte array.
   *
   * @param {Number} uint32 The 32-bit value to split into 4 bytes.
   * @param {Number} bytes The number of bytes in the <code>uint32</code>
   * parameter to process.
   *
   * @return {Array} A byte array containg the binary representation of
   * the input <code>uint32</code>
   *
   * @private
   */
   uint32ToArray(uint32, bytes=4) {
      var bitArr = [24, 16, 8, 0];
      let output = Buffer.alloc(bytes);
		for (var count = 0; count < bytes; count++) {
			output[count] = (uint32 >> bitArr[count]) & 0x00ff;
		}
		return (output);
	}

   /**
   * Converts a 32-bit unsigned integer value to a 4-byte array and
   * pushes it onto an existing array of 4-byte values.
   *
   * @param {Number} uint32 The unsigned 32-bit integer value to push.
   * @param {Number} uintIndex The number of bytes, minus 1, to convert
   * to a byte array from <code>uint32</code>/
   * @param {Array} uint32Array The byte array to which to append the byte
   * array created from <code>uint32</code>.
   *
   * @private
   */
   pushUint32Array(uint32, uintIndex, uint32Array)	{
      var byteArray = this.uint32ToArray(uint32, uintIndex - 1);
      for (var count = 0; count < byteArray.length; count++)  {
         uint32Array.push(byteArray[count]);
      }
   }

   /**
   * Converts a Base85 / Ascii85 string to a Buffer.
   *
   * @param {String} b85String The Base58-encoded string to convert.
   *
   * @return {Buffer} The binary data represented by the <code>b85String</code>.
   *
   * @private
   */
   base85ToBuffer(b85String) {
      var pow85Arr = [Math.pow(85,4), Math.pow(85,3), Math.pow(85,2), 85, 1];
		var output = new Array();
		var stop = false;
		var uint32 = 0;
		var uint32Index = 0;
      var position = 0;
      if ((b85String.startsWith("<~") && b85String.length) > 2) {
         var position = 2;
      }
		do	{
			if (b85String.charAt(position).trim().length === 0) {
            //skip whitespace
				continue;
         }
			var charCode = b85String.charCodeAt(position);
			switch(charCode) {
				case 0x7a:
					if (uint32Index != 0) {
						throw (new Error("Unexpected 'z' character at position " + i));
					}
					for (var count = 0; count < 4; count++)	{
						output.push(0x00);
					}
					break;
				case 0x7e:
					var nextChar = '';
					var count = position + 1; // Skip whitespace + 1;
					while (count < b85String.length && nextChar.trim().length == 0)	{
						nextChar = b85String.charAt(count++);
					}
					if (nextChar != '>') {
						throw (new Error("Broken EOD at position " + j));
					}
					if (uint32Index) {
						uint32 += pow85Arr[uint32Index - 1];
						this.pushUint32Array(uint32, uint32Index, output);
                  uint32 = uint32Index = 0;
					}
					stop = true;
					break;
				default:
					if ((charCode < 0x21) || (charCode > 0x75)) {
						throw (new Error("Unexpected character with code " + charCode + " at position " + position));
					}
					uint32 += (charCode - 0x21) * pow85Arr[uint32Index++];
					if (uint32Index >= 5) {
						this.pushUint32Array(uint32, uint32Index, output);
                  uint32 = uint32Index = 0;
					}
			}

   	} while ((position++ < b85String.length) && (stop == false));
      var outputBuff = Buffer.from(output);
		return (outputBuff);
	}

   /**
   * Reads a single SDB entity binary object and returns information about it.
   *
   * @param {Buffer} SDBBuffer The Buffer cotaining the entity to read.
   * @param {Number} offset The byte offset at which the SDB entity starts within
   * the <code>SDBBuffer</code>
   *
   * @return {Object} Contains the starting <code>offset</code> of the entity,
   * the <code>nextOffset</code> (offset of the next entity), SDB <code>headerSize</code>,
   * SDB <code>dataSize</code>, the <code>totalSize</code> (header plus data), the
   * SDB entity <code>type</code>, and a pointer Buffer to the entity <code>data</code>.
   *
   * @private
   */
   readEntity(SDBBuffer, offset) {
      var headerSize = 5; //includes type and size
      var entityType = SDBBuffer.readUInt8(offset + 0);
      var dataSize = SDBBuffer.readUInt8(offset + 1) << 24;
      dataSize = dataSize | SDBBuffer.readUInt8(offset + 2) << 16;
      dataSize = dataSize | (SDBBuffer.readUInt8(offset + 3) << 8);
      dataSize = dataSize | SDBBuffer.readUInt8(offset + 4);
      var entityData = SDBBuffer.slice(offset + headerSize, offset + headerSize + dataSize); //note that this is a shared reference, not a new instance
      var returnObj = new Object();
      returnObj.offset = offset;
      returnObj.nextOffset = offset + dataSize + headerSize;
      returnObj.headerSize = headerSize;
      returnObj.dataSize = dataSize;
      returnObj.totalSize = dataSize + headerSize;
      returnObj.type = entityType;
      returnObj.data = entityData;
      return (returnObj);
   }

   /**
   * Decodes a single SDB entity and all of the contained data elements.
   *
   * @param {Object} entityObj An entity information object such as that cerated by
   * [readEntity]{@link SDB#readEntity}.
   * @param {Number} entityIndex The index of the entity being decoded, usually reflected
   * in the entity's position within the [data]{@link SDB#data} array.
   * @param {Array} historyArr Array of objects to use to determine reference data.
   *
   * @return {Object} The native JavaScript object representation of the SDB entity
   * stored in <code>entityObj<code>.
   *
   * @private
   */
   decodeEntity(entityObj, entityIndex, historyArr) {
      var returnObj = new Object();
      switch(entityObj.type) {
         case 0:
            returnObj.entity = "api";
            break;
         case 1:
            returnObj.entity = "p2p";
            break;
         case 2:
            returnObj.entity = "peer";
            break;
         default:
            break;
      }
      var offset = 0;
      var entityData = this.readEntityData(entityObj.data, offset);
      while (entityData != null) {
         offset = entityData.offset;
         var entPropObj = this.getEntPropHistory(entityData.name, entityData.value, historyArr);
         var previousIndex = entPropObj.entityIndex;
         if (previousIndex > -1) {
            //previous entity property already exists in history
            for (var count=0; count < historyArr.length; count++) {
               var historyObj = historyArr[count];
               if ((historyObj.propName == entityData.name) && (historyObj.entityIndex == previousIndex)) {
                  entityData.value = historyObj.propValue;
               }
            }
         }
         returnObj[entityData.name] = entityData.value;
         this.addEntPropHistory (entityData.name, entityData.value, entityIndex, historyArr);
         entityData = this.readEntityData(entityObj.data, offset);
      }
      return (returnObj);
   }

   /**
   * Reads the data, properties, or name-value pair of a SDB entity.
   *
   * @param {Buffer} entityBuffer The Buffer from which to extract the entity data.
   * @param {Number} offset The offset, in bytes, of the data to extract within the
   * entity data.
   *
   * @return {Object} The extracted data <code>name</code>, <code>value</code>,
   * and an updated <code>offset</code> pointing to the next entity data object.
   *
   * @private
   */
   readEntityData(entityBuffer, offset) {
      if (entityBuffer.length == 0) {
         return (null);
      }
      if (offset >= entityBuffer.length) {
         return (null);
      }
      var returnObj = new Object();
      var descriptorType = entityBuffer.readUInt8(offset);
      var typeHeaderSize = 1; //1 byte for descriptorType
      switch (descriptorType) {
         case 0:
            //name
            var dataLength = entityBuffer.readUInt8(offset + 1) << 8;
            dataLength = dataLength | entityBuffer.readUInt8(offset + 2);
            typeHeaderSize += 2; //2 bytes for dataLength
            var sliceStart = typeHeaderSize + offset;
            var sliceEnd = dataLength + typeHeaderSize + offset;
            var entityData = entityBuffer.slice(sliceStart, sliceEnd);
            returnObj.name = "name";
            returnObj.value = entityData.toString("utf8");
            returnObj.offset = offset + entityData.length + typeHeaderSize;
            break;
         case 1:
            //description
            dataLength = entityBuffer.readUInt8(offset + 1) << 8;
            dataLength = dataLength | entityBuffer.readUInt8(offset + 2);
            typeHeaderSize += 2; //2 bytes for dataLength
            sliceStart = typeHeaderSize + offset;
            sliceEnd = dataLength + typeHeaderSize + offset;
            entityData = entityBuffer.slice(sliceStart, sliceEnd);
            returnObj.name = "description";
            returnObj.value = entityData.toString("utf8");
            returnObj.offset = offset + dataLength + typeHeaderSize;
            break;
         case 2:
            //type
            var typeVal = entityBuffer.readUInt8(offset + 1);
            typeHeaderSize += 1;
            returnObj.name = "transport";
            switch (typeVal) {
               case 0:
                  returnObj.value = "http";
                  break;
               case 1:
                  returnObj.value = "wss";
                  break;
               case 2:
                  returnObj.value = "webrtc";
                  break;
               default:
                  returnObj.value = "";
                  break;
            }
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 3:
            //protocol
            returnObj.name = "protocol";
            typeVal = entityBuffer.readUInt8(offset + 1);
            typeHeaderSize += 1;
            switch (typeVal) {
               case 0:
                  returnObj.value = "http";
                  break;
               case 1:
                  returnObj.value = "htps";
                  break;
               case 2:
                  returnObj.value = "ws";
                  break;
               case 3:
                  returnObj.value = "wss";
                  break;
               default:
                  returnObj.value = "";
                  break;
            }
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 4:
            //host
            returnObj.name = "host";
            typeVal = entityBuffer.readUInt8(offset + 1);
            typeHeaderSize += 1;
            switch (typeVal) {
               case 0:
                  //IPv4
                  var IPAddr = String(entityBuffer.readUInt8(offset + 2)) + ".";
                  IPAddr += String(entityBuffer.readUInt8(offset + 3)) + ".";
                  IPAddr += String(entityBuffer.readUInt8(offset + 4)) + ".";
                  IPAddr += String(entityBuffer.readUInt8(offset + 4));
                  typeHeaderSize += 4;
                  returnObj.value = IPAddr;
                  returnObj.offset = offset +  typeHeaderSize;
                  break;
               case 1:
                  //IPv6 -- not currently handled
                  //typeHeaderSize += 16;
                  returnObj.value = "";
                  break;
               case 2:
                  //named
                  dataLength = entityBuffer.readUInt8(offset + 1) << 8;
                  dataLength = dataLength | entityBuffer.readUInt8(offset + 2);
                  typeHeaderSize += 2; //2 bytes for dataLength
                  sliceStart = typeHeaderSize + offset;
                  sliceEnd = dataLength + typeHeaderSize + offset;
                  entityData = entityBuffer.slice(sliceStart, sliceEnd);
                  returnObj.value = entityData.toString("utf8");
                  returnObj.offset = offset + dataLength + typeHeaderSize;
                  break;
               default:
                  break;
            }

            break;
         case 5:
            //port
            returnObj.name = "port";
            entityData = entityBuffer.readUInt8(offset + 1) << 8;
            entityData = entityData | entityBuffer.readUInt8(offset + 2);
            typeHeaderSize += 2;
            returnObj.value = entityData;
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 6:
            //parameters
            dataLength = entityBuffer.readUInt8(offset + 1) << 16;
            dataLength = dataLength | (entityBuffer.readUInt8(offset + 2) << 8);
            dataLength = dataLength | entityBuffer.readUInt8(offset + 3);
            typeHeaderSize += 3;
            sliceStart = typeHeaderSize + offset;
            sliceEnd = dataLength + typeHeaderSize + offset;
            entityData = entityBuffer.slice(sliceStart, sliceEnd);
            returnObj.value = entityData;
            returnObj.offset = offset + dataLength + typeHeaderSize;
            break;
         case 7:
            //name reference
            returnObj.name = "name";
            var refIndex = entityBuffer.readUInt8(offset + 1) << 8;
            refIndex = refIndex | entityBuffer.readUInt8(offset + 2);
            //get history ref here
            typeHeaderSize += 2;
            returnObj.value = null;
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 8:
            //description reference
            returnObj.name = "description";
            var refIndex = entityBuffer.readUInt8(offset + 1) << 8;
            refIndex = refIndex | entityBuffer.readUInt8(offset + 2);
            //get history ref here
            typeHeaderSize += 2;
            returnObj.value = null;
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 9:
            //host reference
            returnObj.name = "host";
            var refIndex = entityBuffer.readUInt8(offset + 1) << 8;
            refIndex = refIndex | entityBuffer.readUInt8(offset + 2);
            //get history ref here
            typeHeaderSize += 2;
            returnObj.value = null;
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 10:
            //port reference
            returnObj.name = "port";
            var refIndex = entityBuffer.readUInt8(offset + 1) << 8;
            refIndex = refIndex | entityBuffer.readUInt8(offset + 2);
            //get history ref here
            typeHeaderSize += 2;
            returnObj.value = null;
            returnObj.offset = offset + typeHeaderSize;
            break;
         case 11:
            //parameters reference
            returnObj.name = "parameters";
            var refIndex = entityBuffer.readUInt8(offset + 1) << 8;
            refIndex = refIndex | entityBuffer.readUInt8(offset + 2);
            //get history ref here
            typeHeaderSize += 2;
            returnObj.value = null;
            returnObj.offset = offset + typeHeaderSize;
            break;
         default:
            break;
      }
      return (returnObj);
   }

   /**
   * Converts a native JavaScript SDB entity to a compressed binary one.
   *
   * @param {Object} entityData The native JavaScript entity object to convert
   * @param {Number} entityIndex The index of the entitiy object, usually as found
   * within the [data]{@link SDB#data} array.
   * @param {Array} historyArr The history array to use to create reference
   * data entries.
   *
   * @return {Buffer} The compressed binary representaion of the <code>entityData</code>
   * including all headers.
   *
   * @private
   */
   encodeEntity(entityData, entityIndex, historyArr) {
      var returnBuff = Buffer.alloc(0);
      var header = Buffer.alloc(0);
      for (var entityProperty in entityData) {
         var entityValue = entityData[entityProperty];
         switch (entityProperty) {
            case "entity":
               //assign to header instead of returnBuff
               var header = this.encodeSDBEntityData(entityProperty, entityValue, entityIndex, historyArr);
               break;
            case "url":
               //parse compact form url
               var urlObj = new URL(entityValue);
               var protocol = urlObj.protocol;
               protocol = protocol.split(":")[0]; //no trailing ":"
               if (protocol == "") {
                  throw (new Error("Entity URL \""+entityValue+"\" uses an invalid protocol"));
               }
               var entityBuff = this.encodeSDBEntityData("protocol", protocol, entityIndex, historyArr);
               var newLength = returnBuff.length + entityBuff.length;
               returnBuff = Buffer.concat([returnBuff, entityBuff], newLength);
               var host = urlObj.hostname;
               //strip out IPv6 URL enclosure, as per https://tools.ietf.org/html/rfc2732
               host = host.split("[").join("").split("]").join("");
               entityBuff = this.encodeSDBEntityData("host", host, entityIndex, historyArr);
               newLength = returnBuff.length + entityBuff.length;
               returnBuff = Buffer.concat([returnBuff, entityBuff], newLength);
               var port = Number(urlObj.port);
               if (port != "") {
                  entityBuff = this.encodeSDBEntityData("port", port, entityIndex, historyArr);
                  newLength = returnBuff.length + entityBuff.length;
                  returnBuff = Buffer.concat([returnBuff, entityBuff], newLength);
               }
               var search = urlObj.search;
               if (search != "") {
                  entityBuff = this.encodeSDBEntityData("parameters", search, entityIndex, historyArr);
                  newLength = returnBuff.length + entityBuff.length;
                  returnBuff = Buffer.concat([returnBuff, entityBuff], newLength);
               }
               break;
            default:
               //all other entity properties encoded as-is
               var entityBuff = this.encodeSDBEntityData(entityProperty, entityValue, entityIndex, historyArr);
               newLength = returnBuff.length + entityBuff.length;
               returnBuff = Buffer.concat([returnBuff, entityBuff], newLength);
               break;
         }
      }
      //concatenate entity length to header
      var lengthHeader = new Array();
      lengthHeader.push((returnBuff.length & 0xFF000000) >> 24);
      lengthHeader.push((returnBuff.length & 0xFF0000) >> 16);
      lengthHeader.push((returnBuff.length & 0xFF00) >> 8);
      lengthHeader.push(returnBuff.length & 0xFF);
      var entityLength = Buffer.from(lengthHeader);
      newLength = header.length + entityLength.length;
      header = Buffer.concat([header, entityLength], newLength);
      newLength = header.length + returnBuff.length;
      //concatenate entity data to header
      returnBuff = Buffer.concat([header, returnBuff], newLength);
      return (returnBuff);
   }

   /**
   * Encodes an entity's data to compressed SDB-formatted binary data.
   *
   * @param {String} propName The name of the data property to encode.
   * @param {*} propValue The value of the data property to encode.
   * @param {Number} entityIndex The index of containing entity, usually within
   * the [data]{@link SDB@data} array.
   * @param {Array} historyArr The history array to add the data to.
   *
   * @return {Buffer} The SDB-encoded binary data representation of the
   * input data.
   *
   * @private
   */
   encodeSDBEntityData(propName, propValue, propIndex, historyArr) {
      var entPropObj = this.getEntPropHistory(propName, propValue, historyArr);
      propName = entPropObj.propName;
      propValue = entPropObj.propValue;
      var encData = new Array();
      switch (propName) {
         case "entity":
            switch (propValue) {
               case "api":
                  encData.push(0);
                  break;
               case "p2p":
                  encData.push(1);
                  break;
               case "peer":
                  encData.push(2);
                  break;
               default:
                  break;
            }
            break;
         case "name":
            encData.push(0);
            var propLength = propValue.length;
            if (propLength > 65535) {
               //too long, cut off remainder
               propValue = propValue.substring(0, 65535);
            }
            encData.push ((propLength & 0xFF00) >> 8);
            encData.push (propLength & 0xFF);
            for (var count=0; count < propValue.length; count++) {
               encData.push(propValue.charCodeAt(count));
            }
            break;
         case "description":
            encData.push(1);
            var propLength = propValue.length;
            if (propLength > 65535) {
               //too long, cut off remainder
               propValue = propValue.substring(0, 65535);
            }
            encData.push ((propLength & 0xFF00) >> 8);
            encData.push (propLength & 0xFF);
            for (count=0; count < propValue.length; count++) {
               encData.push(propValue.charCodeAt(count));
            }
            break;
         case "transport":
            encData.push(2);
            switch (propValue) {
               case "http":
                  encData.push(0);
                  break;
               case "wss":
                  encData.push(1);
                  break;
               case "webrtc":
                  encData.push(2);
                  break;
               default:
                  break;
            }
            break;
         case "protocol":
            encData.push(3);
            switch (propValue) {
               case "http":
                  encData.push(0);
                  break;
               case "https":
                  encData.push(1);
                  break;
               case "ws":
                  encData.push(2);
                  break;
               case "wss":
                  encData.push(2);
                  break;
               default:
                  break;
            }
            break;
         case "host":
            encData.push(4);
            if (this.isIPv4(propValue)) {
               //resolved IPv4 host
               encData.push(0);
               var IPSplit = propValue.split(".");
               for (count = 0; count < IPSplit.length; count++) {
                  encData.push(parseInt(IPSplit[count]));
               }
            } else if (this.isIPv6(propValue)) {
               //resolved IPv6 host -- not currently handled
               // encData.push(1);
            } else {
               //named host
               encData.push(2);
               var propLength = propValue.length;
               if (propLength > 65535) {
                  //too long, cut off remainder
                  propValue = propValue.substring(0, 65535);
               }
               encData.push ((propLength & 0xFF00) >> 8);
               encData.push (propLength & 0xFF);
               for (count=0; count < propValue.length; count++) {
                  encData.push(propValue.charCodeAt(count));
               }
            }
            break;
         case "port":
            encData.push(5);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         case "parameters":
            encData.push(6);
            var propLength = propValue.length;
            if (propLength > 16777215) {
               //too long, cut off remainder
               propValue = propValue.substring(0, 16777215);
            }
            encData.push ((propLength & 0xFF0000) >> 16);
            encData.push ((propLength & 0xFF00) >> 8);
            encData.push (propLength & 0xFF);
            for (count=0; count < propValue.length; count++) {
               encData.push(propValue.charCodeAt(count));
            }
            break;
         case "_nameref":
            encData.push(7);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         case "_descref":
            encData.push(8);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         case "_hostref":
            encData.push(9);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         case "_portref":
            encData.push(10);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         case "_paramref":
            encData.push(11);
            encData.push((propValue & 0xFF00) >> 8);
            encData.push(propValue & 0xFF);
            break;
         default:
            break;
      }
      this.addEntPropHistory(propName, propValue, propIndex, historyArr);
      var returnBuff = Buffer.from(encData);
      return (returnBuff);
   }

   /**
   * Adds an entity's data property to a history array <i>if</i> it hasn't
   * already been added.
   *
   * @param {String} propName The name of the property to add.
   * @param {String} propValue The value of the property to add.
   * @param {Number} entityIndex The index of containing entity, usually within
   * the [data]{@link SDB@data} array.
   * @param {Array} historyArr The history array to add the data to.
   *
   * @return {Boolean} True if the data was added successfully, false if
   * it already existed.
   *
   * @private
   */
   addEntPropHistory (propName, propValue, entityIndex, historyArr) {
      for (var count = 0; count < historyArr.length; count++) {
         var historyObj = historyArr[count];
         if ((historyObj.propName == propName) && (historyObj.propValue == propValue)) {
            //already exists
            return (false);
         }
      }
      //not found, add it
      historyObj = new Object();
      historyObj.propName = propName;
      historyObj.propValue = propValue;
      historyObj.entityIndex = entityIndex;
      historyArr.push(historyObj);
      return (true);
   }

   /**
   * Retrieves entity reference data from a history array if available.
   *
   * @param {String} entityProperty The matching entity data property to retrieve.
   * @param {*} entityValue The matching entity value to retrieve.
   * @param {Array} historyArr The history array from which to retrieve the matching
   * reference data.
   *
   * @return {Object} Contains the <code>propName</code>, <code>propValue</code>
   * <code>entityIndex</code>, and <code>oldPropName</code> of the matching
   * reference data (i.e. previously stored in the history array), or
   * <code>oldPropName</code> will be null and <code>entityIndex</code> will be -1
   * if no matching reference exists (i.e. this is unique data).
   *
   * @private
   */
   getEntPropHistory(entityProperty, entityValue, historyArr) {
      var returnObj = new Object();
      for (var count = 0; count < historyArr.length; count++) {
         var historyObj = historyArr[count];
         if (historyObj.propName == entityProperty) {
            if ((historyObj.propValue == entityValue) || (entityValue == null)) {
               switch (historyObj.propName) {
                  case "name":
                     returnObj.propName = "_nameref";
                     returnObj.oldPropName = historyObj.propName;
                     returnObj.propValue = count;
                     returnObj.entityIndex = historyObj.entityIndex;
                     return (returnObj);
                     break;
                  case "description":
                     returnObj.propName = "_descref";
                     returnObj.oldPropName = historyObj.propName;
                     returnObj.propValue = count;
                     returnObj.entityIndex = historyObj.entityIndex;
                     return (returnObj);
                     break;
                  case "host":
                     returnObj.propName = "_hostref";
                     returnObj.oldPropName = historyObj.propName;
                     returnObj.propValue = count;
                     returnObj.entityIndex = historyObj.entityIndex;
                     return (returnObj);
                     break;
                  case "port":
                     returnObj.propName = "_portref";
                     returnObj.oldPropName = historyObj.propName;
                     returnObj.propValue = count;
                     returnObj.entityIndex = historyObj.entityIndex;
                     return (returnObj);
                     break;
                  case "parameters":
                     returnObj.propName = "_paramref";
                     returnObj.oldPropName = historyObj.propName;
                     returnObj.propValue = count;
                     returnObj.entityIndex = historyObj.entityIndex;
                     return (returnObj);
                     break;

               }
            }
         }
      }
      returnObj.propName = entityProperty;
      returnObj.oldPropName = null;
      returnObj.propValue = entityValue;
      returnObj.entityIndex = -1;
      return (returnObj);
   }

   /**
   * Checks whether a given string is a valid IPv4 address,
   *
   * @param {String} address The address string to evaluate.
   *
   * @return {Boolean} True if <code>address</code> is a valid IPv4 adress, false
   * otherwise.
   *
   * @private
   */
   isIPv4 (address) {
     if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address)) {
       return (true);
     }
     return (false);
   }

   /**
   * Checks whether a given string is a valid IPv6 address,
   *
   * @param {String} address The address string to evaluate.
   *
   * @return {Boolean} True if <code>address</code> is a valid IPv6 adress, false
   * otherwise.
   *
   * @private
   */
   isIPv6 (address) {
      if (/^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(address)) {
         return (true);
      }
      return (false);
   }
}
