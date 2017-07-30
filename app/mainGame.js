ShipBuilder.MainGame = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    canvas = document.getElementById("canvas");
    this.player;
    this.maxSpeed = 400;
    this.upMaxSpeed = 300;
    this.acceleration = 50;
    this.cursors;
    this.fireButton;
    this.weapon1;
    this.weapon2;
    this.weapon3;
    this.weapon4;
    this.weapon5;

    this.startTimer = 3000;
    this.level = 1;
    this.levelTextShowing = false;
    this.enemysLeft = (5 + this.level);
    this.lastGeneratedTimer = 0;
    this.enemyBullets;
    this.dead = false;
    this.restartText;
    this.restartButton;
    this.enemysRemainingText;
    this.currentLevelText;
    this.explosionEmitter;
    this.powerups;
    this.weaponLevel = 0;
};

ShipBuilder.MainGame.prototype = {

    preload: function () {

        this.load.image('player', canvas.toDataURL());

    },

    create: function () {
        this.game.physics.setBoundsToWorld();
        this.initPlayer();
        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.restartButton = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enemys = this.game.add.group();
        this.powerups = this.game.add.group();
        this.enemyBullets = this.game.add.group();
        this.enemyBullets.enableBody = true;
        this.enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBullets.createMultiple(100, 'bullet');

        this.createExplosionEmitter();
        this.createBackground();

        this.enemyBullets.setAll('anchor.x', 0.5);
        this.enemyBullets.setAll('anchor.y', 1);
        this.enemyBullets.setAll('outOfBoundsKill', true);
        this.enemyBullets.setAll('checkWorldBounds', true);

        var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
        this.restartText = this.game.add.text(this.game.world.centerX, 100, "You died\r press enter to restart!", style);
        this.restartText.anchor.set(0.5);
        this.restartText.alpha = 1;

        var remainStyle = { font: "20px Arial", fill: "#ffffff", left: "center" };
        this.enemysRemainingText = this.game.add.text(10, 0, "Remaining: 0", remainStyle);
        this.currentLevelText = this.game.add.text(710, 0, "Level: " + this.level, remainStyle);

        this.restartText.visible = false;
    },

    update: function () {

        if (this.dead == false) {
            if (this.startTimer < 0) {

                this.checkControlls();
                this.lastGeneratedTimer -= this.game.time.elapsed;
                if (this.lastGeneratedTimer < 0) {
                    var levelOffset = this.level * 50;
                    this.lastGeneratedTimer = this.game.rnd.integerInRange(1000 - levelOffset, 2000 - levelOffset);
                    if (this.lastGeneratedTimer < 500) {
                        this.lastGeneratedTimer = 500;
                    }
                    this.generateEnemy();
                }

                this.game.physics.arcade.overlap(this.weapon1.bullets, this.enemys, this.enemyColl, null, this);
                this.game.physics.arcade.overlap(this.weapon2.bullets, this.enemys, this.enemyColl, null, this);
                this.game.physics.arcade.overlap(this.weapon3.bullets, this.enemys, this.enemyColl, null, this);
                this.game.physics.arcade.overlap(this.weapon4.bullets, this.enemys, this.enemyColl, null, this);
                this.game.physics.arcade.overlap(this.weapon5.bullets, this.enemys, this.enemyColl, null, this);

                this.game.physics.arcade.overlap(this.powerups, this.player, this.playerOnPowerup, null, this);
                this.game.physics.arcade.overlap(this.player, this.enemys, this.playerEnemyColl, null, this);
                this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerBulletHit, null, this);
            } else {
                this.checkControlls();
                this.game.physics.arcade.overlap(this.powerups, this.player, this.playerOnPowerup, null, this);
                this.game.physics.arcade.overlap(this.player, this.enemyBullets, this.playerBulletHit, null, this);
                this.startTimer -= this.game.time.elapsed;

                if (!this.levelTextShowing) {
                    this.generateLevelText();
                }
            }

            this.checkComplete();
        } else {

            this.clear();
            this.restartText.visible = true;

            if (this.restartButton.isDown) {
                this.restart();
            }
        }
    },

    clear: function () {
        this.enemys.forEach(function (enemy) {
            enemy.destroy();
        });

        this.enemyBullets.forEachAlive(function (bullet) {
            bullet.kill();
        });
    },

    checkControlls: function () {
        if (this.cursors.up.isDown) {
            if (this.player.body.velocity.y > -this.upMaxSpeed) {
                this.player.body.velocity.y += -this.acceleration;
            }
        } else if (this.cursors.down.isDown) {
            if (this.player.body.velocity.y < this.maxSpeed) {
                this.player.body.velocity.y += this.acceleration;
            }
        } else {
            if (this.player.body.velocity.y > this.acceleration) {
                this.player.body.velocity.y -= this.acceleration;
            } else if (this.player.body.velocity.y < -this.acceleration) {
                this.player.body.velocity.y += this.acceleration;
            } else {
                this.player.body.velocity.y = 0;
            }
        }

        if (this.cursors.left.isDown) {
            if (this.player.body.velocity.x > -this.maxSpeed) {
                this.player.body.velocity.x += -this.acceleration;
            }
        }
        else if (this.cursors.right.isDown) {
            if (this.player.body.velocity.x < this.maxSpeed) {
                this.player.body.velocity.x += this.acceleration;
            }
        } else {
            if (this.player.body.velocity.x > this.acceleration) {
                this.player.body.velocity.x -= this.acceleration;
            } else if (this.player.body.velocity.x < -this.acceleration) {
                this.player.body.velocity.x += this.acceleration;
            } else {
                this.player.body.velocity.x = 0;
            }
        }

        if (this.fireButton.isDown) {
            this.fireWeapon();
        }
    },

    checkComplete: function () {

        var total = this.enemysLeft + this.enemys.children.length;
        this.enemysRemainingText.setText("Remaining: " + total);
        this.currentLevelText.setText("Level: " + this.level);

        if (total <= 0) {
            this.startTimer = 3000;
            this.level++;
            this.levelTextShowing = false;
            this.enemysLeft = (5 + this.level);
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }
    },

    createBackground: function () {
        var emitter = this.game.add.emitter(this.game.world.centerX, 0, 400);

        emitter.width = this.game.world.width;

        emitter.makeParticles('star');

        emitter.minParticleScale = 0.1;
        emitter.maxParticleScale = 0.5;

        emitter.setYSpeed(300, 500);
        emitter.setXSpeed(-5, 5);

        emitter.minRotation = 0;
        emitter.maxRotation = 0;

        emitter.start(false, 1600, 5, 0);
    },

    createExplosionEmitter() {
        this.explosionEmitter = this.game.add.emitter(0, 0, 1000);
        this.explosionEmitter.makeParticles('genericParticle');
        this.explosionEmitter.minParticleScale = 0.1;
        this.explosionEmitter.maxParticleScale = 0.5;

        this.explosionEmitter.setYSpeed(-50, 50);
        this.explosionEmitter.setXSpeed(-50, 50);
        this.explosionEmitter.alpha = 0.5;

        this.explosionEmitter.minRotation = 0;
        this.explosionEmitter.maxRotation = 0;

    },

    quitGame: function (pointer) {
        this.state.start('MainMenu');
    },

    initPlayer: function () {
        this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        this.player = this.game.add.sprite(400, 500, 'player');
        this.player.scale.setTo(0.1, 0.1);
        this.game.physics.arcade.enable(this.player);
        this.player.body.velocity.x = 0;
        this.player.body.collideWorldBounds = true;
        this.weapon1 = this.game.add.weapon(40, 'beam');
        this.weapon1.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon1.trackSprite(this.player, 1, 1, false);
        this.weapon1.bulletSpeed = 500;
        this.weapon1.fireRate = 200;
        this.weapon1.trackOffset.x = 20;
        this.weapon1.fireAngle = 270;
        this.weapon1.bulletAngleOffset = 90;
        this.weapon1.multiFire = true;

        this.weapon2 = this.game.add.weapon(40, 'beam');
        this.weapon2.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon2.trackSprite(this.player, 1, 1, false);
        this.weapon2.bulletSpeed = 500;
        this.weapon2.fireRate = 200;
        this.weapon2.trackOffset.x = 20;
        this.weapon2.fireAngle = 250;
        this.weapon2.bulletAngleOffset = 90;
        this.weapon2.multiFire = true;

        this.weapon3 = this.game.add.weapon(40, 'beam');
        this.weapon3.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon3.trackSprite(this.player, 1, 1, false);
        this.weapon3.bulletSpeed = 500;
        this.weapon3.fireRate = 200;
        this.weapon3.trackOffset.x = 20;
        this.weapon3.fireAngle = 290;
        this.weapon3.bulletAngleOffset = 90;
        this.weapon3.multiFire = true;

        this.weapon4 = this.game.add.weapon(40, 'beam');
        this.weapon4.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon4.trackSprite(this.player, 1, 1, false);
        this.weapon4.bulletSpeed = 500;
        this.weapon4.fireRate = 200;
        this.weapon4.trackOffset.x = 20;
        this.weapon4.fireAngle = 180;
        this.weapon4.bulletAngleOffset = 90;
        this.weapon4.multiFire = true;

        this.weapon5 = this.game.add.weapon(40, 'beam');
        this.weapon5.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.weapon5.trackSprite(this.player, 1, 1, false);
        this.weapon5.bulletSpeed = 500;
        this.weapon5.fireRate = 200;
        this.weapon5.trackOffset.x = 20;
        this.weapon5.fireAngle = 0;
        this.weapon5.bulletAngleOffset = 90;
        this.weapon5.multiFire = true;

    },

    fireWeapon: function () {
        if (this.weaponLevel == 0) {
            this.weapon1.fire();
        } else if (this.weaponLevel == 1) {
            this.weapon1.fireOffset(12, 0);
            this.weapon1.fireOffset(-12, 0);
        } else if (this.weaponLevel == 2) {
            this.weapon1.fire();
            this.weapon1.fireOffset(12, 0);
            this.weapon1.fireOffset(-12, 0);
        } else if (this.weaponLevel == 3) {
            this.weapon1.fire();
            this.weapon2.fireOffset(-8, 8);
            this.weapon3.fireOffset(8, 8)
        } else if (this.weaponLevel == 4) {
            this.weapon1.fire();
            this.weapon1.fireOffset(12, 0);
            this.weapon1.fireOffset(-12, 0);
            this.weapon2.fireOffset(-8, 8);
            this.weapon3.fireOffset(8, 8)
        } else {
            this.weapon1.fire();
            this.weapon1.fireOffset(12, 0);
            this.weapon1.fireOffset(-12, 0);
            this.weapon2.fireOffset(-8, 8);
            this.weapon3.fireOffset(8, 8)
            this.weapon4.fireOffset(-20, 20)
            this.weapon5.fireOffset(20, 20)
        }
    },

    generatePowerup(sprite) {

        var value = Math.floor(this.game.rnd.integerInRange(1, 7));

        if (value == 1) {
            var powerup = this.game.add.sprite(sprite.body.x + 16, sprite.body.y + 16, 'powerup');
            this.game.physics.arcade.enable(powerup);
            powerup.body.velocity.y = 60;
            powerup.outOfBoundsKill = true;
            this.powerups.add(powerup);
        }
    },

    generateEnemy: function () {

        if (this.enemysLeft > 0) {

            var velocityMin = 50 + (this.level * 10);
            var velocityMax = 200 + (this.level * 10);

            var type = this.game.rnd.integerInRange(1, 2);
            var enemy;
            if (type == 1) {

                var y = 0;
                var x = this.game.rnd.integerInRange(0, 750);
                var velocity = this.game.rnd.integerInRange(velocityMin, velocityMax);

                enemy = this.game.add.sprite(x, y, 'enemy');
                this.game.physics.arcade.enable(enemy);
                enemy.enableBody = true;
                enemy.checkWorldBounds = true;
                enemy.events.onOutOfBounds.add(this.enemyOut, this);
                enemy.body.velocity.y = velocity;
            } else if (type == 2) {

                var right = this.game.rnd.integerInRange(0, 1);

                var y;
                var x;
                var velocity;

                if (right) {
                    y = this.game.rnd.integerInRange(0, 300);
                    x = 0;
                    velocity = this.game.rnd.integerInRange(velocityMin, velocityMax);
                } else {
                    y = this.game.rnd.integerInRange(0, 300);
                    x = 800;
                    velocity = -this.game.rnd.integerInRange(velocityMin, velocityMax);
                }

                enemy = this.game.add.sprite(x, y, 'enemy');
                this.game.physics.arcade.enable(enemy);
                enemy.enableBody = true;
                enemy.checkWorldBounds = true;
                enemy.events.onOutOfBounds.add(this.enemyOut, this);
                enemy.body.velocity.x = velocity;
            }

            var levelOffset = this.level * 50;
            enemy.lastShoot = this.game.rnd.integerInRange(500 - levelOffset, 1000 - levelOffset);
            enemy.enemyBullets = this.enemyBullets;
            enemy.player = this.player;
            enemy.level = this.level;
            enemy.update = function () {
                if (enemy.lastShoot <= 0) {
                    enemyBullet = enemy.enemyBullets.getFirstExists(false);
                    enemyBullet.reset(enemy.body.x + 16, enemy.body.y + 16);

                    this.game.physics.arcade.moveToObject(enemyBullet, { x: enemy.player.x + 20, y: enemy.player.y }, 120 + (enemy.level * 10));

                    enemy.lastShoot = this.game.rnd.integerInRange(500 - levelOffset, 1000 - levelOffset);
                } else {
                    enemy.lastShoot -= this.game.time.elapsed;
                }
            }

            this.enemys.add(enemy);

            this.enemysLeft--;
        }
    },

    restart() {
        this.initPlayer();
        this.startTimer = 3000;
        this.level = 1;
        this.levelTextShowing = false;
        this.enemysLeft = (5 + this.level);
        this.restartText.visible = false;
        this.weaponLevel = 0;
        this.dead = false;
    },

    playerOnPowerup: function (player, powerup) {
        this.weaponLevel++;
        powerup.kill();
    },

    playerEnemyColl: function (player, enemy) {
        this.particleBurst(player);
        this.particleBurst(enemy);
        this.dead = true;
        this.player.kill();
        enemy.destroy();
    },

    playerBulletHit: function (player, bullet) {
        this.particleBurst(player);
        this.dead = true;
        this.player.kill();
    },

    enemyOut: function (enemy) {
        enemy.destroy();
    },

    enemyColl: function (bullet, enemy) {
        this.generatePowerup(enemy);
        this.particleBurst(enemy);
        enemy.destroy();
        bullet.kill();
    },

    generateLevelText: function () {
        this.levelTextShowing = true;
        var style = { font: "65px Arial", fill: "#ffffff", align: "center" };
        var text = this.game.add.text(this.game.world.centerX, 100, "Level " + this.level, style);
        text.anchor.set(0.5);
        text.alpha = 0.1;
        this.game.add.tween(text).to({ alpha: 1 }, 2000, "Linear", true);
        this.game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            text.kill()
        }, this);
    },

    particleBurst: function (sprite) {
        this.explosionEmitter.x = sprite.body.x + 16;
        this.explosionEmitter.y = sprite.body.y + 16;

        this.explosionEmitter.flow(1000, 50, 20, 100, true)

        this.explosionEmitter.forEach(function (particle) {
            particle.tint = 0xEE965B;
        });
    }


};
