let pong = (function (){
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.height = 500;
  canvas.width = 800;
  document.body.appendChild(canvas);

  class Vector {
    constructor(x=0, y=0) {
      this.x = x;
      this.y = y;

      this.distTo = (vect) => {
        return Math.sqrt(Math.pow((this.x-vect.x), 2) + Math.pow((this.y-vect.y), 2));
      }
    }
    
  }

  class Rect {
    constructor(width=0, height=0){
    this.pos = new Vector();
    this.width = width;
    this.height = height;
    }

    get left() {
      return this.pos.x - this.width/2;
    }

    get right() {
      return this.pos.x + this.width/2;
    }

    get top() {
      return this.pos.y - this.height/2;
    }

    get bottom() {
      return this.pos.y + this.height/2;
    }
  }

  class Ball extends Rect {
    constructor(){
      super(30, 30);
      this.vel = new Vector();
    }
    move(time) {
      this.pos.x += this.vel.x*time;
      this.pos.y += this.vel.y*time;
    }
  }

  class Paddle extends Rect {
    constructor(){
      super(35, 125);
      this.maxAngle = 200;
      this.isAi = true;
      this.score = 0;
    }
  }

  function PongGame(canvas){
    const _c = canvas;
    const _ctx = _c.getContext('2d');

    const ball = new Ball();
    const players = [new Paddle(), new Paddle()];

    // score divs //
    const score1 = document.getElementById('score1');
    const score2 = document.getElementById('score2');

    // timing variables //
    let lastTime;
    let timePast = 0;
    const step = 1000/6000;

    let difficulty = 600;

    const clearCanvas = () => {
      // background //
      _ctx.fillStyle = '#000';
      _ctx.fillRect(0, 0, _c.width, _c.height);
      // center line //
      _ctx.fillStyle = '#777';
      _ctx.fillRect((_c.width/2)-2.5, 0, 5, _c.height);
    }

    const drawCanvas = () => {
      clearCanvas();
      setScore();
      drawRect(ball, _ctx);
      players.forEach((player)=> {
        drawRect(player, _ctx);
      })
    }

    const drawRect = (rect, canvas) => {
      canvas.fillStyle = "#fff";
      canvas.fillRect(rect.pos.x-rect.width/2, rect.pos.y-rect.height/2, rect.width, rect.height);
    }

    const setScore = () => {
      _ctx.font = '50px Arial'
      _ctx.fillStyle = '#fff';
      _ctx.fillText(players[0].score, (_c.width/2)-23-(_c.width/4), 100);
      _ctx.fillText(players[1].score, (_c.width/2)+(_c.width/4), 100)
      // score1.innerHTML = players[0].score;
      // score2.innerHTML = players[1].score;

    }

    const update = (time) => {
      // move ball //
      ball.move(time);
      
      // bounce ball if collides with paddles //
      for (let i = players.length - 1; i >= 0; i--) {
        // if ball is heading towards player //
        if((ball.vel.x < 0 && i===0)||(ball.vel.x > 0 && i===1)){ 
          // if ball collides with paddle (simple rect collision)//
          if(ball.left < players[i].right &&
             ball.right > players[i].left &&
             ball.top < players[i].bottom &&
             ball.bottom > players[i].top){
            // set y velocity relative to where it hit on paddle //
            let relY = Math.abs(ball.pos.distTo({x: players[i].right, y: players[i].pos.y})/(players[i].height/2));
            ball.vel.x = -ball.vel.x*1.02;
            ball.vel.y = (ball.pos.y<players[i].pos.y)? -relY*players[i].maxAngle : relY*players[i].maxAngle;
          }
        }

      }

      // reset ball if collides with canvas and give score//
      if(ball.left <= 0 || ball.right >= _c.width) {
        if(ball.vel.x < 0){
          players[1].score += 1;
        } else {
          players[0].score += 1;
        }
        reset();
      }

      // bounce ball from top and bottom of canvas //
      if(ball.top <=0 || ball.bottom >= _c.height) {
        ball.vel.y = -ball.vel.y;
      }

      // ai for paddles //
      players.forEach((player) => {
        // if not Ai dont move //
        if(!player.isAi) {
          return;
        }
        // if ball is moving away from paddle //
        if ((ball.vel.x < 0 && player.pos.x > ball.pos.x) ||
            (ball.vel.x > 0 && player.pos.x < ball.pos.x)){
          // if not at middle of canvas //
          if (player.pos.distTo({x: player.pos.x, y: _c.height/2}) > difficulty*time){
            player.pos.y += (player.pos.y < _c.height/2) ? difficulty*time : -difficulty*time;
          }
          return;
        }

        // if ball is not between paddle top and bottom //
        if (ball.pos.y < player.top){
          player.pos.y -= difficulty*time;
        } else if (ball.pos.y > player.bottom){
          player.pos.y += difficulty*time;
        }
      })
      
    }
    
    // timing function //
    const callback = (dt) => {
      if (!lastTime) {
        lastTime = dt;
        return requestAnimationFrame(callback);
      }
      drawCanvas();
      timePast += dt - lastTime;
      lastTime = dt;

      while (timePast >= step){
        update(step/1000);
        timePast -= step;
      }

      requestAnimationFrame(callback);
    }

    const init = () => {
      reset();
      // player movement //
      _c.addEventListener('mousemove', (e) => {
        const scale = e.offsetY/e.target.getBoundingClientRect().height;
        players[0].pos.y = _c.height * scale;
      });
      _c.addEventListener('mouseenter', () => {
        players[0].isAi = false;
      });
      _c.addEventListener('mouseleave', () => {
        players[0].isAi = true;
      })

      callback();
    }

    const reset = () => {
      ball.pos.x = _c.width/2;
      ball.pos.y = _c.height/2;
      ball.vel.x = 400;

      players[0].pos.x = 50;
      players[0].pos.y = _c.height/2;

      players[1].pos.x = _c.width-50;
      players[1].pos.y = _c.height/2;
    }

    init();
  // uncomment this to enable api //
    // return {ball, 
    //         players, 
    //         update, 
    //         drawCanvas,
    //         clearCanvas,
    //         reset};
  }

  let pong = new PongGame(canvas);
  return pong;
})();