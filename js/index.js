const video = document.getElementById("myvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
let trackButton = document.getElementById("trackbutton");
//let updateNote = document.getElementById("updatenote");

let imgindex = 1
let isVideo = false;
if (window.localStorage.getItem('isVideo')) {
    isVideo = (window.localStorage.getItem('isVideo') == 'true')
}

let model = null;
let videoInterval = 100

// video.width = 500
// video.height = 400

$(".pauseoverlay").show()
// $(".overlaycenter").text("Game Paused")
$(".overlaycenter").animate({
    opacity: 1,
    fontSize: "2vw"
}, pauseGameAnimationDuration, function () {});

const modelParams = {
    flipHorizontal: true, // flip e.g for video  
    maxNumBoxes: 1, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.6, // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            //updateNote.innerText = "Now tracking"
            isVideo = true
            window.localStorage.setItem('isVideo', true)
            runDetection()
        } else {
            //updateNote.innerText = "Please enable video"
        }
    });
}
console.log(isVideo)
if (isVideo) {
    startVideo()
}

function toggleVideo() {
    if (!isVideo) {
        //updateNote.innerText = "Starting video"
        startVideo();
    } else {
        //updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        window.localStorage.setItem('isVideo', false)
        //updateNote.innerText = "Video stopped"
    }
}


trackButton.addEventListener("click", function () {
    toggleVideo();
});


function runDetection() {
    model.detect(video).then(predictions => {
        // console.log("Predictions: ", predictions);
        // get the middle x value of the bounding box and map to paddle location
        var newPred = []
        if (predictions[0]){
            for (var i = 0; i < predictions.length; i++){
                if (predictions[i].label == 'face') continue;
                newPred.push(predictions[i]);
            }
        } else {
            handClosed = false;
            document.getElementById("lightsaber").style.visibility="hidden";
            handPoint = false;
            var h = document.getElementById("halo");

            h.style.visibility="hidden"; 
            halo.setPosition(Vec2(-10000, -(0.1 * SPACE_HEIGHT)))
        }
        model.renderPredictions(newPred, canvas, context, video);
        if (newPred[0]) {
            // console.log("prediction arr ", predictions)
            let idx = 0;
            for (var i = 0; i < newPred.length; i++){
                if (newPred[i].label == 'open' || newPred[i].label == 'closed' || newPred[i].label == 'point'){
                    idx = i;
                    break;
                }
            }

            // START HANDS CLOSED LOGIC
            if (newPred[idx].label != 'closed' && handClosedMeter >= 0) {
                handClosed = false
            } else {
                handClosed = true
            }
            // END HANDS CLOSED LOGIC

            if (predictions[idx].label != 'point') {
                handPoint = false
                var h = document.getElementById("halo");

                h.style.visibility="hidden"; 
                halo.setPosition(Vec2(-10000, -(0.1 * SPACE_HEIGHT)))
            } else {
                handPoint = true
                var h = document.getElementById("halo");

                h.style.visibility="visible"; 
            }

            if (predictions[idx].label == 'point') {
                // console.log("WE ARE HERHERHEHRHEH")
                // console.log("halo.x ", halo.getPosition().x)
                // console.log("halo.y ", halo.getPosition().y)
                // console.log("pd.x ", paddle.getPosition().x)
                // console.log("pd.y ", paddle.getPosition().y)
                var h = document.getElementById("halo");
                h.style.visibility="visible"; 
                h.style.position="absolute"; 
                //halo.setPosition(Vec2(paddle.getPosition().x, paddle.getPosition().y+8))
                document.getElementById("lightsaber").style.visibility="hidden";
                saber.setPosition(Vec2(-10000, -(0.25 * SPACE_HEIGHT)))
                // var p = paddle.getPosition(); 
                // console.log("p.x ", p.x);
                // console.log("p.y ", p.y)
                // /h.style.zIndex = 2;
                //h.style.left = (p.x/SPACE_WIDTH*document.documentElement.clientWidth + 200) + 'px'; // HACK
                //h.style.bottom = (p.y/SPACE_HEIGHT*document.documentElement.clientHeight + 250) + 'px' ; // HACK
                //console.log("h.x ", (p.x/SPACE_WIDTH*document.documentElement.clientWidth + 200));
                //console.log("h.y ", (p.y/SPACE_HEIGHT*document.documentElement.clientHeight + 250))
                
                // console.log("Detection: point")
                // logic - set visibility of halo to be true
            } else if (predictions[idx].label == 'open') {
                // console.log("Detection: open")
                document.getElementById("lightsaber").style.visibility="hidden";
                
                saber.setPosition(Vec2(-10000, -(0.25 * SPACE_HEIGHT)))
                halo.setPosition(Vec2(-10000, -(0.1 * SPACE_HEIGHT)))

                //logic 

            } else if (newPred[idx].label == 'closed') {
                if (handClosedMeter > 0) {
                    // console.log("Detection: closed")
                    var d = document.getElementById('lightsaber');
                    d.style.visibility="visible";
                    d.style.position = "absolute";
                    var p = paddle.getPosition();
                    d.style.zIndex = 2;
                    windowWidth = window.innerWidth // Update the window width if user changes it.
                    windowHeight = window.innerHeight // Update the window width if user changes it.
                    d.style.left = ((SPACE_WIDTH/2+p.x + 11)/SPACE_WIDTH*windowWidth) + 'px';
                    d.style.top = ((SPACE_HEIGHT/2-p.y)/SPACE_HEIGHT*windowHeight) + 'px' ;
                } else {
                    document.getElementById("lightsaber").style.visibility="hidden"
                    saber.setPosition(Vec2(-10000, -(0.25 * SPACE_HEIGHT)))
                }
                halo.setPosition(Vec2(-10000, -(0.1 * SPACE_HEIGHT)))
                
            } else if (newPred[0].label == 'face') {
                // console.log("Detection: face")
                halo.setPosition(Vec2(-10000, -(0.1 * SPACE_HEIGHT)))

                
            }
            
            let midval = newPred[idx].bbox[1] + (newPred[idx].bbox[3] / 2) // CHANGED HERE Y COORDINATE INSTEAD
            gamey = document.documentElement.clientHeight * (midval / video.height) // CHANGED HERE TO HEIGHT
            // console.log(gamey, document.documentElement.clientHeight)
            // console.log(document.documentElement.clientWidth)
            if (!pauseGame && !endGame && startGame) {
                updatePaddleControl(gamey)
                updateSaberControl(gamey)
                updateHaloControl(gamey)
                // console.log('Predictions: ', gamey);
            }
        } else {
            handClosed = false;
            handPoint = false;
            document.getElementById("lightsaber").style.visibility="hidden";
            var h = document.getElementById("halo");

            h.style.visibility="hidden"; 
         
        }
        if (isVideo) {
            setTimeout(() => {
                runDetection(video)
            }, videoInterval);
        }
    });
}

// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    //updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false

    startGameButton = $(".greenButton")
    startGameButton.css({"background-color": "#77dd77"})
    startGameButton.text("Start Game")

    startGameButton.click(() => {
        if (model) {
            console.log('model loaded')

            // START GETTING GAME VARIABLES READY FOR GAME START
            NUM_BEADS = 6
            startGame = true
            startGameButton.css({"display": "none"})
            // END GETTING GAME VARIABLES READY FOR GAME START

            $(".overlaycenter").animate({
                opacity: 0,
                fontSize: "0vw"
            }, pauseGameAnimationDuration, function () {
                $(".pauseoverlay").hide()
    });
        }
    })
    $(".overlaycenter").text("Game loaded and ready to be started!")
    
});

// ===============================

var colors = ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900", "#fe4365", "#fc9d9a", "#f9cdad", "#c8c8a9", "#83af9b", "#ecd078", "#d95b43", "#c02942", "#542437", "#53777a", "#556270", "#4ecdc4", "#c7f464", "#ff6b6b", "#c44d58", "#774f38", "#e08e79", "#f1d4af", "#ece5ce", "#c5e0dc", "#e8ddcb", "#cdb380", "#036564", "#033649", "#031634", "#490a3d", "#bd1550", "#e97f02", "#f8ca00", "#8a9b0f", "#594f4f", "#547980", "#45ada8", "#9de0ad", "#e5fcc2", "#00a0b0", "#6a4a3c", "#cc333f", "#eb6841", "#edc951", "#e94e77", "#d68189", "#c6a49a", "#c6e5d9", "#f4ead5", "#3fb8af", "#7fc7af", "#dad8a7", "#ff9e9d", "#ff3d7f", "#d9ceb2", "#948c75", "#d5ded9", "#7a6a53", "#99b2b7", "#ffffff", "#cbe86b", "#f2e9e1", "#1c140d", "#cbe86b", "#efffcd", "#dce9be", "#555152", "#2e2633", "#99173c", "#343838", "#005f6b", "#008c9e", "#00b4cc", "#00dffc", "#413e4a", "#73626e", "#b38184", "#f0b49e", "#f7e4be", "#ff4e50", "#fc913a", "#f9d423", "#ede574", "#e1f5c4", "#99b898", "#fecea8", "#ff847c", "#e84a5f", "#2a363b", "#655643", "#80bca3", "#f6f7bd", "#e6ac27", "#bf4d28", "#00a8c6", "#40c0cb", "#f9f2e7", "#aee239", "#8fbe00", "#351330", "#424254", "#64908a", "#e8caa4", "#cc2a41", "#554236", "#f77825", "#d3ce3d", "#f1efa5", "#60b99a", "#ff9900", "#424242", "#e9e9e9", "#bcbcbc", "#3299bb", "#5d4157", "#838689", "#a8caba", "#cad7b2", "#ebe3aa", "#8c2318", "#5e8c6a", "#88a65e", "#bfb35a", "#f2c45a", "#fad089", "#ff9c5b", "#f5634a", "#ed303c", "#3b8183", "#ff4242", "#f4fad2", "#d4ee5e", "#e1edb9", "#f0f2eb", "#d1e751", "#ffffff", "#000000", "#4dbce9", "#26ade4", "#f8b195", "#f67280", "#c06c84", "#6c5b7b", "#355c7d", "#1b676b", "#519548", "#88c425", "#bef202", "#eafde6", "#bcbdac", "#cfbe27", "#f27435", "#f02475", "#3b2d38", "#5e412f", "#fcebb6", "#78c0a8", "#f07818", "#f0a830", "#452632", "#91204d", "#e4844a", "#e8bf56", "#e2f7ce", "#eee6ab", "#c5bc8e", "#696758", "#45484b", "#36393b", "#f0d8a8", "#3d1c00", "#86b8b1", "#f2d694", "#fa2a00", "#f04155", "#ff823a", "#f2f26f", "#fff7bd", "#95cfb7", "#2a044a", "#0b2e59", "#0d6759", "#7ab317", "#a0c55f", "#bbbb88", "#ccc68d", "#eedd99", "#eec290", "#eeaa88", "#b9d7d9", "#668284", "#2a2829", "#493736", "#7b3b3b", "#b3cc57", "#ecf081", "#ffbe40", "#ef746f", "#ab3e5b", "#a3a948", "#edb92e", "#f85931", "#ce1836", "#009989", "#67917a", "#170409", "#b8af03", "#ccbf82", "#e33258", "#e8d5b7", "#0e2430", "#fc3a51", "#f5b349", "#e8d5b9", "#aab3ab", "#c4cbb7", "#ebefc9", "#eee0b7", "#e8caaf", "#300030", "#480048", "#601848", "#c04848", "#f07241", "#ab526b", "#bca297", "#c5ceae", "#f0e2a4", "#f4ebc3", "#607848", "#789048", "#c0d860", "#f0f0d8", "#604848", "#a8e6ce", "#dcedc2", "#ffd3b5", "#ffaaa6", "#ff8c94", "#3e4147", "#fffedf", "#dfba69", "#5a2e2e", "#2a2c31", "#b6d8c0", "#c8d9bf", "#dadabd", "#ecdbbc", "#fedcba", "#fc354c", "#29221f", "#13747d", "#0abfbc", "#fcf7c5", "#1c2130", "#028f76", "#b3e099", "#ffeaad", "#d14334", "#edebe6", "#d6e1c7", "#94c7b6", "#403b33", "#d3643b", "#cc0c39", "#e6781e", "#c8cf02", "#f8fcc1", "#1693a7", "#dad6ca", "#1bb0ce", "#4f8699", "#6a5e72", "#563444", "#a7c5bd", "#e5ddcb", "#eb7b59", "#cf4647", "#524656", "#fdf1cc", "#c6d6b8", "#987f69", "#e3ad40", "#fcd036", "#5c323e", "#a82743", "#e15e32", "#c0d23e", "#e5f04c", "#230f2b", "#f21d41", "#ebebbc", "#bce3c5", "#82b3ae", "#b9d3b0", "#81bda4", "#b28774", "#f88f79", "#f6aa93", "#3a111c", "#574951", "#83988e", "#bcdea5", "#e6f9bc", "#5e3929", "#cd8c52", "#b7d1a3", "#dee8be", "#fcf7d3", "#1c0113", "#6b0103", "#a30006", "#c21a01", "#f03c02", "#382f32", "#ffeaf2", "#fcd9e5", "#fbc5d8", "#f1396d", "#e3dfba", "#c8d6bf", "#93ccc6", "#6cbdb5", "#1a1f1e", "#000000", "#9f111b", "#b11623", "#292c37", "#cccccc", "#c1b398", "#605951", "#fbeec2", "#61a6ab", "#accec0", "#8dccad", "#988864", "#fea6a2", "#f9d6ac", "#ffe9af", "#f6f6f6", "#e8e8e8", "#333333", "#990100", "#b90504", "#1b325f", "#9cc4e4", "#e9f2f9", "#3a89c9", "#f26c4f", "#5e9fa3", "#dcd1b4", "#fab87f", "#f87e7b", "#b05574", "#951f2b", "#f5f4d7", "#e0dfb1", "#a5a36c", "#535233", "#413d3d", "#040004", "#c8ff00", "#fa023c", "#4b000f", "#eff3cd", "#b2d5ba", "#61ada0", "#248f8d", "#605063", "#2d2d29", "#215a6d", "#3ca2a2", "#92c7a3", "#dfece6", "#cfffdd", "#b4dec1", "#5c5863", "#a85163", "#ff1f4c", "#4e395d", "#827085", "#8ebe94", "#ccfc8e", "#dc5b3e", "#9dc9ac", "#fffec7", "#f56218", "#ff9d2e", "#919167", "#a1dbb2", "#fee5ad", "#faca66", "#f7a541", "#f45d4c", "#ffefd3", "#fffee4", "#d0ecea", "#9fd6d2", "#8b7a5e", "#a8a7a7", "#cc527a", "#e8175d", "#474747", "#363636", "#ffedbf", "#f7803c", "#f54828", "#2e0d23", "#f8e4c1", "#f8edd1", "#d88a8a", "#474843", "#9d9d93", "#c5cfc6", "#f38a8a", "#55443d", "#a0cab5", "#cde9ca", "#f1edd0", "#4e4d4a", "#353432", "#94ba65", "#2790b0", "#2b4e72", "#0ca5b0", "#4e3f30", "#fefeeb", "#f8f4e4", "#a5b3aa", "#a70267", "#f10c49", "#fb6b41", "#f6d86b", "#339194", "#9d7e79", "#ccac95", "#9a947c", "#748b83", "#5b756c", "#edf6ee", "#d1c089", "#b3204d", "#412e28", "#151101", "#046d8b", "#309292", "#2fb8ac", "#93a42a", "#ecbe13", "#4d3b3b", "#de6262", "#ffb88c", "#ffd0b3", "#f5e0d3", "#fffbb7", "#a6f6af", "#66b6ab", "#5b7c8d", "#4f2958", "#ff003c", "#ff8a00", "#fabe28", "#88c100", "#00c176", "#fcfef5", "#e9ffe1", "#cdcfb7", "#d6e6c3", "#fafbe3", "#9cddc8", "#bfd8ad", "#ddd9ab", "#f7af63", "#633d2e", "#30261c", "#403831", "#36544f", "#1f5f61", "#0b8185", "#d1313d", "#e5625c", "#f9bf76", "#8eb2c5", "#615375", "#ffe181", "#eee9e5", "#fad3b2", "#ffba7f", "#ff9c97", "#aaff00", "#ffaa00", "#ff00aa", "#aa00ff", "#00aaff"]
var colorindex = 0;


// START GAME GLOBAL VARIABLES

let windowYRange, worldYRange = 0
let paddle
let saber
let halo
let Vec2
let accelFactor

// TestBed Details
windowHeight = $(document).height()
windowWidth = document.documentElement.clientWidth

console.log(windowHeight, windowWidth);

var scale_factor = 10
var SPACE_WIDTH = windowWidth / scale_factor;
var SPACE_HEIGHT = windowHeight / scale_factor;

// Bead Details
var NUM_BEADS = 0
var BEAD_RESTITUTION = 0.7

// Paddle Details
accelFactor = -0.042 * SPACE_WIDTH;

var paddleMap = new Map();
var maxNumberPaddles = 10;
windowHeight = window.innerHeight
windowWidth = window.innerWidth

var enableAudio = false;
var soundtrack = choose_soundtrack()
var damage_sound = new Audio('./static/damage.wav')
var menu_sound = new Audio('./static/menu.wav')
var powerup_sound = new Audio('./static/powerup.wav')

var pauseGame = false;
var pauseGameAnimationDuration = 500;
var endGame = false;
var startGame = false
var handClosed = false
var handClosedMeter = 100;
var handPointMeter = 100
var handPoint = false


// END GAME GLOBAL VARIABLES

$("input#sound").click(function () {
    enableAudio = $(this).is(':checked')
    soundtext = enableAudio ? "sound on" : "sound off";
    $(".soundofftext").text(soundtext)
    if (enableAudio) {
        soundtrack.play()
    } else {
        soundtrack.pause()
    }
});


function choose_soundtrack() {
    i = Math.floor(Math.random() * 5)
    if (i == 0) {
        var bounceClip = new Audio('./static/soundtrack1.wav')
    } else if (i == 1) {
        var bounceClip = new Audio('./static/soundtrack2.wav')
    } else if (i == 2) {
        var bounceClip = new Audio('./static/soundtrack3.wav')
    } else if (i == 3) {
        var bounceClip = new Audio('./static/soundtrack4.wav')
    } else if (i == 4) {
        var bounceClip = new Audio('./static/soundtrack5.wav')
    }
    // bounceClip.type = 'audio/wav'
    return bounceClip
}


// This function is only for sound effects, not for soundtrack. 
function playSoundEffect(sound) {
    if (enableAudio) {
        sound.play()
    }
}


function updatePaddleControl(y) {
    // gamex = x;
    let mouseY = convertToRange(y, windowYRange, worldYRange);
    let linearVelocity = Vec2(0, (mouseY + paddle.getPosition().y) * accelFactor)
    // paddle.setLinearVelocity(lineaVeloctiy)
    // paddle.setLinearVelocity(lineaVeloctiy)
    linearVelocity.y = isNaN(linearVelocity.y) ? 0 : linearVelocity.y
    paddle.setLinearVelocity(linearVelocity)
    // console.log("linear velocity", linearVelocity.x, linearVelocity.y)
}

function updateSaberControl(y) {
    // gamex = x;
    let mouseY = convertToRange(y, windowYRange, worldYRange);
    let linearVelocity = Vec2(0, (mouseY + saber.getPosition().y) * accelFactor)
    // paddle.setLinearVelocity(lineaVeloctiy)
    // paddle.setLinearVelocity(lineaVeloctiy)
    linearVelocity.y = isNaN(linearVelocity.y) ? 0 : linearVelocity.y
    saber.setLinearVelocity(linearVelocity)
    // console.log("linear velocity", linearVelocity.x, linearVelocity.y)
}

function updateHaloControl(y) {
    // gamex = x;
    let mouseY = convertToRange(y, windowYRange, worldYRange);
    let linearVelocity = Vec2(0, (mouseY + paddle.getPosition().y) * accelFactor)
    // paddle.setLinearVelocity(lineaVeloctiy)
    // paddle.setLinearVelocity(lineaVeloctiy)
    linearVelocity.y = isNaN(linearVelocity.y) ? 0 : linearVelocity.y
    halo.setLinearVelocity(linearVelocity)

}



planck.testbed(function (testbed) {
    var pl = planck;
    Vec2 = pl.Vec2;
    defaultWorldVec2 = Vec2(-6, 0)
    powerupsInProgress = {slow: false}
    easymode = false

    var world = pl.World(defaultWorldVec2);
    var BEAD = 4
    var PADDLE = 5


    var beadFixedDef = {
        density: 1.0,
        restitution: BEAD_RESTITUTION,
        userData: {
            name: "bead",
            points: 0
        }
    };
    var paddleFixedDef = {
        // density : 1.0,
        // restitution : BEAD_RESTITUTION,
        userData: {
            name: "paddle"
        }
    };

    var saberFixedDef = {
        // density : 1.0,
        // restitution : BEAD_RESTITUTION,
        userData: {
            name: "saber"
        }
    };

    var haloFixedDef = {
        userData: {
            name: "halo"
        }
    }

    var self;

    testbed.step = tick;
    testbed.width = SPACE_WIDTH;
    testbed.height = SPACE_HEIGHT;

    var playerScore = 1000;
    windowYRange = [0, windowHeight]
    worldYRange = [-(SPACE_HEIGHT / 2), SPACE_HEIGHT / 2]


    var characterBodies = [];
    var paddleBodies = new Map();

    var globalTime = 0;
    var CHARACTER_LIFETIME = 140000

    start()

    $(function () {
        console.log("ready!");
        scoreDiv = document.createElement('div');
        $(scoreDiv).addClass("classname")
            .text("bingo")
            .appendTo($("body")) //main div
    });

    function start() {
        addUI()
    }

    // Remove paddles that are no longer in frame.
    function refreshMap(currentMap) {
        paddleBodies.forEach(function (item, key, mapObj) {
            if (!currentMap.has(key)) {
                world.destroyBody(paddleBodies.get(key).paddle);
                paddleBodies.delete(key)
            }
        });
    }

    world.on('pre-solve', function (contact) {

        var fixtureA = contact.getFixtureA();
        var fixtureB = contact.getFixtureB();

        var bodyA = contact.getFixtureA().getBody();
        var bodyB = contact.getFixtureB().getBody();

        var apaddle = bpaddle = false
        if (fixtureA.getUserData()) {
            apaddle = fixtureA.getUserData().name == "paddle";
        }

        if (fixtureB.getUserData()) {
            bpaddle = fixtureB.getUserData().name == "paddle";
        }
        if (apaddle || bpaddle) {
            // Paddle collided with something
            var paddle = apaddle ? fixtureA : fixtureB;
            var bead = !apaddle ? fixtureA : fixtureB;

            // console.log(paddle, bead);

            setTimeout(function () {
                paddleBeadHit(paddle, bead);
            }, 1);
        }

    })

    function paddleBeadHit(paddle, bead) {
        // console.log("attempting stroke change", bead.getUserData());
        //console.log("bead points ",bead.getUserData().points);
        beadData = bead.getUserData()
        if (!pauseGame && startGame && !endGame) {
            if (beadData.powerup) {
                // If bead hit is powerup bead
                playSoundEffect(powerup_sound)
                updatePowerup(beadData.powerup)
            } else {
                // If bead hit is point bead
                playSoundEffect(damage_sound)
                updateScoreBox(beadData.points);
                document.getElementById("whale").src="./static/hurtwhale.gif"
                setTimeout(() => {document.getElementById("whale").src="./static/whale200.gif"}, 5000)
            }
        }
    }

    function updatePowerup(powerup) {
        console.log(powerup)
        currentPowerupSpan = $("span#currentBead")
        switch (powerup) {
            case 'slow':
                // Flip gravity value for 2000 ms
                console.log('slow')
                if (!powerupsInProgress.slow) {
                    world.setGravity(Vec2(2,0))
                    powerupsInProgress.slow = true
                    currentPowerupSpan.attr("class", "purpleBeadInstructions")
                    setTimeout(() => {
                        world.setGravity(defaultWorldVec2)
                        powerupsInProgress.slow = false
                        currentPowerupSpan.attr("class", "blackBeadInstructions")
                    }, 2000)
                }
                break;

            case 'force':
                // Pushes beads away from the paddle.
                console.log('force')
                for (var i = 0; i < characterBodies.length; i++) {
                    // Pushes 'force' beads even further away. 
                    if (characterBodies[i].m_fixtureList.m_userData.name == 'force') {
                        x_diff = 10 * (characterBodies[i].getPosition().x - paddle.getPosition().x)
                        y_diff = 10 * (characterBodies[i].getPosition().y - paddle.getPosition().y)
                    } else {
                        x_diff = 0.2 * (characterBodies[i].getPosition().x - paddle.getPosition().x)
                        y_diff = 0.2 * (characterBodies[i].getPosition().y - paddle.getPosition().y)
                    }
                    characterBodies[i].setLinearVelocity(Vec2(x_diff, y_diff))
                }
                break;


            case 'random':
                // Changes gravity randomly every 1s for 5s
                console.log('random')
                if (!powerupsInProgress.random) {
                    powerupsInProgress.random = true
                    currentPowerupSpan.attr("class", "yellowBeadInstructions")
                    for (var i = 0; i < 5; i++) {
                        (function(ind) {
                            if (ind == 0) {
                                world.setGravity(Vec2(Math.random(10) * 10 - 5, Math.random(10) * 10 - 5))
                            }
                            setTimeout(function(){
                                if (ind == 4) {
                                    powerupsInProgress.random = false
                                    world.setGravity(defaultWorldVec2)
                                } else if (ind != 1) {
                                    world.setGravity(Vec2(Math.random(10) * 10 - 5, Math.random(10) * 10 - 5))
                                }
                                currentPowerupSpan.attr("class", "blackBeadInstructions")
                            }, 1000 + (1000 * ind));
                        })(i);
                    }
                }
                break;
            case 'invulnerable':
                // Makes player invulnerable for 3s
                console.log('invulnerable')
                currentPowerupSpan.attr("class", "greyBeadInstructions")
                if (!powerupsInProgress.invulnerable) {
                    powerupsInProgress.invulnerable = true
                    setTimeout(() => {
                        powerupsInProgress.invulnerable = false
                        currentPowerupSpan.attr("class", "blackBeadInstructions")
                    }, 3000)
                }
                break;
            default:
                null
        }

    }

    function updateScoreBox(points) {
        if (!pauseGame && !powerupsInProgress.invulnerable && !endGame) {
            playerScore += points;
            if (playerScore < 0) {
                playerScore = 0
            }
            playerScoreString = "0".repeat(4 - playerScore.toString().length) + playerScore.toString()
            // console.log(playerScoreString)
            $(".healthvalue").text(playerScoreString)
            pointsAdded = points > 0 ? "+" + points : points
            $(".healthadded").text(pointsAdded)
            $(".healthadded").show().animate({
                opacity: 0,
                fontSize: "4vw",
                color: "#ff8800"
            }, 500, function () {
                $(this).css({
                    fontSize: "2vw",
                    opacity: 1,
                    color: "#ff0000"
                }).hide()
            });
        }
    }

    function pauseGamePlay() {
        pauseGame = !pauseGame
        if (pauseGame) {
            paddle.setLinearVelocity(Vec2(0, 0))
            halo.setLinearVelocity(Vec2(0, 0))
            saber.setLinearVelocity(Vec2(0, 0))
            $(".pauseoverlay").show()
            $(".overlaycenter").text("Game Paused")
            $(".overlaycenter").animate({
                opacity: 1,
                fontSize: "2vw"
            }, pauseGameAnimationDuration, function () {});
        } else {

            $(".overlaycenter").animate({
                opacity: 0,
                fontSize: "0vw"
            }, pauseGameAnimationDuration, function () {
                $(".pauseoverlay").hide()
            });
        }

    }

    function endGamePlay(winlose) {
        document.getElementById("whaleStatus").src="./static/deadwhale2.gif"
        clearInterval(timer_interval)
        highscore = localStorage.getItem('highscore')
        if (!highscore || timer_value > highscore) {
            highscore = timer_value
            localStorage.setItem('highscore', timer_value)
        }
        endGame = true
        paddle.setLinearVelocity(Vec2(0, 0))
        saber.setLinearVelocity(Vec2(0, 0))
        halo.setLinearVelocity(Vec2(0, 0))
        $(".pauseoverlay").show()
        $(".instructionsContainer").css({"display": "none"})
        $(".replayButton").css({"display": "flex"})
        $(".replayButton").click(() => {
            location.reload()
        })
        $(".overlaycenter").text(`Game Over! Your score is ${timer_value}. Your highest score is ${highscore}.`)
        $(".overlaycenter").animate({
            opacity: 1,
            fontSize: "2vw"
        }, pauseGameAnimationDuration, function () {});
    }

    // process mouse move and touch events
    function mouseMoveHandler(event) {
        if (!pauseGame && !endGame && startGame) {
            mouseY = convertToRange(event.clientY, windowYRange, worldYRange);
            if (!isNaN(mouseY)) {
                // console.log("MOUSE MOVING")
                // console.log("mouse y: ", mouseY)
                // console.log("paddle position y: ", paddle.getPosition().y)
                linearVelocity = Vec2(0, (mouseY + paddle.getPosition().y) * accelFactor)
                // console.log("mouseMoveHandler", linearVelocity)
                linearVelocity.y = isNaN(linearVelocity.y) ? 0 : linearVelocity.y
                paddle.setLinearVelocity(linearVelocity)
                saber.setLinearVelocity(linearVelocity)
                halo.setLinearVelocity(linearVelocity)
                // console.log("linear velocity", linearVelocity.x, linearVelocity.y)
                // xdiff = mouseX - paddle.getPosition().x > 0 ? 100 : -100
                // paddle.setPosition(Vec2(mouseX,0))
            }
        } else {

        }
    }

    function addUI() {
        // Update playerScore with JS variable
        $(".healthvalue").text(playerScore)
        $("#easymodetoggle").click(() => {
            easymode = !easymode
        })
    
        addPaddle()
        addSaber()
        addHalo()

        // Add mouse movement listener to move paddle
        // Add mouse movement listener to move paddle
        $(document).bind('touchmove touchstart mousemove', function (e) {
            e.preventDefault();
            var touch
            if (e.type == "touchmove") {
                touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            } else if (e.type == "touchstart") {
                touch = e.targetTouches[0]
            } else if (e.type == "mousemove") {
                touch = e
            }
            mouseMoveHandler(touch)
        });

        // Add keypress event listeners to pause game, toggle sound, toggle easy mode
        document.onkeyup = function (e) {
            var key = e.keyCode ? e.keyCode : e.which;
            if (startGame) {
                if (key == 32) {
                    console.log("spacebar pressed")
                    playSoundEffect(menu_sound)
                    pauseGamePlay()
                }
                if (key == 83) {
                    $("input#sound").click()
                }
                if (key == 69) {
                    $("input#easymodetoggle").click()
                }
            }
        }

        var ground = world.createBody();
        var groundY = -(0.3 * SPACE_HEIGHT)
        // ground.createFixture(pl.Edge(Vec2(-(0.95 * SPACE_WIDTH / 2), groundY), Vec2((0.95 * SPACE_WIDTH / 2), groundY)), 0.0);
    }

    function addSaber() {
        saber = world.createBody({
            type: "kinematic",
            filterCategoryBits: PADDLE,
            filterMaskBits: BEAD,
            position: Vec2(-10000, -(0.25 * SPACE_HEIGHT))
        })

        paddleLines = [
            [3.5, -0.5],
            [5.5, 1.5],
            [5.5, -2.5]
        ]

        n = 10, radius = SPACE_WIDTH * 0.03, paddlePath = [], paddlePath = []

        paddleLines.forEach(function (each) {
            paddlePath.push(Vec2(radius * each[0], radius * each[1]))
        })

        saber.createFixture(pl.Polygon(paddlePath), saberFixedDef)
        saber.render = {
            fill: '#222222',
            stroke: '#222222'
        }
    }

    function addHalo() {
        halo = world.createBody({
            type: "kinematic",
            filterCategoryBits: PADDLE,
            filterMaskBits: BEAD,
            position:  Vec2(-10000, -(0.0 * SPACE_HEIGHT))
        })

        paddleLines = [
            [5.2, 0.5],
            [4.5, 1.7],
            [4.0, 2.0],
            [3.5, 2.2],
            [2.5, 2.2],
            [2.0, 2.0],
            [1.5, 1.7],
            [0.8, 0.5]
        ]

        n = 10, radius = SPACE_WIDTH * 0.03, paddlePath = [], paddlePath = []

        paddleLines.forEach(function (each) {
            paddlePath.push(Vec2(radius * each[0], radius * each[1]))
        })

        halo.createFixture(pl.Polygon(paddlePath), haloFixedDef)
        halo.render = {
            fill: '#222222',
            stroke: '#222222'
        }
    }

    function addPaddle() {
        paddle = world.createBody({
            type: "kinematic",
            filterCategoryBits: PADDLE,
            filterMaskBits: BEAD,
            position: Vec2(-(0.4 * SPACE_WIDTH / 2), -(0.25 * SPACE_HEIGHT))
        })
        paddleLines = [
            [2.5,0],
            [4.1,0],
            [4.1,-1.7],
            [2.5,-1.7]
        ]

        n = 10, radius = SPACE_WIDTH * 0.03, paddlePath = [], paddlePath = []

        paddleLines.forEach(function (each) {
            paddlePath.push(Vec2(radius * each[0], radius * each[1]))
        })

        paddle.createFixture(pl.Polygon(paddlePath), paddleFixedDef)
        paddle.render = {
            stroke: '#222222'
        }
    }

    // Generate Beeds falling from sky
    function generateBeads(numCharacters) {

        for (var i = 0; i < numCharacters; ++i) {
            var characterBody = world.createBody({
                type: 'dynamic',
                filterCategoryBits: BEAD,
                filterMaskBits: PADDLE,
                position: Vec2(pl.Math.random(0.95*(SPACE_WIDTH / 2), (SPACE_WIDTH / 2)), pl.Math.random(-(document.documentElement.clientHeight)/2, document.documentElement.clientHeight/2))
            });


            var beadWidthFactor = 0.005
            var beadColor = {
                fill: '#fff',
                stroke: '#000000'
            };

            var fd = {
                density: beadFixedDef.density,
                restitution: BEAD_RESTITUTION,
                userData: {
                    name: beadFixedDef.userData.name, // Default name 'bead'
                    points: 0,
                    powerup: null // null, 'slow' 
                }
            };

            var randVal = Math.random();

            if (randVal > 0.97) {
                beadColor.fill = '#800080' // Purple
                beadWidthFactor = 0.013
                fd.userData.powerup = 'slow'
                fd.userData.name = 'slow'
            } else if (randVal > 0.94) {
                beadColor.fill = '#FFFF00' // Yellow
                beadWidthFactor = 0.013
                fd.userData.powerup = 'random'
                fd.userData.name = 'random'
            } else if (randVal > 0.90) {
                beadColor.fill = '#808080' // Grey
                beadWidthFactor = 0.013
                fd.userData.powerup = 'invulnerable'
                fd.userData.name = 'invulnerable'
            } else if (randVal > 0.87) {
                beadColor.fill = '#FFA500' // Orange
                beadWidthFactor = 0.013
                fd.userData.powerup = 'force'
                fd.userData.name = 'force'
            } else if (randVal > 0.65) {
                //   green ball, - 20
                beadColor.fill = '#32CD32' // Green
                beadWidthFactor = 0.005
                fd.userData.points = -20;
                fd.userData.name = 'bead_20'
            } else if (randVal > 0.47) {
                //  Red Ball, - 50
                beadWidthFactor = 0.005
                beadColor.fill = '#ff0000' // Red
                fd.userData.points = -50;
                fd.userData.name = 'bead_50'
            } else if (randVal > 0.3) {
                // White ball - 30
                beadColor.fill = '#fff' // White
                beadWidthFactor = 0.005
                fd.userData.points = -30;
                fd.userData.name = 'bead_30'
            }

            var shape = pl.Circle(SPACE_WIDTH * beadWidthFactor);
            characterBody.createFixture(shape, fd);

            characterBody.render = beadColor

            characterBody.dieTime = globalTime + CHARACTER_LIFETIME
            
            // Setting initial velocity to the bead
            characterBody.setLinearVelocity(Vec2(0, 25 * (Math.random() - 0.5)))

            characterBodies.push(characterBody);
        }

    }

    timer_value = 0
    timer_interval = window.setInterval(() => {
                if (startGame && !pauseGame) {
                    timer_value += 1
                    $(".timervalue").text(timer_value)
                }
            }, 1000)

    function tick(dt) {
        globalTime += dt;
        var d = document.getElementById('whale');
        // var e = document.getElementById('wave');
        var h = document.getElementById('halo');

        // console.log("d here", d)
        // console.log("e here", e)

        d.style.position = "absolute";
        h.style.position = "absolute";

        // console.log("padd obj", paddle)
        var p = paddle.getPosition();
        var ph = halo.getPosition();
        // console.log("paddle, ", p.x/SPACE_WIDTH*document.documentElement.clientWidth, p.y/SPACE_HEIGHT*document.documentElement.clientHeight)
        windowWidth = window.innerWidth // Update the window width if user changes it.
        windowHeight = window.innerHeight // Update the window width if user changes it.
        d.style.left = ((SPACE_WIDTH/2+p.x)/SPACE_WIDTH*windowWidth) + 'px';
        d.style.top = ((SPACE_HEIGHT/2-p.y)/SPACE_HEIGHT*windowHeight) + 'px' ;

        h.style.left = ((SPACE_WIDTH/2+ph.x)/SPACE_WIDTH*windowWidth) + 'px';
        h.style.top = ((SPACE_HEIGHT/2-ph.y-10)/SPACE_HEIGHT*windowHeight) + 'px' ;

        if (easymode ? world.m_stepCount % 18 == 0 : world.m_stepCount % 10 == 0) {
            if (!pauseGame) {
                generateBeads(NUM_BEADS);
                //console.log("car size", characterBodies.length);
                for (var i = 0; i !== characterBodies.length; i++) {
                    var characterBody = characterBodies[i];
                    //If the character is old, delete it
                    if (characterBody.dieTime <= globalTime) {
                        characterBodies.splice(i, 1);
                        world.destroyBody(characterBody);
                        i--;
                        continue;
                    }

                }
            }
        }

        if (!pauseGame && startGame) {
            // START HANDS CLOSED LOGIC
            if (handClosed && world.m_stepCount % 7 == 0 && handClosedMeter > 0) {
                handClosedMeter -= 1
                saber.setPosition(paddle.getPosition())
            } else if (!handClosed && world.m_stepCount % 14 == 0 && handClosedMeter < 100) {
                handClosedMeter += 1
            }
            if (world.m_stepCount) {
                document.getElementById("handClosedMeter").style.width = `${handClosedMeter}px`
            }

            // START HANDS POINT LOGIC
            console.log(handPoint)
            if (handPoint && world.m_stepCount % 10 == 0 && handPointMeter > 0){
                console.log("SETTING POSITION")
                var px = paddle.getPosition()
                px.y = px.y + 2
                halo.setPosition(px)
                handPointMeter -= 1
            }
            if (!handPoint && world.m_stepCount % 10 == 0 && handPointMeter < 100) {
                handPointMeter += 1
                console.log('dsalkfjdsalfjlk')
            }
            if (world.m_stepCount) {
                document.getElementById("handPointMeter").style.width = `${handPointMeter}px`
            }
        }
        
        // console.log(handClosedMeter)

        // END HANDS CLOSED LOGIC
        // wrap(box)
        wrap(paddle)
        wrap(saber)
        wrap(halo)
        paddleBodies.forEach(function (item, key, mapObj) {
            stayPaddle(item.paddle)
        });

        if (playerScore <= 0) {
            endGamePlay('lose')
        }
    }

    function stayPaddle(paddle) {
        var p = paddle.getPosition()

        if (p.y < -SPACE_HEIGHT / 2) {
            p.y = -SPACE_HEIGHT / 2
            paddle.setPosition(p)
        } else if (p.y > SPACE_HEIGHT / 2) {
            p.y = SPACE_HEIGHT / 2
            paddle.setPosition(p)
        }
    }

    // Returns a random number between -0.5 and 0.5
    function rand(value) {
        return (Math.random() - 0.5) * (value || 1);
    }

    // If the body is out of space bounds, wrap it to the other side
    function wrap(body) {
        var p = body.getPosition();
        //p.x = wrapNumber(p.x, -SPACE_WIDTH / 2, SPACE_WIDTH / 2);
        p.y = wrapNumber(p.y, -SPACE_HEIGHT / 2, SPACE_HEIGHT / 2);
        body.setPosition(p);
    }


    function wrapNumber(num, min, max) {
        if (typeof min === 'undefined') {
            max = 1, min = 0;
        } else if (typeof max === 'undefined') {
            max = min, min = 0;
        }
        if (max > min) {
            num = (num - min) % (max - min);
            return num + (num < 0 ? max : min);
        } else {
            num = (num - max) % (min - max);
            return num + (num <= 0 ? min : max);
        }
    }

    // rest of your code
    return world; // make sure you return the world
});


function convertToRange(value, srcRange, dstRange) {
    // value is outside source range return
    // console.log(srcRange, dstRange)
    if (value < srcRange[0] || value > srcRange[1]) {
        return NaN;
    }

    var srcMax = srcRange[1] - srcRange[0],
        dstMax = dstRange[1] - dstRange[0],
        adjValue = value - srcRange[0];

    return (adjValue * dstMax / srcMax) + dstRange[0];

}