import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface InputMessage {
  type: 'INPUT';
  x: number;
  y: number;
  player?: number;
}

@Injectable({providedIn: 'root'})
export class WebsocketService {
    private socket!: WebSocket;
    messages = new Subject<any>();

  
  connect(role: 'game' | 'controller') {
    this.socket = new WebSocket('ws://localhost:5000/ws');

    this.socket.onopen = () => {
      console.log('WebSocket verbunden als', role);
      this.socket.send(JSON.stringify({ role }));
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.messages.next(data);
      } catch (err) {
        console.error('Ungültige WebSocket-Nachricht', err);
      }
    };

    this.socket.onerror = (err) => console.error('WebSocket Error', err);

    this.socket.onclose = () => console.log('WebSocket geschlossen');
  }

  send(message: InputMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect() {
    this.socket?.close();
  }
}