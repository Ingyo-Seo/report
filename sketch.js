let system;
let count=0;
let cX=360;
let cY=500;
let game = true;
let handpose;
let video;
let predictions = [];
let score = 0;
let state = "";

function setup() 
{
  createCanvas(1000, 600); 
  system = new ParticleSystem(createVector(width / 3,-400));
  video = createCapture(VIDEO);
  video.hide();
  handpose = ml5.handpose(video);
  handpose.on("predict", gotResult);
  frameRate(60);
  textSize(30);
  textAlign(CENTER);
}

function draw() 
{
  if(game){
    background(51);
    system.addParticle();
    system.run();
    push();
    fill(0,255,0);
    ellipse(cX,cY,20,20);
    pop();
    count++;
    if(keyIsDown(LEFT_ARROW) && cX){cX-=2;}
    if(keyIsDown(RIGHT_ARROW) && cX < width){cX+=2;}
    if(keyIsDown(UP_ARROW) && cY > 0){cY-=2;}
    if(keyIsDown(DOWN_ARROW) && cY < height){cY+=2;}
  }
  push();
  scale(-1,1);
  image(video,-1000,200,200,200);
  pop();
  
  if(game == true)
  {
    score = frameCount
    text("점수 : " + score, 100 , 50);
  }
  else
  {
    text("점수 : "  + score, height / 2, width / 2 - 30);
    text("Game Over", height / 2 , width / 2);
    text("주먹을 만들어 게임을 재시작.", height / 2 , width / 2 + 30);
    if(state == "주먹")
    {
      reset();
    }
  }
}

function reset()
{
  count = 0;
  cX = 360;
  cY = 500;
  game = true;
  predictions = [];
  score = 0;
  frameCount = 0;
}

function keyPressed()
{
  if(key == ' ' && !game)
  {
    game = !game;
    system.particles.splice(0,system.particles.length-1);
    cX=360; cY=500;
  }
}

function gotResult(results)
{
  if(results.length)
  {
    predictions = results[0].annotations;
    cXV = predictions.indexFinger[3][0] - predictions.indexFinger[0][0];
    cYV = predictions.indexFinger[3][1] - predictions.indexFinger[0][1];
    cX = cX - cXV/40;
    cY = cY + cYV/40;
    if(predictions.indexFinger[0][2] > 0.4)
    {
      state = "주먹";    
    }
    else
    {
      state = "불가";
    }
  }
}

let Particle = function(position) 
{
  this.size = random(10,30);
  this.acceleration = createVector(0, 0.01);
  this.velocity = createVector(random(-1, 1), random(-1, 0));
  this.position = position.copy();
  this.lifespan = 1000;
};

Particle.prototype.run = function() 
{
  this.update();
  this.display();
  this.collision();
};

Particle.prototype.collision = function()
{
  if(sqrt((this.position.x-cX)*(this.position.x-cX)+(this.position.y-cY)*(this.position.y-cY))<20){
    game = false;    
  }
}

Particle.prototype.update = function()
{
  this.velocity.add(this.acceleration);
  this.position.add(this.velocity);
};

Particle.prototype.display = function() 
{
  stroke(150, this.lifespan);
  strokeWeight(1);
  fill(127, this.lifespan);
  ellipse(this.position.x, this.position.y, this.size, this.size);
};

Particle.prototype.isDead = function()
{
  return this.position.x < 0 || this.position.x > 800 || this.position.y > height;
};

let ParticleSystem = function(position) 
{
  this.origin = position.copy();
  this.particles = [];
};

ParticleSystem.prototype.addParticle = function() 
{
  if(count%10 ==0){this.particles.push(new Particle(this.origin));}
};

ParticleSystem.prototype.run = function() 
{
  for (let i = this.particles.length-1; i >= 0; i--) 
  {
    let p = this.particles[i];
    p.run();
    if (p.isDead()) 
    {
      this.particles.splice(i, 1);
    }
  }
};

