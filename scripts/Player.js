class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'dino', 0);
        this.scene.events.on('update', this.update, this);
        this.lifetime = 0;
        this.cooldown = 0; //shoot cooldown
    }

    spawn(){
        //Setup important stuff after we have been created
        this.setScale(2.5);
        this.body.setCircle(7, 1, 1.5);
        this.anims.play('idle');
    }
    
    update(_, dt){
        if(this.input === undefined) return;
        
        //Attack
        if(Phaser.Input.Keyboard.JustDown(this.input.attack) && this.cooldown <= 0){
            if(this.anims.currentAnim.key !== 'attack') this.play('attack');
            var proj = this.scene.projectiles.get(this.x, this.y, 0);
            if(proj !== null){
                proj.fire(this);
                this.cooldown = 500;
            }
        }
        //Movement
        if(this.input.left.isDown){
            //is anim already running?
            if(this.anims.currentAnim.key !== 'walk' && this.input.attack.isUp) this.play('walk');
            if(this.flipX) this.flipX = false;
            //change speed on x-axis
            this.body.setVelocityX(-config.physics.player.moveSpeed);
        }else if(this.input.right.isDown){
            if(this.anims.currentAnim.key !== 'walk' && this.input.attack.isUp) this.play('walk');
            if(!this.flipX) this.flipX = true;
            this.body.setVelocityX(config.physics.player.moveSpeed);
        }
        ///Jump
        if(this.input.jump.isDown && this.body.onFloor()){
            this.body.setVelocityY(-config.physics.player.jumpForce);
            this.play('jump');
            this.scene.sounds.jump.play();
        }
        ///Reset movement + anims
        if(this.input.left.isUp && this.input.right.isUp){
            //restore idle anim
            if(this.anims.currentAnim.key !== 'idle' && this.input.attack.isUp && this.body.velocity.y >= 0) {
                this.play('idle');
            }
            //stop moving
            this.body.setVelocityX(0);
        }

        //Fall down brings you back up
        if(this.y > 620){
            this.y = -20;
        }

        //Shoot cooldown
        if(this.cooldown > 0){
            this.cooldown -= dt;
        }
    }
}