import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';


@Component({
selector: 'app-controller-component',
templateUrl: './controller-component.html',
styleUrls: ['./controller-component.scss']
})
export class ControllerComponent {
@ViewChild('joy', { static: true }) joy!: ElementRef<HTMLDivElement>;
@Output() move = new EventEmitter<{ x: number; y: number }>();


dragging = false;
transform = 'translate(-50%, -50%)';


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
}


update(event: any) {
  const rect = this.joy.nativeElement.getBoundingClientRect();
  const radius = rect.width / 2;

  const stickEl = this.joy.nativeElement.querySelector('.stick') as HTMLElement | null;
  const stickRadius = stickEl ? stickEl.getBoundingClientRect().width / 2 : 45; // fallback

  const cx = rect.left + radius;
  const cy = rect.top + radius;

  const touch = event.touches?.[0] || event.changedTouches?.[0];
  const clientX = touch ? touch.clientX : (event.clientX ?? 0);
  const clientY = touch ? touch.clientY : (event.clientY ?? 0);

  let dx = clientX - cx;
  let dy = clientY - cy;

  const max = radius - stickRadius;
  const dist = Math.hypot(dx, dy);

  if (dist > max) {
    dx = (dx / dist) * max;
    dy = (dy / dist) * max;
  }

  this.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;

  this.move.emit({
    x: dx / max,
    y: dy / max
  });
}
}