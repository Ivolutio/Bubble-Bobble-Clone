class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite){
        super(scene,x, y, sprite, 0);
        this.dir = -1;
        this.speed = 100;
        this.jumpDelay = 2000 + Math.floor(Math.random() * 5000);
        this.lifespan = 0;
    }

    spawn(){
        this.setScale(2.5);
        this.anims.play(this.texture.key);
        this.body.setCircle(7, 1, 1.5);
        this.body.setVelocityX(this.dir * this.speed);
    }

    changeDir(){
        this.dir *= -1;
        if(this.dir === 1)
            this.flipX = true;
        else
            this.flipX = false;
    }

    jump(){
        this.body.setVelocityY(-config.physics.player.jumpForce);
    }

    update(_, dt){
        if(this.body.velocity.y > 0){
            this.body.setVelocityX(0);
        }else{
            this.body.setVelocityX(this.dir * this.speed);
        }

        if(this.jumpDelay <= 0 && this.body.onFloor()){
            this.jump();
            this.jumpDelay = 2000 + Math.floor(Math.random() * 5000);
        }else{
            this.jumpDelay -= dt;
        }

        //Fall down brings you back up
        if(this.y > 620){
            this.y = -20;
        }

        this.lifespan += dt;
    }
}