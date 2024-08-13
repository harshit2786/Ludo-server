import { WebSocket } from "ws";
import boardsobj from "./utils/boards.json"
import { Board, Move, Position, MoveResponse } from "./models/types";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    private board: Board;
    private position: Position;
    public starter: WebSocket;
    private moves: Move[];
    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = boardsobj.Boards[0];
        this.position = { player1: 0, player2: 0 };
        const random = Math.ceil(Math.random() * 2);
        if (random === 2) {
            this.starter = player2;
        }
        else {
            this.starter = player1;
        }
        this.moves = [];
    }

    makeMove(player: WebSocket) {
        const random = Math.ceil(Math.random() * 6);
        this.moves.push({player:player,diceRoll:random})
        if (random === 6 && (player === this.player1 || player === this.player2)) {
            const playerPosKey = player === this.player1 ? 'player1' : 'player2';

            if (this.position[playerPosKey] === 0) {
                const next: MoveResponse = { newPos: this.position, Next: player, ended: false };
                return next;
            }
        }
        if ((player === this.player1 && this.position.player1 + random > 100) || (player === this.player2 && this.position.player2 + random > 100)) {
            const nextChance = player === this.player1 ? this.player2 : this.player1;
            const next: MoveResponse = { newPos: this.position, Next: nextChance, ended: false };
            return next;
        }
        if ((player === this.player1 && this.position.player1 + random === 100) || (player === this.player2 && this.position.player2 + random === 100)) {
            this.position = player === this.player1 ? { player1: 100, player2: this.position.player2 } : { player2: 100, player1: this.position.player1 }
            const next: MoveResponse = { newPos: this.position, Next: player, ended: true };
            return next;
        }
        else {
            const playerMoved = player === this.player1 ? 'player1' : 'player2';
            const newPos = this.position[playerMoved] + random;
            const ladder = this.board.ladder.find((l) => l.end === newPos);
            const snake = this.board.snakes.find((l) => l.start === newPos)
            if (ladder) {
                const up = ladder.start;
                this.position[playerMoved] = up;
                const next: MoveResponse = { newPos: this.position, Next: player === this.player1 ? this.player2 : this.player1, ended: false };
                return next;
            }
            if (snake) {
                const down = snake.end;
                this.position[playerMoved] = down;
                const next: MoveResponse = { newPos: this.position, Next: player === this.player1 ? this.player2 : this.player1, ended: false };
                return next;
            }
            this.position[playerMoved] = this.position[playerMoved] + random;
            const next: MoveResponse = { newPos: this.position, Next: player === this.player1 ? this.player2 : this.player1, ended: false };
            return next;
        }
        // const newPos = player === this.player1 ? (this.position.player1 === 0 && random === 6)
    }

}