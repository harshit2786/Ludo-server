import { WebSocket } from "ws";

interface Snake {
    start: number;
    end: number;
  }
  
  // Define the interface for a ladder
  interface Ladder {
    start: number;
    end: number;
  }
  
  // Define the interface for a board
 export interface Board {
    label: string;
    snakes: Snake[];
    ladder: Ladder[];
  }

  export interface Position {
    player1 : number;
    player2 : number;
  }
  export interface Move {
    player : WebSocket;
    diceRoll : number;
  }

  export interface MoveResponse {
    Next : WebSocket;
    newPos : Position;
    ended : boolean;
  }