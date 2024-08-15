import { WebSocket } from "ws";
import { Game } from "./Game";
import { END, INIT_GAME, MOVE, PENDING } from "./messages";


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
        if(this.pendingUser === socket){
            this.pendingUser = null;
        }
        const game = this.games.find((g) => g.player1 === socket || g.player2 === socket);
        if(game){
            this.games = this.games.filter((gam) => gam.player1!==socket && gam.player2!==socket);
            this.removeUser(game.player1);
            this.removeUser(game.player2);
        }
        // Stop the Game
    }

    private addHandler(socket :WebSocket) {
        socket.on("message",(data) => {
            const message = JSON.parse(data.toString());
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser,socket);
                    this.pendingUser = null;
                    this.games.push(game);
                    console.log("New game started");
                }
                else{
                    this.pendingUser = socket;
                    socket.send(JSON.stringify({
                        type : PENDING,
                    }))
                    console.log("new user");
                }
            }

            if(message.type === MOVE){
                const game = this.games.find((g) => g.player1 === socket || g.player2 === socket);
                if(game){
                    game.makeMove(socket);
                }
                
            }
            if(message.type === END){
                const game = this.games.find((g) => g.player1 === socket || g.player2 === socket);
                if(game){
                    this.games = this.games.filter((gam) => gam.player1!==socket && gam.player2!==socket);
                    const gam = new Game(game.player1,game.player2);
                    this.games.push(gam);
                }
                
            }
        })
    }
}