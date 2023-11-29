import { Duplex } from "stream";
import { createServer, IncomingMessage, Server } from "http";
import { createHash } from "crypto";
const timeout = 15000;
const opCodes = 0x0f;
const textCode = 0x01;
const closeCode = 0x08;
const maskCode = 0x80;
const msgLenCode = 0x7f;
const finCode = 0x80;

// msg length
const len125 = 125;
const len126 = 126;
const len127 = 127;
export class WS {
  sockets: Map<string, Duplex>;
  server: Server;
  idImages: Map<string, string>;
  constructor() {
    this.sockets = new Map();
    this.server = createServer();
    this.server.setTimeout(timeout);
    this.idImages = new Map();
  }
  onServerUpgrade = (req: IncomingMessage, socket: Duplex) => {
    const { headers } = req;
    const { "sec-websocket-key": reqKey } = headers;
    if (!reqKey) return socket.destroy();
    const resKey = this.createResKey(reqKey);
    const resHeaders = this.createResHeaders(resKey);
    this.sockets.set(resKey, socket);
    this.handshake(socket, resHeaders);
    socket.on("data", this.onSocketData);
    socket.on("error", this.onSocketError);
    socket.on("close", this.onSocketClose(resKey));
  };
  createResKey = (reqKey: string) => {
    const magicId = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    return createHash("sha1")
      .update(reqKey + magicId, "binary")
      .digest("base64");
  };
  createResHeaders = (resKey: string) => {
    const headers = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${resKey}`,
      "\r\n",
    ].join("\r\n");
    return headers;
  };
  onServerClose = () => {
    for (const socket of this.sockets.values()) {
      socket.destroy();
    }
    this.sockets.clear();
  };
  onSocketData = async (chunk: Buffer) => {
    const data = this.readData(chunk);
    if (!data) return;
    const redFormat = `\x1b[31m%s\x1b[0m`;
    const greenFormat = `\x1b[32m%s\x1b[0m`;
    const { id, hash } = JSON.parse(data);
    const image = this.idImages.get(id);
    const newHash = await this.createHash(id);
    let format = redFormat;
    if (hash === newHash) {
      format = greenFormat;
      console.log(format, { id, image, hash });
      return;
    }
    console.log(format, { id, image, hash });
  };
  createHash = async (id: string) => {
    const imageUrl = this.idImages.get(id);
    if (!imageUrl) {
      return;
    }
    const image = await fetch(imageUrl);
    const blob = await image.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = createHash("sha256").update(buffer).digest("hex");
    return hash;
  };

  onSocketError = (error: any) => {
    // console.log(error)
  };
  onSocketClose = (resKey: string) => {
    return () => {
      this.sockets.delete(resKey);
    };
  };
  handshake = (socket: Duplex, resHeaders: string) => {
    socket.write(resHeaders);
  };
  start(port = 8081) {
    this.server.on("close", this.onServerClose);
    this.server.on("upgrade", this.onServerUpgrade);
    this.server.listen(port, () => {
      console.log(`runninng on port ${port}`);
    });
  }
  send = (_data: any) => {
    this.idImages.set(_data.id, _data.image);
    let data = _data;
    if (typeof _data === "object") {
      data = JSON.stringify(_data);
    } else {
      data = String(_data);
    }
    const preparedData = this.prepareData(data);
    if (!preparedData) {
      console.log("no valid data to send");
      return;
    }
    for (const socket of this.sockets.values()) {
      socket.write(preparedData);
    }
  };
  hasSocket = () => {
    return this.sockets.size > 0;
  };
  unmask = (buffer: Buffer, maskingKeys: number[]): Buffer => {
    const result = Buffer.alloc(buffer.byteLength);
    for (let i = 0; i < buffer.byteLength; ++i) {
      const k = i % 4;
      const data = buffer.readUInt8(i) ^ maskingKeys[k];
      result.writeUInt8(data, i);
    }
    return result;
  };
  readData = (buffer: Buffer): string | undefined => {
    const firstByte = buffer.readUInt8(0);
    const opCode = firstByte & opCodes;

    if (opCode === closeCode || opCode !== textCode) {
      return;
    }

    const secondByte = buffer.readUInt8(1);

    let offset = 2;
    let payloadLength = secondByte & msgLenCode;

    if (payloadLength === len126) {
      offset += 2;
    } else if (payloadLength === len127) {
      offset += 8;
    }

    const isMasked = Boolean(secondByte & maskCode);

    if (isMasked) {
      const maskingKeys: number[] = [];
      for (let i = 0; i < 4; i++) {
        maskingKeys.push(buffer.readUInt8(offset));
        offset += 1;
      }
      const payload = buffer.subarray(offset);
      const result = this.unmask(payload, maskingKeys);
      return result.toString("utf-8");
    }

    return buffer.subarray(offset).toString("utf-8");
  };
  prepareData = (data: string): Buffer | undefined => {
    if (!data) return;
    const dataLen = Buffer.byteLength(data);

    let offset = 2;
    let bufferLen = dataLen;
    const len16 = 2 ** 16;
    if (dataLen > len125 && dataLen < len16) {
      offset += 2;
      bufferLen = len126;
    } else if (dataLen > len16) {
      offset += 8;
      bufferLen = len127;
    }

    const buffer = Buffer.alloc(offset + dataLen);

    // first byte, text code with fin=1
    const firstByte = finCode | textCode;
    buffer[0] = firstByte;
    buffer[1] = bufferLen;

    if (bufferLen === len126) {
      buffer.writeUInt16BE(dataLen, 2);
    } else if (bufferLen === len127) {
      buffer.writeBigUInt64BE(BigInt(dataLen), 2);
    }
    buffer.write(data, offset);
    return buffer;
  };
}
