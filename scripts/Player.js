class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y){
        super(scene, x, y, 'dino', 0);
        this.lifetime = 0;
        this.cooldown = 0;
    }

    spawn(){
        this.setScale(2.5);
        this.anims.play('idle');
    }

    update(_, dt){
        console.log('player update');
    }
}