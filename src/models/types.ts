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
  type player = "player1" | "player2"
  export interface Move {
    player : player;
    position : number;
  }

  export interface MoveResponse {
    Next : WebSocket;
    newPos : Position;
    ended : boolean;
  }