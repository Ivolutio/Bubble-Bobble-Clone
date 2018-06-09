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
    }

    catch(bubble, enemy){
        this.caught = this.scene.add.sprite(this.x, this.y, enemy.texture.key, 0);
        this.caught.setScale(enemy.scaleX, enemy.scaleY);
        enemy.destroy();
    }

    pickup(){
        if(this.caught !== undefined){

        }else{
            this.pop();
        }
    }

    pop(){
        this.destroy();
    }

    update(_, dt){
        if(this.caught !== undefined){
            this.caught.x = this.x; this.caught.y = this.y;
        }
        this.lifetime += dt;
        
        if(this.lifetime >= 1666 && this.size < 1){
            this.size++;
            this.setFrame(this.size);
            if(this.caught !== undefined)
                this.caught.setScale(this.caught.scaleX / 2, this.caught.scaleY / 2);
        }else if(this.lifetime >= 3333  && this.size < 2){
            this.size++;
            this.setFrame(this.size);
            if(this.caught !== undefined)
                this.caught.setScale(this.caught.scaleX / 2, this.caught.scaleY / 2);
        }else if(this.lifetime >= 5000){
            if(this.caught !== undefined){
                let enemy = this.scene.enemies.get(this.x, this.y, this.caught.texture.key);
                enemy.spawn();
                this.caught.destroy();
            }
            this.pop();
        }
    }
}