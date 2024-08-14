import { WebSocket } from "ws";
import boardsobj from "./utils/boards.json"
import { Board, Move, Position, MoveResponse } from "./models/types";
import { INIT_GAME, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Board;
    private position: Position;
    public starter: WebSocket;
    private moves: Move[];
    private player1Allowed : boolean;
    private player2Allowed : boolean
    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.player1Allowed = false;
        this.player2Allowed = false;
        this.board = boardsobj.Boards[0];
        this.position = { player1: 0, player2: 0 };
        const random = Math.ceil(Math.random() * 2);
        if (random === 2) {
            this.starter = player2;
            this.player2.send(JSON.stringify({
                type : INIT_GAME,
                payload:{
                    turn : true,
                    yourPos : 0,
                    opponent : 0,
                }
            }))
            this.player1.send(JSON.stringify({
                type : INIT_GAME,
                payload:{
                    turn : false,
                    yourPos : 0,
                    opponent : 0,
                }
            }))
        }
        else {
            this.starter = player1;
            this.player2.send(JSON.stringify({
                type : INIT_GAME,
                payload:{
                    turn : false,
                    yourPos : 0,
                    opponent : 0,
                }
            }))
            this.player1.send(JSON.stringify({
                type : INIT_GAME,
                payload:{
                    turn : true,
                    yourPos : 0,
                    opponent : 0,
                }
            }))
        }
        this.moves = [];
    }

    makeMove(player: WebSocket) {
        const random = Math.ceil(Math.random() * 6);
        const play = player === this.player1 ? this.player1 : this.player2;
        const playerLabel = player === this.player1 ? 'player1' : 'player2';
        const opponent = player === this.player1 ? this.player2 : this.player1;
        const opponentLabel = player === this.player1 ? 'player2' : 'player1';
        const playerAllow = player === this.player1 ? this.player1Allowed : this.player2Allowed;
        this.moves.push({player:player,diceRoll:random})
        if (random === 6 && this.position[playerLabel]===0 && !playerAllow ) {
            if(player === this.player1){
                this.player1Allowed = true;
            }
            if(player === this.player2){
                this.player2Allowed = true;
            }
            play.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : true,
                    yourPos : 0,
                    opponent : this.position[opponentLabel],
                    diceRoll : random
                }
            }))
            opponent.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : false,
                    yourPos : this.position[opponentLabel],
                    opponent : 0,
                    diceRoll : random
                }
            }));
            return;
        }
        if (random < 6 && this.position[playerLabel]===0 && !playerAllow) {
            play.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : false,
                    yourPos : 0,
                    opponent : this.position[opponentLabel],
                    diceRoll : random
                }
            }))
            opponent.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : true,
                    yourPos : this.position[opponentLabel],
                    opponent : 0,
                    diceRoll : random
                }
            }));
            return;
        }
        if (this.position[playerLabel] + random >100) {
            play.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : false,
                    yourPos : this.position[playerLabel],
                    opponent : this.position[opponentLabel],
                    diceRoll : random
                }
            }))
            opponent.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : true,
                    yourPos : this.position[opponentLabel],
                    opponent : this.position[playerLabel],
                    diceRoll : random
                }
            }));
            return;
        }
        else {
            const newPos = this.position[playerLabel] + random;
            const ladder = this.board.ladder.find((l) => l.end === newPos);
            const snake = this.board.snakes.find((l) => l.start === newPos)
            if (ladder) {
                const up = ladder.start;
                this.position[playerLabel] = up;
                play.send(JSON.stringify({
                    type : MOVE,
                    payload : {
                        turn : false,
                        yourPos : this.position[playerLabel],
                        opponent : this.position[opponentLabel],
                        diceRoll : random
                    }
                }))
                opponent.send(JSON.stringify({
                    type : MOVE,
                    payload : {
                        turn : true,
                        yourPos : this.position[opponentLabel],
                        opponent : this.position[playerLabel],
                        diceRoll : random
                    }
                }));
                return;
            }
            if (snake) {
                const down = snake.end;
                this.position[playerLabel] = down;
                play.send(JSON.stringify({
                    type : MOVE,
                    payload : {
                        turn : false,
                        yourPos : this.position[playerLabel],
                        opponent : this.position[opponentLabel],
                        diceRoll : random
                    }
                }))
                opponent.send(JSON.stringify({
                    type : MOVE,
                    payload : {
                        turn : true,
                        yourPos : this.position[opponentLabel],
                        opponent : this.position[playerLabel],
                        diceRoll : random
                    }
                }));
                return;
            }
            this.position[playerLabel] = this.position[playerLabel] + random;
            play.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : false,
                    yourPos : this.position[playerLabel],
                    opponent : this.position[opponentLabel],
                    diceRoll : random
                }
            }))
            opponent.send(JSON.stringify({
                type : MOVE,
                payload : {
                    turn : true,
                    yourPos : this.position[opponentLabel],
                    opponent : this.position[playerLabel],
                    diceRoll : random
                }
            }));
            return;
        }
        // const newPos = player === this.player1 ? (this.position.player1 === 0 && random === 6)
    }

}