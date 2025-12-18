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
    console.log('Rolle gesetzt:', 'controller');
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


  update(event: any) {
    const rect = this.joy.nativeElement.getBoundingClientRect();

    // Use vertical radius based on height so the stick can travel the full box height
    const radiusY = rect.height / 2;

    const stickEl = this.joy.nativeElement.querySelector('.stick') as HTMLElement | null;
    const stickRadius = stickEl ? stickEl.getBoundingClientRect().width / 2 : 45;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + radiusY;

    const touch = event.touches?.[0] || event.changedTouches?.[0];
    const clientX = touch ? touch.clientX : (event.clientX ?? 0);
    const clientY = touch ? touch.clientY : (event.clientY ?? 0);

    let dx = 0;
    let dy = clientY - centerY;

    // Limit movement based on vertical radius and stick size
    const max = Math.max(radiusY - stickRadius, 1);

    // Cap dy to within [-max, max]
    if (Math.abs(dy) > max) {
      dy = (dy / Math.abs(dy)) * max;
    }

    this.transform = `translate(-50%, -50%) translate(0px, ${dy}px)`;

    const normX = 0; 
    const normY = dy / max;

    this.move.emit({ x: normX, y: normY });
    this.ws.send({ type: 'INPUT', x: normX, y: normY });
    console.log('Sende INPUT -> role: controller, y =', normY.toFixed(3));
  }

  ngOnDestroy() {
    this.ws.disconnect();
  }
}