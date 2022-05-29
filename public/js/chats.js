const socket = io('/chats');

// Socket Events
socket.onAny((event, ...args) => {
  console.log(`[ ${event} ]: ${args}`);
});
