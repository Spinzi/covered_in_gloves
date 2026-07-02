let socket;
let resolveReady;
const ready = new Promise((res) => (resolveReady = res));

export function connect(url, onMessage) {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("Socket connected.");
    resolveReady();
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    onMessage(msg);
  };

  socket.onerror = (err) => {
    console.error("Socket error:", err);
  };
}

export function send(message) {
  const msg = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    // Wait for connection then send
    socket.addEventListener("open", () => {
      socket.send(msg);
    }, { once: true });
  }
}

export function waitForSocket(){
  return ready;
}