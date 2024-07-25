import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private subject: Subject<any>;

  constructor() {
    this.subject = new Subject<any>();
  }

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', (event) => {
      console.log('WebSocket is open now.');
    });

    this.socket.addEventListener('message', (event) => {
      const response = JSON.parse(event.data);
      this.subject.next(response);
    });

    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket is closed now.');
    });

    this.socket.addEventListener('error', (event) => {
      console.error('WebSocket error observed:', event);
    });
  }

  sendMessage(message: any): void {
    this.socket.send(JSON.stringify(message));
  }

  getMessages(): Observable<any> {
    return this.subject.asObservable();
  }
}