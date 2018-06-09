var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            'gravity': {
                y: 700,
            },
            debug: false,
        },
        player: {
            moveSpeed: 100,
            jumpForce: 400,
        }
    },
    scene: [ Game ],
}

var game = new Phaser.Game(config);

