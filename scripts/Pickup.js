class Pickup extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, sprite){
        super(scene, x, y, sprite);
        this.lifespan = 0;
    }

    spawn(){
        this.setScale(2);
    }

    pickup(){
        this.scene.addScore(500);
        this.destroy();
    }

    update(_, dt){
        this.lifespan += dt;

        if(this.lifespan >= 2500 && this.anims.currentAnim === null){
            this.anims.play('applebye');
        }else if(this.lifespan >= 5000){
            this.destroy();
        }
    }
}