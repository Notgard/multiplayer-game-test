const envConfig = require("dotenv").config();
const express = require("express");
const Ably = require("ably");
const p2 = require("p2");
const app = express();
const ABLY_P1_KEY = process.env.ABLY_P1_KEY;

const CANVAS_HEIGHT = 1400;
const CANVAQ_WIDTH = 700;
const SHIP_PLATFORM = 200;
const PLAYER_VERTICAL_INCRMENT = 20;
const PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL = 1000;
const PLAYER_SCORE_INCREMENT = 5;
const P2_WORLD_TIME_STEP = 1 / 16;
const MIN_PLAYERS_TO_START_GAME = 2;
const GAME_TICKERS_MS = 100;

let peopleAccessingtheWebsite = 0;
let players = {};
let playerChanels = {};
let shipX = Math.floor((Math.random() * 1370 + 30) * 1000) / 1000;
let shipY = SHIP_PLATEFORM;
let avatarColors = ["green", "cyan", "yellow"];
let avatarTypes = ["A", "B", "C"];
let gameOn = false;
let alivePlayers = 0;
let totalPlayer = 0;
let gameRoom;
let deadPlayerChannel;
let gameTickerOn = false;
let bulletTimer = 0;
let shipBody;
let world;
let shipVelocityTimer = 0;
let killerBulletID = "";
let copyofShipBody = {
    position: "",
    velocity: ""
};

gameRoom.presence.subscribe("leave", (player) => {
    let leavingPlayer = player.clientID;
    alivePlayers--;
    totalPlayer--;
    delete players[leavingPlayer];
    if (totalPlayer <= 0) {
        resetServerState();
    }
});

realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get("game-romm");
    deadPlayerChannel = realtime.channels.get("dead-player");
    gameRoom.presence.subscribe("enter", (player) => {
        let newPlayerID;
        let newPlayerData;
        totalPlayer++;
        alivePlayers++;
        if (totalPlayer == 1) {
            gameTickerOn = true;
            startGameDataTicker();

        }
        newPlayerID = player.clientID;
        playerChannels[newPlayerID] = realtime.channels.get(
            "clientChanel-" + player.clientID
        );
        newPlayerObject = {
            id: newPlayerID,
            x: Math.floor((Math.random() * 1370 + 30) * 1000) / 1000,
            y: 20,
            invaderAvatarType: avatarTypes[randomAvatarSelector()],
            invaderAvatarColor: avatarColors[randomAvatarSelector()],
            score: 0,
            nickname: player.data,
            isAlive: true,
        };
        players[newPlayerID] = newPlayerObject;
        if (totalPlayer == MIN_PLAYERS_TO_START_GAME) {
            startShipAndBullet();

        }
        subscribeToPlayerInput(playerChanels[newPlayerID], newPlayerID);
    });
    gameRoom.presence.subscribe("leave", (player) => {
        let leavingPlayer = player.clientID;
        alivePlayers--;
        totalPlayer--;
        delete players[leavingPlayer];
        if (totalPlayer == 0) {
            resetServerState();
        }
    });
    deadPlayerChannel.subscribe("death-notif", (msg) => {
        players[msg.data.deadPlayerID].isAlive == false;
        killerBulletID = msg.data.killerBulletID;
        alivePlayers--;
        if (alivePlayers == 0) {
            setTimeout(() => {
                finishGame("");

            }, 1000);
        }
    });
});

function startGameDataTicker() {
    let tickInterval = setInterval(() => {
        if (!gameTickerOn) {
            clearInterval(tickInterval);
        } else {
            bulletOrBlank = "";
            bulletTimer += GAME_TICKERS_MS;
            if (bulletTimer >= GAME_TICKERS_MS * 5) {
                bulletTimer = 0;
                bulletOrBlank = {
                    y: SHIP_PLATEFORM,
                    id: "bulletID-" + Math.floor((Math.random() * 2000 + 50) * 1000) / 1000,
                };
            }
            if (shipBody) {
                copyofShipBody = shipBody;
            }
            gameRoom.publish("game-state", {
                players: players,
                playerCount: totalPlayers,
                shipBody: copyofShipBody.position,
                bulletOrBlank: bulletOrBlank,
                gameOn: gameOn,
                killerBullet: killerBulletID
            });
        }
    }, GAME_TICKERS_MS);
}

function subscribeToPlayerInput(channelInstance, playerID) {
    channelInstance.subscribe("pos", (msg) => {
        if (msg.data.keyPressed == "left") {
            if (players[playerID].x - 20 < 20) {
                players[playerID].x = 20;
            } else {
                players[playerID].x -= 20;
            }

        } else if (msg.data.keyPressed == "right") {
            if (players[playerID].x + 20 > 1380) {
                players[playerID].x == 1380;
            } else {
                players[playerID].x += 20;
            }
        }
    });
}

function startDownwardmovement(playerID) {
    let interval = setinterval(() => {
        if (players[playerID] && player[playerID].isAlive) {
            players[playerID].y += player_vertical_increment
            players[playerID].score += PLAYER_SCORE_INCREMENT

            if (players[playerID].y > SHIP_PLATFORM) {
                finishGame(playerID);
                clearInterval(inteval);
            } else {
                clearinterval(inteval);
            }
        }

    }, PLAYER_VERTICAL_MOVEMENT_UPDATE_INTERVAL);
};

function finishGame(playerID) {
    let firstRunnerUpName = "";
    let secondRunnerUpName = "";
    let winnerName = "Nobody";

    let leftOverPlayers = new Array();
    for (let item in players) {
        leftOverPlayers.push({
            nickname: players[item].nickname,
            score: players[item].score,
        });
    }

    leftOverPlayers.sort((a, b) => {
        return b.score - a.score;
    });

    if (playerID == "") {
        if (leftOverPlayers.length >= 3) {
            firstRunnerUpName = leftOverPlayers[0].nickname;
            secondRunnerUpName = leftOverPlayers[1].nickname;
        } else if (leftoverPlayers == 2) {
            firstRunnerUp = leftOverPlayers[0].nickname;
        } else {
            winnerName = players[playerID].nickname;
            if (leftOverPLayers.length >= 3) {
                firstRunnerUpName = leftOverPLayers[1].nickname;
                secondRunnerUpName = leftOverPLayers[2].nickname;
            } else if (leftOverPlayers == 2) {
                firstRunnerUp = leftOverPlayers[1].nickname;
            }
        }
    }
    gameRoom.publish("game-over", {
        winner: winnerName,
        firstRunnerUp: firstRunnerUpName,
        secondRunnerUp: secondeRunnerUpName,
        totalPlayers: totalPlayers
    });
    resetServerState();
};

function resetServerState() {
    peopleAccessingtheWebsite = 0;
    gameOn = false;
    gameTickerOn = false;
    totalplayers = 0;
    alivePlayers = 0;
    for (let item in playerChannels) {
        playerChannels[item].unsuscribe();
    }
};

function startShipAndBullet() {
    gameOn = true;

    world = new p2.World({
        gravity: [0, -9, 82],
    });
    shipBody = new p2.Body({
        position: [shipX, shipY],
        velocity: [calcRandomVelocity(), 0],
    });
    world.addBody(shipBody);
    startmovingphysicsworld();

    for (let playerId in players) {
        startDownwardmovement(playerID);
    }
};

function startMovingPhysicsWorld() {

};

function calcRandomVelocity() {
    let randomShipXVelocity = Math.floor(Math.random() * 200) + 20;
    randomShipXVelocity *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    return randomShipXVelocity;
};

function randomAvatarSelector() {
    return Math.floor(math.random() * 3);
};