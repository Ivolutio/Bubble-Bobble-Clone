class Game extends Phaser.Scene {
    constructor() {
        super({key: "Game"});
    }

    preload(){
        this.load.bitmapFont('pixel', 'assets/Pixel Emulator.png', 'assets/Pixel Emulator.fnt');
        this.load.spritesheet('dino', 'assets/dino.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('bubble', 'assets/bubbles.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('bullet', 'assets/bullets.png', {frameWidth: 10, frameHeight: 10});
        this.load.spritesheet('clockworker', 'assets/clockworker.png', {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet('apple', 'assets/apple.png', {frameWidth: 16, frameHeight: 15});
        this.load.image('head', 'assets/head.png');
        this.load.image('tiles', 'assets/tiles.png');
        this.load.tilemapTiledJSON('level1', 'assets/level1.json');
    }
    
    create(){
        //Create the world
        let level1 = this.make.tilemap({key: 'level1'});
        let tiles = level1.addTilesetImage('tiles', 'tiles');
        let solidLayer = level1.createStaticLayer(0, tiles, 100, 0);
        let platformsLayer = level1.createStaticLayer(1, tiles, 100, 0);
        let enemyReverseLayer = level1.createStaticLayer(2, tiles, 100, 0);
        let enemySolidLayer = level1.createStaticLayer(3, tiles, 100, 0);
        solidLayer.setScale(3); platformsLayer.setScale(3); //makes it a height of 600 (our canvas)
        enemyReverseLayer.setScale(3); enemySolidLayer.setScale(3);

        //Life display
        let livesText = this.add.bitmapText(50, 15, 'pixel', 'Lives', 14).setOrigin(.5);
        this.lives = 3;
        this.lifeDisplay = this.add.group({
            key: 'head',
            repeat: this.lives-1,
            setXY: { x: 25, y: 50, stepX: 25 }
        });
        this.add.bitmapText(50, 75, 'pixel', 'Score', 14).setOrigin(.5);
        this.score = 0;
        this.scoreText = this.add.bitmapText(50, 97, 'pixel', '0', 16).setOrigin(.5);

        //Setup Player
        ///Animations
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
        ///Player object
        this.player = this.physics.add.sprite(400, 100, 'dino', 0);
        this.player.setScale(2.5);
        this.player.play('idle');
        this.player.cooldown = 0;
        //this.player = new Player(this, 400, 100);
        //this.player.spawn();
        ///Setup input
        this.player.input = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            jump: Phaser.Input.Keyboard.KeyCodes.W,
            attack: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });

        //Groups
        this.projectiles = this.physics.add.group({
            classType: Projectile,
            maxSize: 10,
            runChildUpdate: true,
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

        //Collisions & Colliders
        ///Tilemap layers
        solidLayer.setCollisionByExclusion([-1], true);
        platformsLayer.setCollisionByExclusion([-1], true);
        enemyReverseLayer.setCollisionByExclusion([-1], true);
        enemySolidLayer.setCollisionByExclusion([-1], true);
        ///Player with world
        this.physics.add.collider(this.player, solidLayer);
        this.physics.add.collider(this.player, platformsLayer);
        platformsLayer.forEachTile(function(tile){
            tile.collideUp = true;
            tile.collideDown = false;
            tile.collideLeft = false;
            tile.collideRight = false;
        });  
        //Enemies with world
        enemyReverseLayer.forEachTile(function(tile){
            tile.collideUp = false;
            tile.collideDown = false;
            tile.collideLeft = true;
            tile.collideRight = true;
        });  
        this.physics.add.collider(this.enemies, enemyReverseLayer, function(enemy){
            enemy.changeDir();
        });
        this.physics.add.collider(this.enemies, enemySolidLayer);
        this.physics.add.collider(this.enemies, platformsLayer);
        ///Projectiles with world
        this.physics.add.collider(this.projectiles, solidLayer, function(proj, ground){proj.hit(ground);}, undefined, this);
        this.physics.add.collider(this.projectiles, platformsLayer, function(proj, ground){proj.hit(ground);}, undefined, this);
        ///Catch the enemy with projectile
        this.physics.add.collider(this.projectiles, this.enemies, function(proj, enemy){proj.hit(enemy);}, undefined, this);
        ///Bubbles with player to kill the enemy
        this.physics.add.overlap(this.player, this.bubbles, function(player, bubble){
            bubble.pickup();
        }, undefined, this);
        //Pickups with world and player
        this.physics.add.collider(this.pickups, solidLayer);
        this.physics.add.collider(this.pickups, platformsLayer);
        this.physics.add.overlap(this.player, this.pickups, function(player, pickup){
            pickup.pickup();
        }, undefined, this);

        

        var enemy = this.enemies.get(this.player.x + 50, this.player.y, 'clockworker');
        enemy.spawn();
        var enemy = this.enemies.get(this.player.x, this.player.y+ 200, 'clockworker');
        enemy.spawn();
    }

    update(_, dt){/*
        //Attack
        if(Phaser.Input.Keyboard.JustDown(this.player.input.attack) && this.player.cooldown <= 0){
            if(this.player.anims.currentAnim.key !== 'attack') this.player.play('attack');
            var proj = this.projectiles.get(this.player.x, this.player.y, 0);
            if(proj !== null){
                proj.fire(this.player);
                this.player.cooldown = 500;
            }
        }
        //Movement
        if(this.player.input.left.isDown){
            //is anim already running?
            if(this.player.anims.currentAnim.key !== 'walk' && this.player.input.attack.isUp) this.player.play('walk');
            if(this.player.flipX) this.player.flipX = false;
            //change speed on x-axis
            this.player.body.setVelocityX(-config.physics.player.moveSpeed);
        }else if(this.player.input.right.isDown){
            if(this.player.anims.currentAnim.key !== 'walk' && this.player.input.attack.isUp) this.player.play('walk');
            if(!this.player.flipX) this.player.flipX = true;
            this.player.body.setVelocityX(config.physics.player.moveSpeed);
        }
        ///Jump
        if(this.player.input.jump.isDown && this.player.body.onFloor()){
            this.player.body.setVelocityY(-config.physics.player.jumpForce);
            this.player.play('jump');
        }
        ///Reset movement + anims
        if(this.player.input.left.isUp && this.player.input.right.isUp){
            //restore idle anim
            if(this.player.anims.currentAnim.key !== 'idle' && this.player.input.attack.isUp && this.player.body.velocity.y >= 0) {
                this.player.play('idle');
            }
            //stop moving
            this.player.body.setVelocityX(0);
        }

        //Fall down brings you back up
        if(this.player.y > 620){
            this.player.y = -20;
        }

        //Shoot cooldown
        if(this.player.cooldown > 0){
            this.player.cooldown -= dt;
        }*/
    }

    addScore(amount){
        this.score += amount;
        this.scoreText.setText(this.score);
    }
}