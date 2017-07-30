var ShipBuilder = {};

ShipBuilder.Preloader = function (game) {

    game = game;
    ready = false;
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');
    prevX = 0;
    currX = 0;
    prevY = 0;
    currY = 0;
    dot_flag = false;
    flag = false;
    pixelSize = 20;

    colorPicker = document.getElementById("colorPicker");
    y = 2;
};

ShipBuilder.Preloader.prototype = {

    preload: function () {

        this.game.load.image('button', 'assets/sprites/button.png');
        this.game.load.image('title', 'assets/sprites/title.png');
        this.game.load.image('enemy', 'assets/sprites/enemy.png');
        this.game.load.image('beam', 'assets/sprites/beam.png');
        this.game.load.image('bullet', 'assets/sprites/bullet.png');
        this.game.load.image('star', 'assets/sprites/star.png');
        this.game.load.image('genericParticle', 'assets/sprites/genericParticle.png');
        this.game.load.image('powerup', 'assets/sprites/powerup.png');

        canvas.addEventListener("mousemove", function (e) {
            findxy('move', e)
        }, false);
        canvas.addEventListener("mousedown", function (e) {
            findxy('down', e)
        }, false);
        canvas.addEventListener("mouseup", function (e) {
            findxy('up', e)
        }, false);
        canvas.addEventListener("mouseout", function (e) {
            findxy('out', e)
        }, false);
    },

    create: function () {
        this.game.canvas.style.boxShadow = "0 0 20px #6ac8f8";
        this.game.canvas.style.borderRadius = "3px";

        var sprite = this.game.add.sprite(210, -20, 'title');
        sprite.scale.setTo(2, 2);
        
        button = this.game.add.button(560, 500, 'button', onClickReady, this, 0);
        button.scale.setTo(1.5, 1.5);
    },

    update: function () {

        color = colorPicker.value;

        if (this.ready) {
            this.state.start('Game');
        }

    }
};

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            fillPixel(currX, currY);
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}

function fillPixel(currX, currY) {
    var x = Math.floor(currX / pixelSize) * pixelSize;
    var y = Math.floor(currY / pixelSize) * pixelSize;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
    ctx.closePath();
    dot_flag = false;
}

function draw() {

    var vector = [currX - prevX, currY - prevY];
    var magnitude = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    var factoX = vector[0] / magnitude;
    var factorY = vector[1] / magnitude;

    for (var i = 0; i < (Math.ceil(magnitude / 5) * 5); i++) {
        var deltaX = prevX - currX;

        this.fillPixel(prevX + (i * factoX), prevY + (i * factorY));
    }
}

function onClickReady() {
    canvas.style.display = "none";
    colorPicker.style.display = "none";
    this.state.start('MainGame');
}
