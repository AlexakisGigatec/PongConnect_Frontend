import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';


@Component({
  selector: 'app-controller-component',
  templateUrl: './controller-component.html',
  styleUrls: ['./controller-component.scss']
})
export class ControllerComponent implements OnInit, OnDestroy {
  @ViewChild('joy', { static: true }) joy!: ElementRef<HTMLDivElement>;
  @Output() move = new EventEmitter<{ x: number; y: number }>();


  dragging = false;
  transform = 'translate(-50%, -50%)';

  constructor(private ws: WebsocketService) { }

  ngOnInit() {
    this.ws.connect('controller');
  }


  start(event: MouseEvent | TouchEvent) {
    this.dragging = true;
    this.update(event);
  }


  moveJoy(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    this.update(event);
  }


  end() {
    this.dragging = false;
    this.transform = 'translate(-50%, -50%)';
    this.move.emit({ x: 0, y: 0 });
    this.ws.send({ type: 'INPUT', x: 0, y: 0 });
  }


  update(event: MouseEvent | TouchEvent) {
  const rect = this.joy.nativeElement.getBoundingClientRect();
  const radius = rect.width / 2;

  const stickEl = this.joy.nativeElement.querySelector('.stick') as HTMLElement | null;
  const stickRadius = stickEl ? stickEl.getBoundingClientRect().width / 2 : 45;

  const cx = rect.left + radius;
  const cy = rect.top + radius;

  let clientX: number;
  let clientY: number;

  if ('touches' in event && event.touches.length > 0) {
    clientX = event.touches[0].clientX;
    clientY = event.touches[0].clientY;
  } else {
    clientX = (event as MouseEvent).clientX;
    clientY = (event as MouseEvent).clientY;
  }

  let dx = clientX - cx;
  let dy = clientY - cy;

  const max = radius - stickRadius;
  const dist = Math.hypot(dx, dy);

  if (dist > max) {
    dx = (dx / dist) * max;
    dy = (dy / dist) * max;
  }

  this.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;

  const normX = dx / max;
  const normY = dy / max;

  this.move.emit({ x: normX, y: normY });
  this.ws.send({ type: 'INPUT', x: normX, y: normY });
}

  ngOnDestroy() {
    this.ws.disconnect();
  }
}