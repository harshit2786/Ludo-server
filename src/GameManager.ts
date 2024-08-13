import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE } from "./messages";


export class GameManager {
    private games : Game[];
    private pendingUser : WebSocket | null;
    private users : WebSocket[];
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket : WebSocket){
        this.users.push(socket);
        this.addHandler(socket)
    }

    removeUser(socket : WebSocket){
        this.users = this.users.filter(user => user !== socket);
        // Stop the Game
    }

    private addHandler(socket :WebSocket) {
        socket.on("message",(data) => {
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser,socket);
                    this.users.push(socket);
                    this.pendingUser = null;
                    this.games.push(game);
                }
                else{
                    this.pendingUser = socket;
                    this.users.push(socket);
                }
            }

            if(message.type === MOVE){
                const game = this.games.find((g) => g.player1 === socket || g.player2 === socket);
                
            }
        })
    }
}