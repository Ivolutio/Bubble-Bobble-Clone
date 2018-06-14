class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, frame){
        super(scene, x, y, 'bullet', frame);
    }

    fire(source){
        //General setup stuff
        this.setScale(1.5);
        this.body.isCircle = true;
        this.body.allowGravity = false;
        //Direction false: left, true: right
        let dir = source.flipX;
        let speed = 500;
        if(dir)
            this.body.setVelocityX(speed);
        else
            this.body.setVelocityX(-speed);
    }

    hit(other){
        //Create the bubble and destroy myself
        let bubble = this.scene.bubbles.get(this.x, this.y);
        bubble.bub();
        this.destroy();
    }
}