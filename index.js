const gameStates = {
    BEFORE_PLAY: 0,
    GAME: 1,
};
var gameState = 0;
const lineWeight = 8;
const canvas = {
    w: 500,
    h: 350
};
const stadium = {
    x: 50,
    y: 50,
    w: 400,
    h: lineWeight * 26,
    middle: {
        x: null,
        y: null,
    },
    bounds: {
        w: null,
        h: null
    },
    setup: function() {
        this.middle.x = (this.x + this.w / 2) - (lineWeight / 2),
        this.middle.y = (this.y + this.h / 2) - (lineWeight / 2)

        this.bounds.w = this.x + this.w;
        this.bounds.h = this.y + this.h;
    },
    draw: function() {
        strokeWeight(lineWeight);

        // Stadium bounds
        stroke('white');
        noFill();
        rect(this.x, this.y, this.w, this.h);

        // Middle dotted line
        noStroke();
        fill('white');
        for (offsetY = -(lineWeight / 2); offsetY < this.h; offsetY += lineWeight * 2) {
            rect(this.middle.x, this.y + offsetY, lineWeight, lineWeight);
        }
    },
    drawExtra: function() {
        textAlign(CENTER);
        textSize(12);
        fill('white');

        // Draw "Player size" text
        text("Player size", canvas.w/4, canvas.h - 60);

        // Draw "Ball speed" text
        text("Ball speed", canvas.w/2, canvas.h - 60);

        // Draw "Enemy speed" text
        text("Enemy speed", canvas.w/2 + canvas.w/4, canvas.h - 60);
    }
};
const player = {
    x: null,
    y: null,
    w: null,
    h: null,
    points: null,
    setup: function() {
        this.x = stadium.x + 20;
        this.y = stadium.middle.y;
        this.w = lineWeight;
        this.h = lineWeight * 4;
        this.points = 0;
    },
    draw: function() {
        // Collision with stadium bottom
        if (mouseY < stadium.y) {
            this.y = stadium.y;

        // Collision with stadium top
        } else if (mouseY > (stadium.bounds.h - player.h)) {
            this.y = stadium.bounds.h - player.h;

        // Player follows mouse Y
        } else {
            this.y = mouseY; 
        }

        // Render
        fill('white');
        noStroke();
        rect(this.x, this.y, this.w, this.h);
    },
    changeSize: function(inputValue) {
        this.h = (lineWeight * 4) - inputValue;
    },
    drawScoreBoard: function() {
        fill('white');
        textAlign(CENTER);
        textSize(24);
        text(this.points, canvas.w/4, 30);
    }
};
const enemy = {
    x: null,
    y: null,
    w: null,
    h: null,
  	speed: null,
    points: null,
    setup: function() {
        this.x = stadium.bounds.w - 20,
        this.y = stadium.middle.y;
        this.w = lineWeight;
        this.h = lineWeight * 4;
        this.speed = 0.08;
        this.points = 0;
    },
  	changeSpeed: function(inputValue) {
      this.speed = inputValue * 0.08;
    },
    draw: function() {
        /**
         * Calculate diff between this.y and ball.y
         * If this.y = ball.y, the game would be impossible.
         * Instead of this, we calculate the diff and apply this.speed (a range between 0...1), then:
         *  -> this.speed ~= 0 -> Enemy will be very slow to follow the ball
         *  -> this.speed = 1 -> Enemy follows the ball perfectly (Impossible game)
         */
        const diff = ball.y - this.y;
      	this.y += diff * this.speed;

        // Collision with stadium top
        if (this.y < stadium.y) {
            this.y = stadium.y;

        // Collision with stadium bottom
        } else if (this.y > (stadium.bounds.h - this.h)) {
            this.y = stadium.bounds.h - this.h; 
        }

        // Render
        fill('white');
        noStroke();
        rect(this.x, this.y, this.w, this.h);
    },
    drawScoreBoard: function() {
        fill('white');
        textAlign(CENTER);
        textSize(24);
        text(this.points, canvas.w/2 + canvas.w/4, 30);
    }
}
const ball = {
    x: null,
    y: null,
    w: null,
    h: null,
    direction: {
        x: null,
        y: null
    },
    speed: {
        x: null,
        y: null,
    },
    setup: function() {
        this.speed.x = 1;
        this.speed.y = 1;
        this.resetPosition();
    },
    resetPosition: function() {
        this.w = lineWeight;
        this.h = lineWeight;

        const minX = stadium.middle.x - 30;
        const minY = stadium.middle.y - (stadium.h / 2) + this.w;
        const maxX = stadium.middle.x + 30;
        const maxY = stadium.middle.y + (stadium.h / 2) - this.w;
            
        //return Math.random() * (max - min) + min;
        this.x = Math.random() * (maxX - minX) + minX;
        this.y = Math.random() * (maxY - minY) + minY;

        this.direction.x = Math.round(Math.random()) == 1 ? 1 : -1,
        this.direction.y = Math.round(Math.random()) == 1 ? 1 : -1
    },
    draw: function() {
        //Collision with stadium bounds
        if (this.y <= stadium.y || (this.y + this.h) >= stadium.bounds.h) {
            this.direction.y *= -1;

        // Collision with player
        } else if (
            (this.y + this.h >= player.y)
            && (this.y <= player.y + player.h)
            && (this.x >= player.x)
            && (this.x <= player.x + player.w)
        ) {
            this.direction.x = 1;
        
        // Collision with enemy
        } else if (
            (this.y + this.h >= enemy.y)
            && (this.y <= enemy.y + enemy.h)
            && (this.x + this.w >= enemy.x)
            && (this.x + this.w <= enemy.x + enemy.w)
        ) {
            this.direction.x = -1;

        // Collision with player goal
        } else if (this.x < stadium.x) {
            enemy.points++;
            this.resetPosition();

        // Collision with enemy goal
        } else if (this.x > stadium.bounds.w) {
            player.points++;
            this.resetPosition();
        }

        this.x = this.x + (this.speed.x * this.direction.x);
        this.y = this.y + (this.speed.y * this.direction.y);

        // Render
        fill('red');
        noStroke();
        rect(this.x, this.y, this.w, this.h);
    },
    changeSpeed: function(inputValue) {
        this.speed.x = inputValue;
        this.speed.y = inputValue;
    }
};
controls = {
    startButton: null,
    playerSize: null,
    ballSpeed: null,
    enemySpeed: null
};

function setup() {
    // Create canvas
    createCanvas(canvas.w, canvas.h);

    // Create HTML Elements
    createHtmlElements();

    // Show HTML Elements (startButton)
    showHtmlElements([controls.startButton]);
}

function draw() {
    switch(gameState) {
        // Screen before the game starts
        case gameStates.BEFORE_PLAY:
            beforePlay();
        break;
        // Game itself
        case gameStates.GAME:
            game();
        break;
        default:
        break;
    }
}

function beforePlay() {
    // Prepare canvas
    background('black');

    // Welcome to PONG text
    fill('white');
    noStroke();
    textAlign(CENTER);
    textSize(40);
    text("Welcome to PONG!", canvas.w/2, 50);
}

function game() {
    // Prepare canvas
    background('black');

    // Draw elements in canvas
    stadium.draw();
    stadium.drawExtra();
    ball.draw();
    player.draw();
    player.drawScoreBoard();
    enemy.draw();
    enemy.drawScoreBoard();
}

/**
 * Function to show control HTML Elements and hide the others
 */
function showHtmlElements(htmlElements) {
    for (const prop in controls) {
        if (htmlElements.includes(controls[prop])) {
            controls[prop].style("display", "block");
        } else {
            controls[prop].style("display", "none");
        }
    }
}

function createHtmlElements() {
    /******************
     * BUTTONS
     ******************/

    // START BUTTON
    controls.startButton = createButton("START");
    controls.startButton.mouseReleased(() => {
        // Set gameState to run game() loop
        gameState = gameStates.GAME;

        // Initialize objects
        stadium.setup();
        ball.setup();
        player.setup();
        enemy.setup();

        // show HTML Elements for GAME
        showHtmlElements([controls.stopButton, controls.ballSpeed, controls.playerSize, controls.enemySpeed]);
        controls.ballSpeed.value(ball.speed.x);
        controls.playerSize.value("1");
        controls.enemySpeed.value("1");
    });
    controls.startButton.size(100, 50);
    controls.startButton.position(canvas.w/2 - 50, canvas.h/2 - 25);
    controls.startButton.style("font-size", "20px");
    controls.startButton.style("display", "none");

    // STOP BUTTON
    controls.stopButton = createButton("STOP");
    controls.stopButton.mouseReleased(() => {
        // Set gameState to rum beforePlay() loop
        gameState = gameStates.BEFORE_PLAY;
        showHtmlElements([controls.startButton]);
    });
    controls.stopButton.size(70, 30);
    controls.stopButton.position(canvas.w/2 - 35, 10);
    controls.stopButton.style("font-size", "20px");
    controls.stopButton.style("display", "none");

    /******************
     * INPUTS
     ******************/

    // PLAYER SIZE INPUT
    // text("Tamaño paleta", canvas.w/4, canvas.h - 60);
    controls.playerSize = createInput("1", "number");
    controls.playerSize.size(40, 20);
    controls.playerSize.position(canvas.w/4 - 20, canvas.h - 40);
    controls.playerSize.style("display", "none");
    controls.playerSize.input(function() {
        // Limit values to 1-10
        if (this.value() > 10) {
            this.value(10);
        }
            if (this.value() < 1) {
            this.value(1);      
        }
        player.changeSize(this.value());
    });

    // BALL SPEED INPUT
    // text("Velocidad pelota", canvas.w/2, canvas.h - 60);
    controls.ballSpeed = createInput("1", "number");
    controls.ballSpeed.size(40, 20);
    controls.ballSpeed.position(canvas.w/2 - 20, canvas.h - 40);
    controls.ballSpeed.style("display", "none");
    controls.ballSpeed.input(function() {
        // Limit values to 1-10
        if (this.value() > 10) {
            this.value(10);
        }
            if (this.value() < 1) {
            this.value(1);      
        }
        ball.changeSpeed(this.value());
    });

    // ENEMY SPEED INPUT
    // text("Velocidad enemigo", canvas.w/2 + canvas.w/4, canvas.h - 60);
    controls.enemySpeed = createInput("1", "number");
    controls.enemySpeed.size(40, 20);
    controls.enemySpeed.position(canvas.w/2 + canvas.w/4 - 20, canvas.h - 40);
    controls.enemySpeed.style("display", "none");
    controls.enemySpeed.input(function() {
        // Limit values to 1-10
        if (this.value() > 10) {
            this.value(10);
        }
            if (this.value() < 1) {
            this.value(1);      
        }
        enemy.changeSpeed(this.value());
    });
}