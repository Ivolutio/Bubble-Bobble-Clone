class Pickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite){
        super(scene, x, y, sprite);
        this.lifespan = 0;
    }

    spawn(){
        //Setup important stuff after we have been created
        this.setScale(2);
    }

    pickup(){
        this.scene.addScore(500);
        this.destroy();
    }

    update(_, dt){
        this.lifespan += dt;

        //Start flickering and then destroy it after
        if(this.lifespan >= 4000 && this.anims.currentAnim === null){
            this.anims.play('applebye');
        }else if(this.lifespan >= 8000){
            this.destroy();
        }
    }
}