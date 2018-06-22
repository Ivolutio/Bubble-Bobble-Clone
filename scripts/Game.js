var music;
class Game extends Phaser.Scene {
    constructor() {
        super({key: "Game"});
    }

    preload(){
        this.load.audio('theme', [
            'assets/theme.ogg',
            'assets/theme.mp3'
        ]);
        this.load.audio('win', [
            'assets/win.ogg',
            'assets/win.mp3'
        ]);
        this.load.audio('lose', [
            'assets/lose.ogg',
            'assets/lose.mp3'
        ]);
        this.load.audio('pickup', [
            'assets/pickup.ogg',
            'assets/pickup.mp3'
        ]);
        this.load.audio('jump', [
            'assets/jump.ogg',
            'assets/jump.mp3'
        ]);
        this.load.audio('bubble', [
            'assets/bubble.ogg',
            'assets/bubble.mp3'
        ]);
        this.load.audio('hit', [
            'assets/hit.ogg',
            'assets/hit.mp3'
        ]);

        this.load.bitmapFont('pixel', 'assets/Pixel Emulator.png', 'assets/Pixel Emulator.fnt');
        this.load.spritesheet('dino', 'assets/dino.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('bubble', 'assets/bubbles.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('bullet', 'assets/bullets.png', {frameWidth: 10, frameHeight: 10});
        this.load.spritesheet('clockworker', 'assets/clockworker.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('apple', 'assets/apple.png', {frameWidth: 16, frameHeight: 15});
        this.load.image('head', 'assets/head.png');
        this.load.image('tiles', 'assets/tiles.png');
        //Levels
        this.load.tilemapTiledJSON('level1', 'assets/level1.json');
        this.load.tilemapTiledJSON('level2', 'assets/level2.json');
        this.load.tilemapTiledJSON('level3', 'assets/level3.json');
        this.levels = 3; //level count
    }
    
    create(){
        this.startScore = 0;
        this.currentLevel = 1;
        this.gameRunning = false;
        ///Animations
        //if we restart, the anims still exist and throw errors
        if(!this.anims.get('idle')){ //so if we dont have this one yet, create new
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('dino', { start: 0, end: 1}),
                frameRate: 1,
                repeat: -1,
            });
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('dino', { start: 2, end: 3}),
                frameRate: 4,
                repeat: -1,
            });
            this.anims.create({
                key: 'attack',
                frames: this.anims.generateFrameNumbers('dino', { start: 4, end: 4}),
                frameRate: 0,
                repeat: 0,
            });
            this.anims.create({
                key: 'jump',
                frames: this.anims.generateFrameNumbers('dino', { start: 5, end: 5}),
                frameRate: 0,
                repeat: -1,
            });
            this.anims.create({
                key: 'clockworker',
                frames: this.anims.generateFrameNumbers('clockworker', { start: 0, end: 1}),
                frameRate: 4,
                repeat: -1,
            });
            this.anims.create({
                key: 'applebye',
                frames: this.anims.generateFrameNumbers('apple', { start: 0, end: 1}),
                frameRate: 4,
                repeat: -1,
            });
        }
        
        //References to play sounds
        this.sounds = {
            bubble: this.sound.add('bubble', {volume: .5}),
            win: this.sound.add('win', {volume: .2}),
            lose: this.sound.add('lose', {volume: .2}),
            pickup: this.sound.add('pickup', {volume: .3}),
            jump: this.sound.add('jump', {volume: .2}),
            hit: this.sound.add('hit', {volume: .5})
        }

        //Life display
        this.add.bitmapText(50, 15, 'pixel', 'Lives', 14).setOrigin(.5);
        this.lives = 3;
        this.lifeDisplay = this.add.group({
            key: 'head',
            repeat: this.lives-1,
            setXY: { x: 25, y: 50, stepX: 25 }
        });
        //Score Display
        this.textScore = this.add.bitmapText(50, 75, 'pixel', 'Score', 14).setOrigin(.5);
        this.score = 0;
        this.scoreText = this.add.bitmapText(50, 97, 'pixel', '0', 16).setOrigin(.5);
        
        //Groups
        this.projectiles = this.physics.add.group({
            classType: Projectile,
            maxSize: 10,
        });
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 20,
            runChildUpdate: true,
        });
        this.bubbles = this.physics.add.group({
            classType: Bubble,
            maxSize: 10,
            runChildUpdate: true,
        });
        this.pickups = this.physics.add.group({
            classType: Pickup,
            maxSize: 10,
            runChildUpdate: true,
        });

        //Create the world
        this.loadLevel('level' + this.currentLevel);

        //Play theme
        if(music === undefined){ //check if we already have one playing
            music = this.sound.add('theme', {
                loop: true
            });
            music.play();
        }
    }

    update(_, dt){

    }

    addScore(amount){
        this.score += amount;
        this.scoreText.setText(this.score);
        this.sounds.pickup.play();
    }

    loseLife(){
        //Stop the game
        this.gameRunning = false;
        this.sounds.hit.play();
        this.rotateTween.restart();
        this.player.input = null;
        this.player.body.setVelocityX(0);
        
        //Fade out camera
        this.cameras.main.fadeOut(500, 0, 0, 0, function(){}, this);
        this.time.delayedCall(500, function(){
            //Reset score
            this.score = this.startScore;
            this.scoreText.setText(this.score);
            //Update life display
            this.lives -= 1;
            this.lifeDisplay.getChildren()[this.lifeDisplay.getChildren().length-1].destroy();

            if(this.lives > 0){
                //Reset Level
                this.clearEntities();
                this.spawnEntities();
            }else{
                //load a non-existing level to stop
                this.currentLevel = 50000;
                this.loadLevel('');
            }
            //Show stuff again
            this.cameras.main.fadeIn(1000, 0, 0, 0);
        }, [], this);
    }

    loadLevel(key){
        //If there was a previous level, move it up (just like the new one)
        if(this.currLevel !== undefined){
            let goaway = this.tweens.add({
                targets: this.currLevel,
                y: '-=700',
                duration: 2000,
            });
            //Remove everything
            this.clearEntities();
        }

        if(this.currentLevel > this.levels){
            //We're at the end
            if(this.lives === 0){
                this.add.bitmapText(400, 100, 'pixel', 'Game Over').setOrigin(.5, .5);
                this.sounds.lose.play();
            }else{
                this.add.bitmapText(400, 100, 'pixel', 'You Win').setOrigin(.5, .5);
                this.sounds.win.play();
            }
            //Wait a bit before restarting
            this.time.delayedCall(5000, function(){
                this.scene.restart();
            }, [], this);
        }else{
            //Save score from prev levels;
            this.startScore = this.score;
            //Load the level normally
            this.level = this.make.tilemap({key: key});
            let tiles = this.level.addTilesetImage('tiles', 'tiles');
            this.solidLayer = this.level.createStaticLayer(0, tiles, 100, 700);
            this.platformsLayer = this.level.createStaticLayer(1, tiles, 100, 700);
            this.enemyReverseLayer = this.level.createStaticLayer(2, tiles, 100, 700);
            this.enemySolidLayer = this.level.createStaticLayer(3, tiles, 100, 700);
            this.solidLayer.setScale(3); this.platformsLayer.setScale(3); //makes it a height of 600 (our canvas)
            this.enemyReverseLayer.setScale(3); this.enemySolidLayer.setScale(3);
        
            ///Collisions
            this.solidLayer.setCollisionByExclusion([-1], true);
            this.platformsLayer.setCollisionByExclusion([-1], true);
            this.enemyReverseLayer.setCollisionByExclusion([-1], true);
            this.enemySolidLayer.setCollisionByExclusion([-1], true);

            //Reference to every layer in the level
            this.currLevel = [this.solidLayer, this.platformsLayer, this.enemyReverseLayer, this.enemySolidLayer];

            //Slide it in
            let tween = this.tweens.add({
                targets: this.currLevel,
                y: '-=700',
                duration: 2000,
            });
            //After that's done, spawn everything in
            tween.setCallback('onComplete', function(){
                this.spawnEntities();
            }, [], this);
        }
    }

    clearEntities(){
        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);
        this.pickups.clear(true, true);
        this.bubbles.getChildren().forEach(function(child, index){
            //we also need to destroy it's caught things
            if(child.caught !== null){
                child.caught.destroy();
            }
        }, this);
        this.bubbles.clear(true, true);
        this.player.destroy();
    }

    spawnEntities(){
        //Create an enemy for every spawnpoint in the tilemap
        let enemyPoints = this.level.createFromObjects('EnemySpawn', 1, {key: 'apple', frame: 1});
        enemyPoints.forEach(function(element, index){
            element.setScale(3);
            element.x *= 3;
            element.x += 100;
            element.y *= 3;
            this.createEnemy(element.x, element.y);
        }, this);
        
        //Spawn player on player point
        let playerPoint = this.level.createFromObjects('PlayerSpawn', 1, {key: 'apple', frame: 1})[0];
        playerPoint.setScale(3);
        playerPoint.x *= 3;
        playerPoint.x += 100;
        playerPoint.y *= 3;
        this.createPlayer(playerPoint.x, playerPoint.y);
        //Setup the collisions AFTER everything else is setup
        this.setupCollisions();
        //We created a disabled player as well, let's activate it.
        this.player.visible = true;
    }

    createPlayer(spawnX, spawnY){
        //bub and dino are for a nice bubble floating in effect
        let bub = this.add.sprite(400, -50, 'bubble', 0).setScale(3);
        let dino = this.add.sprite(400, -50, 'dino', 0).setScale(2.5*0.8);

        let tween = this.tweens.add({
            targets: [bub, dino],
            x: spawnX,
            y: spawnY,
            duration: 2000,
        });
        tween.setCallback('onComplete', function(){
            bub.destroy();
            dino.destroy();
            let bubblepop = this.add.sprite(spawnX, spawnY, 'bubble', 3).setScale(3);
            this.time.delayedCall(200, function(){bubblepop.destroy()}, [], this);

            this.player.x = spawnX;
            this.player.y = spawnY;
            this.add.existing(this.player);
            this.gameRunning = true; //player is active so game may run
        }, [], this);
        //Create and setup the player class
        this.player = new Player(this, spawnX, spawnY);
        this.physics.world.enable(this.player);
        this.player.spawn();
        this.player.input = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        let rotate = this.tweens.add({
            targets: this.player,
            angle: {
              getStart: function(target, key, value) {
                return 0;
              },
              getEnd: function(target, key, value) {
                return -720;
              }
            },
            duration: 2000,
            paused: true,
            repeat: -1
        });
        this.rotateTween = rotate;
    }

    createEnemy(spawnX, spawnY){
        //bub and enemySpr are for a nice bubble floating in effect
        let bub = this.add.sprite(400, -50, 'bubble', 0).setScale(3);
        let enemySpr = this.add.sprite(400, -50, 'clockworker', 0).setScale(2.5*0.8);

        let tween = this.tweens.add({
            targets: [bub, enemySpr],
            x: spawnX,
            y: spawnY,
            duration: 2000,
        });
        tween.setCallback('onComplete', function(){
            bub.destroy();
            enemySpr.destroy();
            let bubblepop = this.add.sprite(spawnX, spawnY, 'bubble', 3).setScale(3);
            this.time.delayedCall(200, function(){bubblepop.destroy()}, [], this);

            let enemy = this.enemies.get(spawnX, spawnY, 'clockworker');
            enemy.spawn();
        }, [], this);
    }

    setupCollisions(){
        ///Player with world
        this.physics.add.collider(this.player, this.solidLayer);
        this.physics.add.collider(this.player, this.platformsLayer);
        this.platformsLayer.forEachTile(function(tile){
            tile.collideUp = true;
            tile.collideDown = false;
            tile.collideLeft = false;
            tile.collideRight = false;
        });  
        //Enemies with world
        this.enemyReverseLayer.forEachTile(function(tile){
            tile.collideUp = false;
            tile.collideDown = false;
            tile.collideLeft = true;
            tile.collideRight = true;
        });  
        this.physics.add.collider(this.enemies, this.enemyReverseLayer, function(enemy){
            enemy.changeDir();
        });
        this.physics.add.collider(this.enemies, this.enemySolidLayer);
        this.physics.add.collider(this.enemies, this.platformsLayer);
        ///Projectiles with world
        this.physics.add.collider(this.projectiles, this.solidLayer, function(proj, ground){proj.hit(ground);}, undefined, this);
        this.physics.add.collider(this.projectiles, this.platformsLayer, function(proj, ground){proj.hit(ground);}, undefined, this);
        ///Catch the enemy with projectile
        this.physics.add.collider(this.projectiles, this.enemies, function(proj, enemy){proj.hit(enemy);}, undefined, this);
        ///Bubbles with player to kill the enemy
        this.physics.add.overlap(this.player, this.bubbles, function(player, bubble){
            bubble.pickup();
        }, undefined, this);
        //Pickups with world and player
        this.physics.add.collider(this.pickups, this.solidLayer);
        this.physics.add.collider(this.pickups, this.platformsLayer);
        this.physics.add.overlap(this.player, this.pickups, function(player, pickup){
            pickup.pickup();
        }, undefined, this);
        //Get killed by enemy
        this.physics.add.overlap(this.player, this.enemies, function(){
            if(this.gameRunning) this.loseLife();
        }, undefined, this);
    }
}