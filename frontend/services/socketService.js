import { io } from 'socket.io-client';
import { SOCKET_URL } from './apiConfig';

class SocketService {
  socket = null;

  connect(userId) {
    if (this.socket) return;

    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();
