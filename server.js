import express from 'express';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/grocery/socket.io'
});

const PORT = 3040;
const DATA_FILE = './list.json';

app.use(express.static('public'));

// Load list
function loadList() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ text: '' }, null, 2));
      return { text: '' };
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8').trim();

    if (!raw) {
      // Empty file → reset
      fs.writeFileSync(DATA_FILE, JSON.stringify({ text: '' }, null, 2));
      return { text: '' };
    }

    return JSON.parse(raw);
  } catch (err) {
    console.error('Corrupt list.json — resetting:', err.message);
    fs.writeFileSync(DATA_FILE, JSON.stringify({ text: '' }, null, 2));
    return { text: '' };
  }
}
// Save list
function saveList(text) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ text }, null, 2));
}

io.on('connection', socket => {
  const data = loadList();
  socket.emit('init', data.text);

  socket.on('update', text => {
    saveList(text);
    socket.broadcast.emit('update', text);
  });
});

server.listen(PORT, () => {
  console.log(`Grocery list running on port ${PORT}`);
});
