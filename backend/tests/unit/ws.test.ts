import { Duplex } from "stream";
import { WS } from "../../lib/ws";
import { IncomingMessage } from "http";
describe("ws", () => {
  let ws: WS;
  let socket: Duplex;
  beforeEach(() => {
    ws = new WS();
    if (socket) {
      socket.destroy();
    }
  });
  it("hooks should be called for onServerUpgrade", () => {
    ws.createResHeaders = jest.fn((x) => "xx");
    ws.createResKey = jest.fn((x) => "xx");
    ws.handshake = jest.fn((x, y) => "xx");
    const req = {
      headers: {
        "sec-websocket-key": "xxx",
      },
    } as IncomingMessage;
    socket = new Duplex();
    ws.onServerUpgrade(req, socket);
    expect(ws.createResHeaders).toHaveBeenCalled();
    expect(ws.createResKey).toHaveBeenCalled();
    expect(ws.handshake).toHaveBeenCalled();
    expect(ws.sockets.size).toEqual(1);
  });
  it("onSocketData will work", () => {
    const msg = {
      id: 56197,
      image: undefined,
      hash: "78d43985ed5347f0834f4d3b1d7304b4262fa3d966fae890264b424bcc11db21",
    };
    const image = "";
    ws.idImages.set(`${msg.id}`, image);

    ws.readData = jest.fn().mockReturnValue(JSON.stringify(msg));
    ws.createHash = jest.fn().mockResolvedValue("aaaa");
    const buffer = Buffer.from([0]);
    ws.onSocketData(buffer);
    expect(ws.readData).toHaveBeenCalled();
    expect(ws.createHash).toHaveBeenCalled();
  });
});
