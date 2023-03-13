
function clamp(min, max, x){
    if(x > max){
        x = max;
    }
    if(x < min){
        x = min;
    }
    return x;
}

/*
    storing the location of each image 
*/
const blackPieces = {
    "pawn" : "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/800px-Chess_pdt45.svg.png",
    "rook" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/800px-Chess_rdt45.svg.png",
    "knight" : "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/800px-Chess_ndt45.svg.png",
    "bishop" : "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/800px-Chess_bdt45.svg.png",
    "king" : "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/800px-Chess_kdt45.svg.png",
    "queen" : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chess_qdt45.svg/800px-Chess_qdt45.svg.png"
}
const whitePieces = {
    "pawn": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/800px-Chess_plt45.svg.png",
    "rook": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/800px-Chess_rlt45.svg.png",
    "knight": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/800px-Chess_nlt45.svg.png",
    "bishop": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/800px-Chess_blt45.svg.png",
    "king" : "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/800px-Chess_klt45.svg.png",
    "queen": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chess_qlt45.svg/800px-Chess_qlt45.svg.png"
}




function Vec(x, y){
    this.x = x;
    this.y = y;
}

const moveProfiles = {

    "pawn" : {
        //when true, the piece follows the moves provided exactly,
        //when false, the piece moves in the direction of each move
        limitedMoves : true,

        //moves that cannot take pieces
        moves : [new Vec(0, 1)],
        //moves which can take pieces
        attackingMoves : [new Vec(-1, 1), new Vec(1, 1)],
        //free moves can both take and move to empty spaces
        freeMoves : [],
        //moves which can only be applied to the first move
        firstMoves : [new Vec(0, 1)],
        firstMoveStepCount : 2,
    },
    "knight": {
        limitedMoves : true,

        moves : [],
        attackingMoves : [],
        freeMoves : [new Vec(-1, 2), new Vec(1, 2), new Vec(-2, 1), new Vec(2, 1),
                          new Vec(-1, -2), new Vec(1, -2), new Vec(-2, -1), new Vec(2, -1)],
        firstMoves : []
    },
    "rook": {
        limitedMoves : false,

        moves : [],
        attackingMoves : [],
        freeMoves : [new Vec(-1, 0), new Vec(1, 0), new Vec(0, -1), new Vec(0, 1)],
        firstMoves : []
    },
    "bishop": {
        limitedMoves : false,

        moves : [],
        attackingMoves : [],
        freeMoves : [new Vec(-1, 1), new Vec(1, 1), new Vec(-1, -1), new Vec(1, -1)],
        firstMoves : []
    },
    "king": {
        limitedMoves : true,

        moves : [],
        attackingMoves : [],
        freeMoves : [new Vec(-1, 1), new Vec(1, 1), new Vec(-1, -1), new Vec(1, -1),
                     new Vec(-1, 0), new Vec(1, 0), new Vec(0, -1), new Vec(0, 1)],
        firstMoves : []
    },
    "queen": {
        limitedMoves : false,

        moves : [],
        attackingMoves : [],
        freeMoves : [new Vec(-1, 1), new Vec(1, 1), new Vec(-1, -1), new Vec(1, -1),
                     new Vec(-1, 0), new Vec(1, 0), new Vec(0, -1), new Vec(0, 1)],
        firstMoves : []
    },

}

var selected = { 
    piece: null,
    team: null,
    /* tracking where a selected piece was before it was picked up*/
    originalPosition : new Vec(0,0),
    hoveredPosition : new Vec(0,0),
};

var popupPresent = false;

/*
    whos turn is it?
*/
var currentTeam = "white";
var kings = {
    "white" : {
        position : new Vec(0,0),
        threats : null,
    },
    "black" : {
        position : new Vec(0,0),
        threats : null,
    }
}

var cells = [];

/*
    for representing a piece when it is being moved
*/
var mouseTracker = document.getElementById("mouse-tracker");
var mouseTrackerImg = document.getElementById("mouse-tracker-img"); //child of mouse tracker
var board = document.getElementById("board");
var teamSignal = document.getElementById("signal");
var body = document.getElementsByTagName("body")[0];
/*
    when a popup is present the screen is faded
*/
var screenFader = document.getElementById('screen-fader');

board.addEventListener('mousemove', function(event){
    floatingPieceMouseOverCallback(event);
});
mouseTracker.addEventListener('mousemove', function(event){
    floatingPieceMouseOverCallback(event);
});
function floatingPieceMouseOverCallback(event){
    
    boardBounds = board.getBoundingClientRect();

    x = clamp(boardBounds.left, boardBounds.right, event.clientX);
    y = clamp(boardBounds.top, boardBounds.bottom, event.clientY);

    mouseTracker.style.transform = "translate("+x+"px,"+y+"px)";
}

body.addEventListener("mouseup", ()=>{
    cellPlace();
});




function getCellHTML(team){
    let newCell = document.createElement('div');
    newCell.className = "cell";
    newCell.setAttribute("team", null);
    newCell.setAttribute("piece", null);
    return newCell;
}

function getImageHTML(imageSrc){
    let newImage = document.createElement('img');
    newImage.setAttribute("src", imageSrc);
    return newImage;
}

function promotePawn(x, y, piece, team){
    cells[y][x].innerHTML = "";
    setPiece(x, y, piece, team);
    popupPresent = false;
    screenFader.setAttribute("active", "false");

    switchTeams();
}

function getPawnPromotionPopupHTML(x, y){

    let popupWrapper = document.createElement('div');
    popupWrapper.className = "popup-wrapper"
    let popup = document.createElement('div');
    popupWrapper.appendChild(popup);
    popup.className = "popup";

    let imgSources = blackPieces;
    popup.setAttribute("invert", 'true');
    if(currentTeam == "white"){
        imgSources = whitePieces;
        popup.setAttribute("invert", 'false');
    }

    let pieces = ["queen", "rook", "knight", "bishop"];
    for(let i = 0; i < 4; i++){
        let pieceButton = document.createElement('img');
        pieceButton.setAttribute("piece", pieces[i]);
        pieceButton.src = imgSources[pieces[i]]
        pieceButton.addEventListener("click", ()=>{
            promotePawn(x, y, pieces[i], currentTeam);
        });
        popup.appendChild(pieceButton);
    }
    

    return popupWrapper;
}

function getPiece(x, y){
    return cells[y][x].getAttribute("piece");
}
function getTeam(x, y){
    return cells[y][x].getAttribute("team");
}
function setPiece(x, y, piece, team, hasMoved = true){
    cells[y][x].innerHTML = ""; //removing previous image
    cells[y][x].setAttribute("piece", piece);
    cells[y][x].setAttribute("hasMoved", hasMoved);

    if(team == "white"){
        cells[y][x].appendChild(getImageHTML(whitePieces[piece]));
    }
    else{ //black
        cells[y][x].appendChild(getImageHTML(blackPieces[piece]));
    }
    cells[y][x].setAttribute("team", team);
}
function isEmpty(x, y){
    if(cells[y][x].getAttribute("piece") == "null"){
        return true;
    }
    return false;
}

function removePiece(x, y){
    cells[y][x].setAttribute("piece", null);
    cells[y][x].innerHTML = ""; //removing image
}

function createBoard(){
    
    let squareColour = "white";
    for(let y = 0; y < 8; y++){

        /*
            creating a new row
        */
        cells.push([]);

        for(let x = 0; x < 8; x++){

            /*
                creating and storing a new cell
            */
            board.appendChild(getCellHTML());
            board.lastChild.setAttribute("colour", squareColour);

            board.lastChild.addEventListener("mouseover", (event)=>{
                cellEnter(event, x, y);
            })
            board.lastChild.addEventListener("mousedown", ()=>{
                cellPickup(x, y);
            });
            board.lastChild.addEventListener("mouseleave", (event)=>{
                cellExit(event, x, y);
            })

            cells[y].push(board.lastChild);

            
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
function cellEnter(event, x, y){
    cells[y][x].setAttribute("hovered", "true");
    selected.hoveredPosition.x = x;
    selected.hoveredPosition.y = y;
}
function cellExit(event, x, y){
    cells[y][x].setAttribute("hovered", "false");
}

/*
    is a cell position on the board? (used when evaluating)
*/
function isInBounds(x, y){
    if(x >= 0 & x < 8){
        if(y >= 0 & y < 8){
            return true;
        } 
    }
    return false;
}


/*
    iterates over every piece to determine if it is posing a threat to the king
*/
function determineIfInCheck(){

    kings[currentTeam].threats = [];

    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){

            if(!isEmpty(x, y)){

                if(getTeam(x, y) == currentTeam){

                    let otherTeam = "white";
                    if(currentTeam == "white"){
                        otherTeam = "black";
                    }

                    let evalObject = startEvaluateBoard(x, y, getPiece(x, y), currentTeam);

                    //note: limited moves only considers moves which can attack
                    evalObject.limitedMoves.forEach(pos =>{
                        //we have a check
                        if(pos.x == kings[otherTeam].position.x & pos.y == kings[otherTeam].position.y){
                            kings[currentTeam].threats.push({
                                //can be taken to resolve check
                                source : new Vec(evalObject.xInital, evalObject.yInital),
                                blockingPositions : [],
                            })
                        }
                    });
                    //note: streamed positions are blockable
                    evalObject.streamedMoves.forEach(moveStream =>{

                        for(let p = 0; p < moveStream.length; p++){
                            //check
                            if(moveStream[p].x == kings[otherTeam].position.x & moveStream[p].y == kings[otherTeam].position.y){
                                kings[currentTeam].threats.push({
                                    //can be taken to resolve check
                                    source : new Vec(evalObject.xInital, evalObject.yInital),
                                    blockingPositions : moveStream,
                                })
                                break;
                            }
                        }
                    });

                }

                endEvaluateBoard();
            }

        }
    }
    if(kings[currentTeam].threats.length == 0){
        return false; //free of check
    }

    return true; //in check
}

function validMove(x, y, move, team, canMoveEmpty, canTake, limited = true, stepCount=1){
    
    /*
        the move step is the amount of steps a move will 
        carry out in the given direction,
        if the move is not limited we want to check the entire board
        (meaning we need a moveStep of 8)
    */
    if(!limited){
        stepCount = 8;
    }
    var newX = x;
    var newY = y;
    
    var moveStream = [];
    for(let i = 0; i < stepCount; i++){

        let stopStepping = false;

        newX += move.x;

        /*
            specifically for pawns; our direction of movement will be flipped
        */
        if(team == "white"){
            newY -= move.y;
        }
        else{
            newY += move.y;
        }
    
        if(isInBounds(newX, newY)){
    
            let moveIsValid = false;
    
            if(cells[newY][newX].getAttribute("piece") != "null"){
                stopStepping = true;
                if(canTake & cells[newY][newX].getAttribute("team") != currentTeam){
                    moveIsValid = true;
                }
            }
            else if(canMoveEmpty & cells[newY][newX].getAttribute("piece") == "null"){
                moveIsValid = true;
            }
    
            if(moveIsValid){
                cells[newY][newX].setAttribute("valid", "true");
                moveStream.push(new Vec(newX, newY));
            }
        }

        /*
            if stopStepping is true move, we have either hit a wall,
            or another piece, so stop stepping
        */
        if(stopStepping){
            break;
        }
    }
    return moveStream;
}

function startEvaluateBoard(x, y, piece, team){

    var profile = moveProfiles[piece];
    /*
        for pre defined moves (limitedMove pieces)
    */
    var _limitedMoves = [];
    var _streamedMoves = [];
    if(profile.limitedMoves){
        /*
            iterating over harmless moves (moves which can not take pieces)
        */
        for(let m = 0; m < profile.moves.length; m++){

            validMove(x, y, profile.moves[m], team, true, false);
        }

        for(let m = 0; m < profile.attackingMoves.length; m++){

            let stream = validMove(x, y, profile.attackingMoves[m], team, false, true);
            if(stream.length > 0){
                _limitedMoves.push( stream[0] );
            }
        }

        for(let m = 0; m < profile.freeMoves.length; m++){

            let stream = validMove(x, y, profile.freeMoves[m], team, true, true);
            if(stream.length > 0){
                _limitedMoves.push( stream[0] );
            }
        }

    }
    else{ //moves contiune in the specifed vector direction
        for(let m = 0; m < profile.freeMoves.length; m++){

            _streamedMoves.push( validMove(x, y, profile.freeMoves[m], team, true, true, false) );
            
        }
    }

    if(cells[y][x].getAttribute("hasMoved") == "false"){

        for(let m = 0; m < profile.firstMoves.length; m++){

            validMove(x, y, profile.firstMoves[m], team, true, false, true, profile.firstMoveStepCount);
        }
    }

    //collecting this pieces valid moves, used to determine if king is in check
    return {xInital : x, yInital : y, limitedMoves : _limitedMoves, streamedMoves : _streamedMoves};

}

function fetchValidPositions(){
    let validArray = [];
    /*
        finds and returns all valid moves currently visable on the board
    */
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            if(cells[y][x].getAttribute("valid") == "true"){
                validArray.push(new Vec(x, y));
            }
        }
    } 
    return validArray;
}


function endEvaluateBoard(){
    /*
        resets all cells valid states
    */
    for(let x = 0; x < 8; x++){
        for(let y = 0; y < 8; y++){
            cells[y][x].setAttribute("valid", "false");
        }
    }
}

function evaluatePawnPromotion(piece, x, y){
    if(piece == "pawn"){
        /*
            this only applies to pawns 
        */
        let canPromote = false;
        if(currentTeam == "white"){
            if(y == 0){
                canPromote = true;
            }
        }
        //black 
        else if(y == 7){
            canPromote = true;
        }

        if(canPromote){
            screenFader.setAttribute("active", "true");
            removePiece(x, y);
            cells[y][x].appendChild(getPawnPromotionPopupHTML(x, y));

            popupPresent = true;
        }
    }
}

function cellPlace(){
    if(selected.piece != null){
        let success = true;

        let posX = selected.hoveredPosition.x;
        let posY = selected.hoveredPosition.y;
        /*
            the chosen move is invalid, so reset the piece
        */
        if(cells[posY][posX].getAttribute("valid") != "true"){
            posX = selected.originalPosition.x;
            posY = selected.originalPosition.y;

            success = false;
        }


        mouseTrackerImg.setAttribute("src", "null");
        endEvaluateBoard();
        setPiece(posX, posY, selected.piece, currentTeam, cells[posY][posX].getAttribute("hasMoved"));

        if(success){
            //our move is a success
            submitMove(selected.piece, posX, posY);
        }

        selected.piece = null;
        selected.team = null;
    }
}
function cellPickup(x, y){
    /*
        we need to pick up a piece
    */
    let piece = getPiece(x, y);
    let team = getTeam(x, y);

    if(selected.piece == null){

        if(piece != "null"){
            /*
                we are moving OUR teams piece
            */
            if(team == currentTeam){
                selected.piece = piece;
                selected.team = team;
                selected.originalPosition.x = x;
                selected.originalPosition.y = y;

                if(team == "white"){
                    mouseTrackerImg.setAttribute("src", whitePieces[piece]);
                }
                else{ //black 
                    mouseTrackerImg.setAttribute("src", blackPieces[piece]);
                }
                removePiece(x, y);
                startEvaluateBoard(x, y, piece, team);
            }
        }
    }
}

function submitMove(piece, x, y){

    if(determineIfInCheck()){
        console.log("Checked by " + currentTeam)
    }

    if(piece == "king"){
        kings[currentTeam].position.x = x;
        kings[currentTeam].position.y = y;
    }

    evaluatePawnPromotion(piece, x, y, currentTeam);

    if(!popupPresent){
        switchTeams();
    }
}

function switchTeams(){
    if(currentTeam == "white"){
        currentTeam = "black";
    }
    else{
        currentTeam = "white";
    }
    teamSignal.setAttribute("team", currentTeam);
}

function clearBoard(){
    screenFader.setAttribute("active", "false");
    for(let y = 0; y < 8; y++){
        for(let x = 0; x < 8; x++){
            removePiece(x, y);
        }
    }
}

function resetBoard(){
    currentTeam = "white";
    clearBoard();
    placeStartingPieces();
}

function placeStartingPieces(){
    //white 
    for(let x = 0; x < 8; x++){
        setPiece(x, 6, "pawn", "white", false);
    }
    setPiece(0, 7, "rook", "white", false);
    setPiece(1, 7, "knight", "white", false);
    setPiece(2, 7, "bishop", "white", false);
    setPiece(3, 7, "queen", "white", false);
    setPiece(4, 7, "king", "white", false);
    kings["white"].position.x = 4;
    kings["white"].position.y = 7;
    setPiece(5, 7, "bishop", "white", false);
    setPiece(6, 7, "knight", "white", false);
    setPiece(7, 7, "rook", "white", false);

    //black 
    for(let x = 0; x < 8; x++){
        setPiece(x, 1, "pawn", "black", false);
    }
    setPiece(0, 0, "rook", "black", false);
    setPiece(1, 0, "knight", "black", false);
    setPiece(2, 0, "bishop", "black", false);
    setPiece(3, 0, "queen", "black", false);
    setPiece(4, 0, "king", "black", false);
    kings["black"].position.x = 4;
    kings["black"].position.y = 0;
    setPiece(5, 0, "bishop", "black", false);
    setPiece(6, 0, "knight", "black", false);
    setPiece(7, 0, "rook", "black", false);
    
}

createBoard();
placeStartingPieces();

