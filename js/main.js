//Aliases
let Application = PIXI.Application,
  loader = PIXI.loader,
  resources = PIXI.loader.resources,
  Sprite = PIXI.Sprite,
  Text = PIXI.Text,
  TextStyle = PIXI.TextStyle;

//Global items
let ship, boss, state, app, healthBar, innerBar, outerBar, healthBarShip, innerBarShip, outerBarShip, message;
let bullets = [];
let bulletsBoss = [];
let coolDownConst = 8;
let cool = coolDownConst;
let coolDownConstBoss = 30;
let bossDead = false;
let iFrames = 900;
let coolBoss = coolDownConstBoss;
let left = keyboard(65),
  up = keyboard(87),
  right = keyboard(68),
  down = keyboard(83),
  f5 = keyboard(116),
  f11 = keyboard(122),
  r = keyboard(82);
BARRA_ESPACIADORA = keyboard(32);

//PIXI.Loader
loader
  .add("images/ship.png")
  .add("images/metroid.png")
  .add("images/shoot.png")
  .add("images/background.png")
  .load(setup);

/**
 * Setupping up the game
 */
function setup() {
  createCanvas();
  createSpace();
  createShip();
  createBoss();
  bossHealthBar();
  playerHealthBar();
  //Set the game state
  state = play;
  //Start the game loop
  app.ticker.add(delta => gameLoop(delta));
}
/////////////////////////////////////////////////////////////////////////////
////////////////////////////// C A N V A S //////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * FPS Display
 */
function displayFPS(delta) {
  let style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 18,
    fill: "green",
    //stroke: "#ff3300",
    //strokeThickness: 4,
    /*dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,*/
    align: "center"
  });
  let msg = app.ticker.FPS;
  msg = Math.round(msg);
  let fps = new Text(msg, style);
  fps.position.set(app.view.x + 50, app.view.height - 200);
  app.stage.addChild(fps);
}

/**
 * This function creates the main container of the game, forcing canvas in case of using chrome
 */
function createCanvas() {
  //Create pixi app
  if (navigator.userAgent.indexOf("Firefox") != -1) {
    app = new Application({
      height: window.innerHeight - 10,
      width: window.innerWidth - 10,
      antialias: true,
      transparent: false,
      resolution: 1,
      backgroundColor: 0x000000
    });
  } else if (navigator.userAgent.indexOf("Chrome") != -1) {
    app = new Application({
      height: window.innerHeight - 10,
      width: window.innerWidth - 10,
      antialias: true,
      transparent: false,
      resolution: 1,
      backgroundColor: 0x000000,
      forceCanvas: true
    });
  } else {
    alert("Use Firefox or Chrome");
  }

  //Add the canvas that Pixi automatically created to the HTML document
  document.getElementById("game").appendChild(app.view); //document.body.appendChild(app.view);//
}

/////////////////////////////////////////////////////////////////////////////
//////////////////////// S O U N D S ////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////
/**
 * This function reproduces the main game audio, Tekken Tag2 Tournament
 */
function playAudio() {
  let x = document.getElementById("myAudio");
  x.play();
}
/**
 * This function reproduces the shoot audio
 */
function playAudioShoot() {
  let x = document.getElementById("shoot");
  x.play();
}
/////////////////////////////////////////////////////////////////////////////
//////////////////////// B A C K G R O U N D ////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

/**
 * This function creates the tiling background image and inserts it to the canvas
 */
function createSpace() {
  // Background
  space = PIXI.Texture.fromImage("images/background.png");
  far = new PIXI.extras.TilingSprite(
    space,
    space.baseTexture.width,
    space.baseTexture.height
  );
  far.position.x = 0;
  far.position.y = 0;
  far.tilePosition.x = 0;
  far.tilePosition.y = 0;
  app.stage.addChild(far);
}

/**
 * And this one moves the image
 */
function moveSpace() {
  far.tilePosition.y += 3.3;
}

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// P L A Y E R //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * This function creates the ship sprite and inserts it to the stage
 */
function createShip() {
  // create a new Sprite from an image path
  ship = new Sprite(resources["images/ship.png"].texture);
  // tamaño del sprait
  ship.width = 75;
  ship.height = 75;

  // center the sprite's anchor point
  ship.anchor.set(0.5);
  // move the sprite to the center of the screen
  ship.x = app.view.width / 2;
  ship.y = app.view.height / 1.15;

  //speeds
  ship.vx = 0;
  ship.vy = 0;
  //load ship to stage
  app.stage.addChild(ship);
}

/**
 * Player inputs from keyboard to the game, diagonal movement, reload and shooting
 */
function playerMovement() {
  const speed = 10;
  //Left arrow key `press` method
  left.press = () => {
    //Change the ship's velocity when the key is pressed
    ship.vx = -speed;
    //Left diagonal movements
    if (up.isDown) {
      ship.vy = -speed;
    }
    if (down.isDown) {
      ship.vy = speed;
    }
  };

  //Left arrow key `release` method
  left.release = () => {
    //If the left arrow has been released, and the right arrow isn't down,
    //and the ship isn't moving vertically:
    //Stop the ship
    if (!right.isDown /*&& ship.vy === 0*/) {
      ship.vx = 0;
      ship.vy = 0;
    }
  };

  //Up
  up.press = () => {
    ship.vy = -speed;
    if (left.isDown) {
      ship.vx = -speed;
    }
    if (right.isDown) {
      ship.vx = speed;
    }
  };
  up.release = () => {
    if (!up.isDown || ship.vy != 0) {
      ship.vx = 0;
      ship.vy = 0;
    }
  };

  //Right
  right.press = () => {
    ship.vx = speed;
    if (up.isDown) {
      ship.vy = -speed;
    }
    90;
    if (down.isDown) {
      ship.vy = speed;
    }
  };
  right.release = () => {
    if (!left.isDown) {
      ship.vx = 0;
      ship.vy = 0;
    }
  };

  //Down
  down.press = () => {
    ship.vy = speed;
    if (left.isDown) {
      ship.vx = -speed;
    }
    if (right.isDown) {
      ship.vx = speed;
    }
  };
  down.release = () => {
    if (!up.isDown && ship.vx === 0) {
      ship.vx = 0;
      ship.vy = 0;
    }
  };
  f5.press = () => {
    location.reload();
  };
  r.press = () => {
    location.reload();
  };
  /*f11.press = () => {
        location.requestFullScreen();
    }*/
  BARRA_ESPACIADORA.press = () => {
    shooting();
  };
}

/**
 * This function creates a shoot sprite and adds it to an array for later manipulation
 */
function shooting() {
  if (!bossDead) {
    cool = coolDownConst;
    shoot = new Sprite(resources["images/shoot.png"].texture);
    shoot.width = 20;
    shoot.height = 20;
    shoot.x = ship.x;
    shoot.y = ship.y;
    //Sin anchor para disparo enemigo
    shoot.anchor.x = 0.5;
    shoot.anchor.y = 0.5;
    shoot.vy = 100;
    bullets.push(shoot);
    app.stage.addChild(shoot);
    playAudioShoot();
  }
}

/**
 * This function moves each bullet of the bullets array
 */
function moveBulletsPlayer() {
  bullets.forEach(function (bullet) {
    bullet.y -= 10;
    bullet.rotation += 0.5;
  });
}
/**
 * This function deletes the player shoots from the app when the bullet reaches certain position of the display
 */
function deleteBulletsPlayer() {
  bullets.forEach(function (bullet) {
    if (bullet.y < 100) {
      app.stage.removeChild(bullet);
    }
  });
}

/**
 * This function creates a health bar for the player
 */
function playerHealthBar() {
  //Create the health bar
  healthBarShip = new PIXI.DisplayObjectContainer();
  healthBarShip.position.set(app.x, app.view.height - 35);
  app.stage.addChild(healthBarShip);

  //Create the black background rectangle
  innerBarShip = new PIXI.Graphics();
  innerBarShip.beginFill(0x000000);
  innerBarShip.drawRect(app.view.x, 15, app.view.width - 50, 10);
  innerBarShip.endFill();
  healthBarShip.addChild(innerBarShip);

  //Create the front red rectangle
  outerBarShip = new PIXI.Graphics();
  outerBarShip.beginFill(0x0000ff);
  outerBarShip.drawRect(0, 15, 128, 10);
  outerBarShip.endFill();
  healthBarShip.addChild(outerBarShip);

  healthBarShip.outer = outerBarShip;
  healthBarShip.outer.width = app.view.width;
}

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////// B O S S ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * This function inserts the Boss sprite to the app stage
 */
function createBoss() {
  //Boss shit, separar
  boss = new Sprite(resources["images/metroid.png"].texture);
  // tamaño del sprait
  boss.width = 620;
  boss.height = 345;

  // center the sprite's anchor point
  boss.anchor.set(0.5);
  // move the sprite to the center of the screen
  boss.x = app.view.width / 2;
  boss.y = app.view.height / 5;

  //speeds
  boss.vx = Math.random() * (2 + 5);
  boss.vy = 0;
  //load ship to stage
  app.stage.addChild(boss);
}

/**
 * This function detects when the boss reaches the right and left wall of the display and inverts the movement
 */
function bossMovement(delta) {
  boss.x += boss.vx;
  let bossContained = contain(boss, {
    x: 0,
    y: 0,
    width: app.view.width,
    height: app.view.height
  });
  if (bossContained === "right" || bossContained === "left") {
    boss.vx *= -1.007;
  }
}

/**
 * This function creates a health bar for the boss
 */
function bossHealthBar() {
  //Create the health bar
  healthBar = new PIXI.DisplayObjectContainer();
  healthBar.position.set(app.x + 170, 4);
  app.stage.addChild(healthBar);

  //Create the black background rectangle
  innerBar = new PIXI.Graphics();
  innerBar.beginFill(0x000000);
  innerBar.drawRect(app.view.x, 0, app.view.width - 50, 10);
  innerBar.endFill();
  healthBar.addChild(innerBar);

  //Create the front red rectangle
  outerBar = new PIXI.Graphics();
  outerBar.beginFill(0xff3300);
  outerBar.drawRect(0, 0, 128, 10);
  outerBar.endFill();
  healthBar.addChild(outerBar);

  healthBar.outer = outerBar;
  healthBar.outer.width = app.view.width;
}

/**
 * This function makes the Boos shoots and adds them to the BulletBoss array, to handle it later
 */
function shootingBoss() {
  if (!bossDead) {
    coolBoss = coolDownConstBoss;
    shootBoss = new Sprite(resources["images/shoot.png"].texture);
    shootBoss.width = 20;
    shootBoss.height = 20;
    shootBoss.x = boss.x;
    shootBoss.y = boss.y;
    //Sin anchor para disparo enemigo
    //shootBoss.anchor.x = 0.5;
    //shootBoss.anchor.y = 0.5;
    shootBoss.vy = -10;//-100
    //shootBoss.y = shootBoss.vy;
    bulletsBoss.push(shootBoss);
    app.stage.addChild(shootBoss);
    playAudioShoot();
  }
}

/**
 * This function moves the boss bullets to a random X axis, while rotating the bullet for make it harder to dodge
 */
function moveBulletsBoss() {
  bulletsBoss.forEach(function (bulletBoss) {//alala
    bulletBoss.y -= Math.random() * (1 - 2) - 3;
    bulletBoss.x += Math.random() * (5 + 5) - 5;
    bulletBoss.rotation += 0.4;
  });
}

/**
 * This function deletes the boss bullet if it reaches the maximum height of the stage
 */
function deleteBulletsBoss() {
  bulletsBoss.forEach(function (bulletBoss) {
    if (bulletBoss.y > app.view.height) {
      app.stage.removeChild(bulletBoss);
    }
  });
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////// GAME LOGIC //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////


/**
 * This function sets the game loop
 * @param delta PIXI ticker
 */
function gameLoop(delta) {
  //Update the current game state:
  state(delta);
}


/**
 * This function contains all the game logic which needs a constant update
 * @param delta PIXI ticker
 */
function play(delta) {
  playAudio();
  ship.x += ship.vx;
  ship.y += ship.vy;
  contain(ship, {
    x: 5,
    y: 5,
    width: app.view.width - 10,
    height: app.view.height - 10
  });
  moveSpace(delta);

  moveBulletsPlayer(delta);
  moveBulletsBoss(delta);

  deleteBulletsPlayer(delta);
  deleteBulletsBoss(delta);

  playerMovement(delta);
  bossMovement(delta);

  if (BARRA_ESPACIADORA.isDown && cool == 0) {
    shooting();
  }
  cool -= 1;
  if (coolBoss == 0 || coolBoss == 5 || coolBoss == 2) {
    shootingBoss();
  }
  coolBoss -= 1;

  /**
   * To delete the bullet when the bullet hits the boss, and causes "damage" reducing the boss health bar
   */
  bullets.forEach(function (bullet) {
    if (hitTestRectangle(bullet, boss)) {
      app.stage.removeChild(bullet);
      healthBar.outer.width -= 0.5;
    }
  });
  /**
   * To delete the bullet when it hits the player, and causes "damage" reducing the player health bar
   */
  bulletsBoss.forEach(function (bulletBoss) {
    if (hitTestRectangle(bulletBoss, ship) /*&& iFrames==0*/) {
      //console.log("hit");
      app.stage.removeChild(bulletBoss);
      healthBarShip.outer.width -= 80;
    }
  });
  //iFrames -= 5;
  
  if (healthBarShip.outer.width <= 0) {
    app.stage.removeChild(ship);
    bossDead = true;
    msgWin("You lose, press R to restart");
  }
  if (healthBar.outer.width <= 0 /*|| healthBarShip.outer.width==app.view.width*/) {
    app.stage.removeChild(boss);
    bossDead = true;
    msgWin("You win !!!!!1!! PURRFECT");
  }

  displayFPS();

}

/**
 * This function detects when the sprite reaches a limit of the screen
 * @param {*} sprite to contain
 * @param {*} container the container box
 * return collision as string to handle it on another function
 */
function contain(sprite, container) {
  let collision = undefined;

  //Left
  if (sprite.x < container.x + sprite.width / 2) {
    sprite.x = container.x + sprite.width / 2;
    collision = "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    collision = "top";
  }

  //Right
  if (sprite.x > container.width) {
    sprite.x = container.width;
    collision = "right";
  }

  //Bottom
  if (sprite.y > container.height - sprite.height / 2) {
    sprite.y = container.height - sprite.height / 2;
    collision = "bottom";
  }

  //Return the `collision` value
  return collision;
}

/**
 * This function detects when 2 sprites hit each other
 * @param {*} r1 Sprite 1
 * @param {*} r2 Sprite 2
 * returns boolean, true in case of collision false otherwise
 */
function hitTestRectangle(r1, r2) {
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

//min: rango minimo max lo mismo pero ranfo maximo, quantity la longitud del array que quieres(la cantidad de numeros que solicitas)
/*function randGenerator(min, max, quantity) {
  let i = 0;
  let array = [];
  for (i = 0; i < quantity; i++) {
    array[i] = Math.round(Math.random() * max + min);
  }
  return array;
}*/

/**
 * This function creates a PIXI.Text object with the message given
 * @param {*} msg Message to insert to the screen
 */
function msgWin(msg) {
  let style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 79,
    fill: "white",
    stroke: "#ff3300",
    strokeThickness: 4,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    align: "center"
  });
  let message = new Text(msg, style);
  message.position.set(app.view.width / 4, app.view.height / 2);
  app.stage.addChild(message);
}

/*
function goFullscreen(id) {
  // Get the element that we want to take into fullscreen mode
  var element = document.getElementById(id);

  // These function will not exist in the browsers that don't support fullscreen mode yet,
  // so we'll have to check to see if they're available before calling them.

  if (element.mozRequestFullScreen) {
    // This is how to go into fullscren mode in Firefox
    // Note the "moz" prefix, which is short for Mozilla.
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    // This is how to go into fullscreen mode in Chrome and Safari
    // Both of those browsers are based on the Webkit project, hence the same prefix.
    element.webkitRequestFullScreen();
  }
  // Hooray, now we're in fullscreen mode!
}*/

// keyboard handlers
function keyboard(keyCode) {
  let key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);
  return key;
}