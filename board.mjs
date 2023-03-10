const blackPieces = {
    "pawn" : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/800px-Chess_pdt45.svg.png",
    "rook" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/800px-Chess_rdt45.svg.png",
    "knight" : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/800px-Chess_ndt45.svg.png",
    "bishop" : "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/800px-Chess_bdt45.svg.png",
    "king" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/800px-Chess_kdt45.svg.png",
    "queen" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/800px-Chess_kdt45.svg.png"
}
const whitePieces = {
    "pawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/800px-Chess_plt45.svg.png",
    "rook": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/800px-Chess_rlt45.svg.png",
    "knight": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/800px-Chess_nlt45.svg.png",
    "bishop": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/800px-Chess_blt45.svg.png",
    "king" : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/800px-Chess_klt45.svg.png",
    "queen": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/800px-Chess_klt45.svg.png"
}


export class Board{
    constructor(){

        this.currentTeam = "white";
        this.selected = { 
            piece: null,
            team: null 
        };

        createBoard();        
    }

    getPiece(x, y){
        return this.cells[y][x].getAttribute("piece");
    }
    getTeam(x, y){
        return this.cells[y][x].getAttribute("team");
    }
    setPiece(x, y, piece, team){
        this.cells[y][x].innerHTML = ""; //removing previous image
        this.cells[y][x].setAttribute("piece", piece);
    
        if(team == "white"){
            this.cells[y][x].appendChild(this.getImageHTML(whitePieces[piece]));
        }
        else{ //black
            this.cells[y][x].appendChild(this.getImageHTML(blackPieces[piece]));
        }
        this.cells[y][x].setAttribute("team", team);
    }
    
    removePiece(x, y){
        this.cells[y][x].setAttribute("piece", null);
        this.cells[y][x].innerHTML = ""; //removing image
    }
    
    createBoard(){
        
        let squareColour = "white";
        for(let y = 0; y < 8; y++){
    
            /*
                creating a new row
            */
            this.cells.push([]);
    
            for(let x = 0; x < 8; x++){
    
                /*
                    creating and storing a new cell
                */
                this.board.appendChild(getCellHTML());
                this.board.lastChild.setAttribute("colour", squareColour);
    
                this.board.lastChild.addEventListener("mouseover", (event)=>{
                    cellEnter(event, x, y);
                })
                this.board.lastChild.addEventListener("click", (event)=>{
                    cellClick(event, x, y);
                })
                this.board.lastChild.addEventListener("mouseleave", (event)=>{
                    cellExit(event, x, y);
                })
    
                this.cells[y].push(board.lastChild);
    
                
                /*
                    switching the cell colour (only if not at the end of a row)
                */
                if(x != 7){
                    if(squareColour === "white"){
                        squareColour = "black";
                    }
                    else{
                        squareColour = "white";
                    }
                }
            }
        }
    }
    
    /*
        a cell has either been hovered or unhovered by the mouse
    */
    cellEnter(event, x, y){
        this.cells[y][x].setAttribute("hovered", "true");
    }
    cellExit(event, x, y){
        this.cells[y][x].setAttribute("hovered", "false");
    }
    cellClick(event, x, y){
    
        /*
            we need to pick up a piece
        */
    
        let piece = this.getPiece(x, y);
        let team = this.getTeam(x, y);
    
        if(selected.piece == null){
    
            if(piece != "null"){
                /*
                    we are moving OUR teams piece
                */
                if(team == currentTeam){
                    selected.piece = piece;
                    selected.team = team;
    
                    if(team == "white"){
                        mouseTrackerImg.setAttribute("src", whitePieces[piece]);
                    }
                    else{ //black 
                        mouseTrackerImg.setAttribute("src", blackPieces[piece]);
                    }
                    this.removePiece(x, y);
                }
            }
        }
        else{
    
            let canPlace =  false;
            /*
                we are taking a piece
            */
            if(piece != "null" & team != currentTeam){
                canPlace = true;
            }
            /*
                empty space
            */
            else if(piece == "null"){
                canPlace = true;
            }
    
            if(canPlace){
                mouseTrackerImg.setAttribute("src", "null");
                setPiece(x, y, selected.piece, currentTeam);
                selected.piece = null;
                selected.team = null;
            }
        }
    }
    
    
    
    clearBoard(){
        for(let y = 0; y < 8; y++){
            for(let x = 0; x < 8; x++){
                removePiece(x, y);
            }
        }
    }
    
    resetBoard(){
        clearBoard();
        placeStartingPieces();
    }
    
    placeStartingPieces(){
        //white 
        for(let x = 0; x < 8; x++){
            setPiece(x, 6, "pawn", "white");
        }
        setPiece(0, 7, "rook", "white");
        setPiece(1, 7, "knight", "white");
        setPiece(2, 7, "bishop", "white");
        setPiece(3, 7, "king", "white");
        setPiece(4, 7, "queem", "white");
        setPiece(5, 7, "bishop", "white");
        setPiece(6, 7, "knight", "white");
        setPiece(7, 7, "rook", "white");
    
        //black 
        for(let x = 0; x < 8; x++){
            setPiece(x, 1, "pawn", "black");
        }
        setPiece(0, 0, "rook", "black");
        setPiece(1, 0, "knight", "black");
        setPiece(2, 0, "bishop", "black");
        setPiece(3, 0, "king", "black");
        setPiece(4, 0, "queem", "black");
        setPiece(5, 0, "bishop", "black");
        setPiece(6, 0, "knight", "black");
        setPiece(7, 0, "rook", "black");
    }
}