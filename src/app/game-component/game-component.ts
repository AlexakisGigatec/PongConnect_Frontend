import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-game-component',
  imports: [],
  templateUrl: './game-component.html',
  styleUrls: ['./game-component.scss'],
})
export class GameComponent implements AfterViewInit {

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    this.setPositions();
  }
  @ViewChild('pongGame') canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  hitSound!: HTMLAudioElement;

  ballX!: number;
  ballY!: number;
  ballSpeedX = 0;
  ballSpeedY = 0;
  leftPaddleY = 0;
  rightPaddleY = 0;
  paddleWidth = 0;
  paddleHeight = 0;
  playerCount = 0;
  gamePaused = true;
  showInstructions = true;
  aiEnabled = false;
  aiSpeed = 6;

  constructor(private ws: WebsocketService) { }

  ngAfterViewInit() {

    this.ws.connect('game');

    this.ws.messages.subscribe(msg => {
      if (msg.type === 'PLAYERS') {
        this.handlePlayerUpdate(msg.count);
      }

      if (msg.type === 'INPUT') {
        this.handleInput(msg);
      }
    });

    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      this.hitSound = new Audio('./assets/sounds/ping-pong-ball-100074_in1EA4vb.mp3');
      this.hitSound.volume = 0.5;
      this.hitSound.preload = 'auto';
    }
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.setPositions();
    this.gameLoop();
  }

  handlePlayerUpdate(count: number) {
    this.playerCount = count;

    if (count === 0) {
      this.gamePaused = true;
      this.aiEnabled = false;
      this.showInstructions = true;
    }

    if (count === 1) {
      this.gamePaused = false;
      this.aiEnabled = true;
      this.showInstructions = false;
    }

    if (count === 2) {
      this.gamePaused = false;
      this.aiEnabled = true;
      this.showInstructions = false;
    }
  }

  handleInput(msg: any) {
    if (msg.type !== 'INPUT') return;

    if (msg.playerId === 1 && this.playerCount >= 1) {
      this.leftPaddleY = msg.y;
    }

    if (msg.playerId === 2 && this.playerCount === 2) {
      this.rightPaddleY = msg.y;
    }
  }

  resizeCanvas() {
    const canvas = this.canvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.paddleWidth = canvas.width * 0.02;
    this.paddleHeight = canvas.height * 0.15;
  }

  setPositions() {
    const canvas = this.canvas.nativeElement;
    this.ballX = canvas.width / 2;
    this.ballY = canvas.height / 2;
    this.ballSpeedX = canvas.width * 0.005 * (Math.random() > 0.5 ? 1 : -1);
    this.ballSpeedY = canvas.height * 0.005;
    this.leftPaddleY = canvas.height / 2 - this.paddleHeight / 2;
    this.rightPaddleY = canvas.height / 2 - this.paddleHeight / 2;
  }

  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.gamePaused) return;
    this.updateAI();

    const canvas = this.canvas.nativeElement;
    const ballRadius = canvas.width * 0.01;

    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    if (
      this.ballY - ballRadius < 0 ||
      this.ballY + ballRadius > canvas.height
    ) {
      this.playSound();
      this.ballSpeedY *= -1;
    }

    if (
      this.ballX - ballRadius <
      50 + this.paddleWidth &&
      this.ballY > this.leftPaddleY &&
      this.ballY < this.leftPaddleY + this.paddleHeight
    ) {
      this.playSound();
      this.ballSpeedX *= -1;
    }

    if (
      this.ballX + ballRadius >
      canvas.width - 50 - this.paddleWidth &&
      this.ballY > this.rightPaddleY &&
      this.ballY < this.rightPaddleY + this.paddleHeight
    ) {
      this.playSound();
      this.ballSpeedX *= -1;
    }

    if (this.ballX < 0 || this.ballX > canvas.width) {
      this.setPositions();
    }
  }

  updateAI(){
    if (!this.aiEnabled) return;

    if (this.ballSpeedX < 0) return;

    const paddleCenter =
      this.rightPaddleY + this.paddleHeight / 2;

    let targetY = this.ballY;

    targetY += (Math.random() - 0.5) * 60;

    if (paddleCenter < targetY) {
      this.rightPaddleY += this.aiSpeed;
    } else if (paddleCenter > targetY) {
      this.rightPaddleY -= this.aiSpeed;
    }

    this.rightPaddleY = Math.max(
      0,
      Math.min(
        this.canvas.nativeElement.height - this.paddleHeight,
        this.rightPaddleY
      )
    );
  }

  playSound() {
    this.hitSound.currentTime = 0;
    this.hitSound.play().catch(() => {});
  }

  draw() {
    const canvas = this.canvas.nativeElement;
    const ballRadius = canvas.width * 0.01;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(canvas.width / 2, 0);
    this.ctx.lineTo(canvas.width / 2, canvas.height);
    this.ctx.stroke();
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(50, this.leftPaddleY, this.paddleWidth, this.paddleHeight);
    this.ctx.fillRect(canvas.width - 50 - this.paddleWidth, this.rightPaddleY, this.paddleWidth, this.paddleHeight);
    this.ctx.beginPath();
    this.ctx.arc(this.ballX, this.ballY, ballRadius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}



