import { Duplex } from "stream";
import { WS } from "../src/ws";
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
});
