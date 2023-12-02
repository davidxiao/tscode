let canHash = true;

const outerWrapperId = "logo-outer-wrapper-id";
const outerDisConnectedClass = "outer-disconnected";
const outerConnectedClass = "outer-connected";
const innerWrapperId = "logo-inner-wrapper-id";
const innerConnectedClass = "inner-connected";

const blobs = document.getElementById("blobs");

const logoOuterWrapper = document.getElementById(outerWrapperId);
const logoInnerWrapper = document.getElementById(innerWrapperId);

function removeImages() {
  if (!blobs) {
    return;
  }
  blobs.innerHTML = "";
}
function applyConnectedCss() {
  logoOuterWrapper?.classList.remove(outerDisConnectedClass);
  logoOuterWrapper?.classList.add(outerConnectedClass);
  logoInnerWrapper?.classList.add(innerConnectedClass);
}
function applyDisconnectedCss() {
  logoOuterWrapper?.classList.remove(outerConnectedClass);
  logoOuterWrapper?.classList.add(outerDisConnectedClass);
  logoInnerWrapper?.classList.remove(innerConnectedClass);
  removeImages();
}
async function createHash(blob: Blob) {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  var hashArray = Array.from(new Uint8Array(hashBuffer));
  var hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function addButtonListener() {
  const button = document.getElementById("button");
  button?.addEventListener("click", (e) => {
    console.log(canHash);
    if (canHash) {
      canHash = false;
    } else {
      canHash = true;
    }
  });
}
async function onOpen() {
  // await sleep(5000);
  applyConnectedCss();
  console.log("WebSocket is connected!");
}
async function onMessage(socket: WebSocket, msg: any) {
  const { id, image } = JSON.parse(msg.data || {});
  const res = await fetch(image);
  if (!res?.ok) {
    return;
  }
  const blob = await res.blob();
  const div = document.createElement("div");
  div.className = "container";
  const imageElement = document.createElement("img");
  imageElement.src = URL.createObjectURL(blob);
  div.appendChild(imageElement);
  blobs?.appendChild(div);
  if (canHash) {
    const hash = await createHash(blob);
    socket.send(JSON.stringify({ id, hash }));
  } else {
    socket.send(JSON.stringify({ id, hash: null }));
  }
}
function onError(error: any) {
  console.error(`Web Socket error`, error);
}
function onClose() {
  applyDisconnectedCss();
  console.log("Disconnected from WebSocket server");
}
function connect() {
  const socket = new WebSocket("ws://localhost:8081");
  socket.onopen = onOpen;
  socket.onmessage = (msg) => {
    onMessage(socket, msg);
  };
  socket.onerror = onError;
  socket.onclose = onClose;
}

function init() {
  applyDisconnectedCss();
  addButtonListener();
  connect();
}
init();
