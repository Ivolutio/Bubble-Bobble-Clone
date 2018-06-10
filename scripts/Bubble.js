class Bubble extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'bubble', 0);
        this.lifetime = 0;
        this.size = 0;
    }

    bub(){
        this.setScale(3);
        this.body.isCircle = true;
        this.body.allowGravity = false;

        this.scene.physics.add.overlap(this, this.scene.enemies, this.catch, undefined, this)

        this.body.setVelocityY(-10);
        this.scene.sounds.bubble.play();
    }

    catch(bubble, enemy){
        if(this.caught === undefined){
            try{this.scene.sounds.bubble.play()}
            catch(e){}
            this.size = 0;
            this.setFrame(this.size);
            this.caught = this.scene.add.sprite(this.x, this.y, enemy.texture.key, 0);
            this.caught.setScale(enemy.scaleX*0.8, enemy.scaleY*0.8);
            enemy.destroy();
        }
    }

    pickup(){
        if(this.caught !== undefined){
            this.caught.destroy();
            this.caught = undefined;

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
                console.log(this); 
                bub.destroy();
                spr.destroy();
                let pickup = scene.pickups.get(random.x, random.y, 'apple');
                pickup.spawn();
            }, [], this);

            
            if(this.scene.enemies.getChildren().length === 0){
                this.scene.time.delayedCall(2000, function(){
                    this.currentLevel++;
                    this.loadLevel('level' + this.currentLevel);
                    this.scene.sounds.win.play();
                }, [], this.scene)
            }
        }
        this.pop();
    }

    pop(){
        this.body.setVelocityY(0);
        this.setFrame(3);
        this.scene.time.delayedCall(200, function(){
            try{this.scene.sounds.bubble.play()}
            catch(e){}
            this.destroy();
        }, [], this);
    }

    update(_, dt){
        if(this.caught !== undefined){
            this.caught.x = this.x; this.caught.y = this.y;
        }
        this.lifetime += dt;
        
        if(this.lifetime >= 1666 && this.size < 1 && this.caught === undefined){
            this.size++;
            this.setFrame(this.size);
        }else if(this.lifetime >= 3333  && this.size < 2 && this.caught === undefined){
            this.size++;
            this.setFrame(this.size);
        }else if(this.lifetime >= 5000){
            if(this.caught !== undefined){
                let enemy = this.scene.enemies.get(this.x, this.y, this.caught.texture.key);
                enemy.spawn();
                this.caught.destroy();
                this.caught = undefined;
            }
            this.pop();
        }
    }
}