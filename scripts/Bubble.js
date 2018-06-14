class Bubble extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'bubble', 0);
        this.lifetime = 0;
        this.size = 0; //only for visuals
        this.caught = null; //holder for caught thing
        this.dead = false; //prevent multiple deaths
    }

    bub(){
        //Setup important stuff after we have been created
        this.setScale(3);
        this.body.isCircle = true;
        this.body.allowGravity = false;

        //Catch enemies
        this.collider = this.scene.physics.add.overlap(this, this.scene.enemies, this.catch, undefined, this)

        //Start floating up
        this.body.setVelocityY(-10);
        this.scene.sounds.bubble.play();
    }

    catch(bubble, enemy){
        if(this.caught === null && !enemy.paused){
            this.scene.sounds.bubble.play();
            //Biggest sprite
            this.size = 0;
            this.setFrame(this.size);
            //stop enemy ai
            enemy.pause();
            //Keep enemy with us
            this.caught = enemy;
            this.caught.setScale(enemy.scaleX*0.8, enemy.scaleY*0.8);
        }
    }

    pickup(){
        //Not an instant pop from the player if he's standing really nearby an enemy
        if(this.lifetime < 200) return;
        //If we have something caught kill it and turn in an item drop
        if(this.caught !== null){
            this.caught.destroy();
            this.caught = null;

            this.scene.addScore(250);
            //Create Pickup
            ///Get random location
            let enemyPoints = this.scene.level.createFromObjects('EnemySpawn', 1, {key: 'apple', frame: 1});
            var random = enemyPoints[Math.floor(Math.random() * enemyPoints.length)];
            random.x *= 3; random.x += 100; random.y *= 3;
            let bub = this.scene.add.sprite(this.x, this.y, 'bubble', 0).setScale(3);
            let spr = this.scene.add.sprite(this.x, this.y, 'apple', 0).setScale(2.5*0.8);

            let tween = this.scene.tweens.add({
                targets: [bub, spr],
                x: random.x,
                y: random.y,
                duration: 1000,
            });
            let scene = this.scene;
            tween.setCallback('onComplete', function(){
                bub.destroy();
                spr.destroy();
                let pickup = scene.pickups.get(random.x, random.y, 'apple');
                pickup.spawn();
            }, [], this);

            //Check if this was the last enemy
            if(this.scene.enemies.getChildren().length === 0 && this.scene.gameRunning){
                //go to next level
                this.scene.gameRunning = false;
                this.scene.time.delayedCall(2000, function(){
                    this.currentLevel++;
                    this.loadLevel('level' + this.currentLevel);
                    this.sounds.win.play();
                }, [], this.scene)
            }
        }
        this.pop();
    }

    pop(){
        //If I'm not dead yet
        if(!this.dead){ //sometimes it triggers multiple times
            //Kill me
            this.dead = true;
            this.collider.destroy();
            this.body.setVelocityY(0);
            this.setFrame(3); //pop frame
            this.scene.sounds.bubble.play();
            this.scene.time.delayedCall(200, function(){
                this.destroy();
            }, [], this);
        }
    }

    update(_, dt){
        //make the caught object follow us
        if(this.caught !== null){
            this.caught.x = this.x; 
            this.caught.y = this.y;
        }

        this.lifetime += dt;
        
        //Change sizes
        if(this.lifetime >= 1666 && this.size < 1 && this.caught === null){
            this.size++;
            this.setFrame(this.size);
        }else if(this.lifetime >= 3333  && this.size < 2 && this.caught === null){
            this.size++;
            this.setFrame(this.size);
        }else if(this.lifetime >= 5000){
            this.lifetime = 0;
            //If we're going to die, let's release the enemy again
            if(this.caught !== null){ 
                this.caught.resume();
                this.caught = null;
            }
            this.pop();
        }
    }
}