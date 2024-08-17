import { WebSocket } from "ws";
import boardsobj from "./utils/boards.json";
import { Board, Position, Move } from "./models/types";
import { INIT_GAME, MOVE } from "./messages";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  private board: Board;
  private position: Position;
  public starter: WebSocket;
  private moves: Move[];
  private player1Allowed: boolean;
  private player2Allowed: boolean;

  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.player1Allowed = false;
    this.player2Allowed = false;
    this.board = boardsobj.Boards[0];
    this.position = { player1: 0, player2: 0 };
    this.moves = [];

    this.starter = Math.random() < 0.5 ? player1 : player2;
    this.initializeGame();
  }

  private initializeGame() {
    const startPayload = {
      turn: true,
      yourPos: 0,
      opponent: 0,
      diceRoll: null,
    };

    const opponentPayload = {
      ...startPayload,
      turn: false,
    };

    if (this.starter === this.player2) {
      this.player2.send(JSON.stringify({ type: INIT_GAME, payload: startPayload }));
      this.player1.send(JSON.stringify({ type: INIT_GAME, payload: opponentPayload }));
    } else {
      this.player1.send(JSON.stringify({ type: INIT_GAME, payload: startPayload }));
      this.player2.send(JSON.stringify({ type: INIT_GAME, payload: opponentPayload }));
    }
  }

  private sendMove(player: WebSocket, payload: any) {
    player.send(JSON.stringify({ type: MOVE, payload }));
  }

  private isPlayerAllowed(player: WebSocket): boolean {
    return player === this.player1 ? this.player1Allowed : this.player2Allowed;
  }

  private setPlayerAllowed(player: WebSocket, allowed: boolean) {
    if (player === this.player1) {
      this.player1Allowed = allowed;
    } else {
      this.player2Allowed = allowed;
    }
  }

  makeMove(player: WebSocket) {
    const diceRoll = Math.ceil(Math.random() * 6);
    const playerLabel = player === this.player1 ? 'player1' : 'player2';
    const opponent = player === this.player1 ? this.player2 : this.player1;
    const opponentLabel = playerLabel === 'player1' ? 'player2' : 'player1';
    const currentPos = this.position[playerLabel];
    const opponentPos = this.position[opponentLabel];

    this.moves.push({ player, diceRoll });

    if (diceRoll === 6 && currentPos === 0 && !this.isPlayerAllowed(player)) {
      this.setPlayerAllowed(player, true);
      this.sendMove(player, {
        turn: true,
        yourPos: 0,
        opponent: opponentPos,
        diceRoll,
      });
      this.sendMove(opponent, {
        turn: false,
        yourPos: opponentPos,
        opponent: 0,
        diceRoll,
      });
      return;
    }

    if (diceRoll < 6 && currentPos === 0 && !this.isPlayerAllowed(player)) {
      this.sendMove(player, {
        turn: false,
        yourPos: 0,
        opponent: opponentPos,
        diceRoll,
      });
      this.sendMove(opponent, {
        turn: true,
        yourPos: opponentPos,
        opponent: 0,
        diceRoll,
      });
      return;
    }

    if (currentPos + diceRoll > 100) {
      this.sendMove(player, {
        turn: false,
        yourPos: currentPos,
        opponent: opponentPos,
        diceRoll,
      });
      this.sendMove(opponent, {
        turn: true,
        yourPos: opponentPos,
        opponent: currentPos,
        diceRoll,
      });
      return;
    }

    let newPos = currentPos + diceRoll;
    const ladder = this.board.ladder.find((l) => l.end === newPos);
    const snake = this.board.snakes.find((s) => s.start === newPos);

    if (ladder) {
      newPos = ladder.start;
    } else if (snake) {
      newPos = snake.end;
    }

    this.position[playerLabel] = newPos;

    this.sendMove(player, {
      turn: false,
      yourPos: newPos,
      opponent: opponentPos,
      diceRoll,
    });
    this.sendMove(opponent, {
      turn: true,
      yourPos: opponentPos,
      opponent: newPos,
      diceRoll,
    });
  }
}
