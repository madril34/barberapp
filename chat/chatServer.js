const socket = io();

document.getElementById('formChat').addEventListener('submit', function (e) {
  e.preventDefault();
  const mensaje = document.getElementById('mensaje').value;
  socket.emit('mensaje', mensaje);
  document.getElementById('mensaje').value = '';
});

socket.on('mensaje', (msg) => {
  const chat = document.getElementById('chat');
  chat.innerHTML += `<p>${msg}</p>`;
});
