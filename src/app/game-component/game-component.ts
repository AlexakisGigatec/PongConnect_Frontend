import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-game-component',
  imports: [],
  templateUrl: './game-component.html',
  styleUrls: ['./game-component.scss'],
})
export class GameComponent implements AfterViewInit {

  @ViewChild('pongGame') canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  hitSound!: HTMLAudioElement;

  ballX!: number;
  ballY!: number;
  ballSpeedX = 5;
  ballSpeedY = 5;
  leftPaddleY!: number;
  rightPaddleY!: number;
  paddleWidth!: number;
  paddleHeight!: number;
  // Show instructions overlay (can be toggled later)
  showInstructions = true;


  ngAfterViewInit() {
    this.hitSound = new Audio('./assets/sounds/ping-pong-ball-100074_in1EA4vb.mp3');
    this.hitSound.volume = 0.5;
    this.hitSound.preload = 'auto';
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.setPositions();
    this.gameLoop();
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    this.setPositions();
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
    this.ballSpeedX = canvas.width * 0.005;
    this.ballSpeedY = canvas.height * 0.005;
    this.ballX = canvas.width / 2;
    this.ballY = canvas.height / 2;
    this.leftPaddleY = canvas.height / 2 - this.paddleHeight / 2;
    this.rightPaddleY = canvas.height / 2 - this.paddleHeight / 2;
  }

  // Toggle the instructions overlay (keeps CSS hook for later control)
  toggleInstructions() {
    this.showInstructions = !this.showInstructions;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
    console.log(this.ctx.fillStyle)
  }
  
  // startSound(){
  //   this.hitSound.play().catch(err => console.log('Audio konnte nicht starten:', err));
  // }

  update() {
    const canvas = this.canvas.nativeElement;
    this.ballX += this.ballSpeedX;
    this.ballY += this.ballSpeedY;

    if (this.ballY - canvas.width * 0.01 < 0 || this.ballY + canvas.width * 0.01 > canvas.height) {
      this.ballSpeedY *= -1;
      this.hitSound.play();
    }
    if (this.ballX - canvas.width * 0.01 < 50 + this.paddleWidth &&
      this.ballY > this.leftPaddleY &&
      this.ballY < this.leftPaddleY + this.paddleHeight) {
      this.ballSpeedX *= -1;
      this.hitSound.play();
    }
    if (this.ballX + canvas.width * 0.01 < 50 + this.paddleWidth &&
      this.ballY > this.leftPaddleY &&
      this.ballY < this.leftPaddleY + this.paddleHeight) {
      this.ballSpeedX *= -1;
      this.hitSound.play();
    }
    if (this.ballX < 0 || this.ballX > canvas.width) {
      this.ballX = canvas.width / 2;
      this.ballY = canvas.height / 2;
      this.hitSound.play();
    }
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



