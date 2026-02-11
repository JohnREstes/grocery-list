const socket = io({
  path: '/grocery/socket.io'
});
const textarea = document.getElementById('list');

let ignoreUpdate = false;

// Initial load
socket.on('init', text => {
  textarea.value = text;
});

// Incoming updates
socket.on('update', text => {
  ignoreUpdate = true;
  textarea.value = text;
  ignoreUpdate = false;
});

// Send updates
textarea.addEventListener('input', () => {
  if (!ignoreUpdate) {
    socket.emit('update', textarea.value);
  }
});
