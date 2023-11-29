import { createServer } from "http";
import { promisify } from "util";
import { read, readFile as readFileAsync } from "fs";
import { join, extname, basename } from "path";
const readFile = promisify(readFileAsync);
const port = 8080;

const server = createServer(async (req, res) => {
  const files = ["app.js", "logo.svg", "index.html", "style.css"];
  const contentTypes: any = {
    ".svg": {
      "Content-Type": "image/svg+xml",
    },
    ".html": {
      "Content-Type": "text/html",
    },
    ".js": {
      "Content-Type": "text/javascript",
    },
    ".css": {
      "Content-Type": "text/css",
    },
  };
  try {
    const { url } = req;
    console.log(`url=${url}`);
    if (!url) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    const file = basename(url);
    console.log(`file=${file}`);
    if (!file || !files.includes(file)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    const filePath = join(".", "dist", file);
    const ext = extname(url);
    console.log(`ext:${ext}`);
    const contentType = contentTypes[ext];
    const data = await readFile(filePath);
    console.log(contentType);
    res.writeHead(200, contentType);
    res.end(data);
  } catch (err: any) {
    console.log(err);
    if (err.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    } else {
      // For other errors, return a 500 response
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});
server.listen(port, () => {
  console.log(`running on port ${port}`);
});
