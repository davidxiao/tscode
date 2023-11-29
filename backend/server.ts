import { readFileSync } from "fs";
import { parseArgs } from "util";
import { WS } from "./lib/ws";

function readDataFile(file: string) {
  if (!file) return;
  const data = readFileSync(file, { encoding: "utf8" });
  return JSON.parse(data.toString());
}

export async function main(file?: string, _interval?: string) {
  let interval = 5000;
  if (_interval && parseInt(_interval)) {
    interval = parseInt(_interval);
  }
  if (!file) return;
  const data = readDataFile(file);
  const ws = new WS();
  ws.start();

  if (!Array.isArray(data)) {
    return;
  }
  let i = 0;
  setInterval(() => {
    if (i == data.length - 1) {
      i = 0;
    }
    const msg = {
      id: data[i].id,
      image: data[i].image,
    };
    ws.send(msg);
    i++;
  }, interval);
}
const args = parseArgs({
  options: {
    interval: {
      type: "string",
      short: "i",
      default: "5000",
    },
    file: {
      type: "string",
      short: "f",
      default: "./fixture/data.json",
    },
  },
});

const { file, interval } = args.values;
console.log(file, interval);
main(file, interval);
