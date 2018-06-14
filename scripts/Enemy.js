class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite){
        super(scene,x, y, sprite, 0);
        this.dir = -1;
        this.speed = 100;
        this.jumpDelay = 2000 + Math.floor(Math.random() * 5000); //random jump delays
        this.lifespan = 0;
        this.paused = false; //ai pause
    }
    spawn(){
        //Setup important stuff after we have been created
        this.setScale(2.5);
        this.anims.play(this.texture.key);
        this.body.setCircle(7, 1, 1.5);
        //Random dir
        if(Math.round(Math.random())){
            this.changeDir()
        }
    }

    changeDir(){
        this.dir *= -1;
        //Update sprite flip
        if(this.dir === 1)
            this.flipX = true;
        else
            this.flipX = false;
    }

    jump(){
        this.body.setVelocityY(-config.physics.player.jumpForce);
    }

    pause(){
        //if not paused yet
        if(!this.paused){
            this.paused = true;
            //disable body mainly
            this.body.enable = false;
            this.anims.pause();
            this.setFrame(0);
        }
    }

    resume(){
        //only if we're actually paused
        if(this.paused){
            this.paused = false;
            this.setScale(2.5);
            this.body.enable = true;
            this.anims.resume();
        }
    }

    update(_, dt){
        if(this.paused) return;

        //Make sure to stop walking if we're falling
        if(this.body.velocity.y > 0){
            this.body.setVelocityX(0);
        }else{
            this.body.setVelocityX(this.dir * this.speed);
        }

        //Random jumping \o/
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