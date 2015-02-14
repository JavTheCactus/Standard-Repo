var colArr = [[], [], [], [], [], [], []];
var tokens = 0;
var isPlaying = true;
var gameStarted = false;
var maxHeight = 6;
var turnAI = false;
var humanForm;

var aiThinkDepth = 5;
var winHeur = 1;
var losHeur = -1;
var neutHeur = 1;

var aiTurn = function()
{
    var randIndex = Math.floor((Math.random() * 7) + 0);
    var columnLength = colArr[randIndex].length;

    while(columnLength >= maxHeight)
    {
        randIndex = Math.floor((Math.random() * 7) + 0);
        columnLength = colArr[randIndex].length;
    }

    return randIndex;
}

var changeNotifText = function(winText)
{
    $(".notif").html(winText);
    $(".theDisplay").animate({backgroundColor: '#F9E559'}, 200);
    $(".notif").fadeIn(200);
}

var checkForDraw = function()
{
    for(var i = 0; i < colArr.length; i++)//if all colArr have not been filled yet, then there is now draw
        if(colArr[i].length < maxHeight)
            return;

    $(".notif").css({marginTop: '15px'});
    changeNotifText('Draw!');
    $(".notif").show();

    isPlaying = false;
};

var dropLength = function(index) //calculates the distance a token will drop in the column
{
    return (maxHeight + 0.15 - colArr[index].length) * 50;
};

var hideWarning = function()
{
    $(".theDisplay").animate({backgroundColor: '#8EDC9D'}, 200);
    $(".theDisplay .token").animate({backgroundColor: '#8EDC9D', borderColor: '#8EDC9D'}, 200);
    $(".notif").fadeOut(200);
}

var locate = function(type, x, y)
{

    if((x < 0) || (x > 6)) return false; //checks if coordinates are out of bounds for x
    if((y < 0) || (y > maxHeight - 1)) return false; // checks if coordinates are out of bounds for y

    return (colArr[x][y] === type);
};

var resetAll = function()
{
    $(".theGame .token").fadeOut(function() //adds a fadeout animation upon the removal of all tokens in the colArr
    {
        $(this).remove();
    });
        for(var i = 0; i < colArr.length; i++) colArr[i] = []; //resets the value of the colArr to []

        if($(".theDisplay").css('backgroudnColor') !== '#8EDC9D' && $(".theDisplay .token").css('backgroundColor') !== '#8EDC9Dupd')
        { //condition to further beautify the color transition
            $(".theDisplay").animate({backgroundColor: '#8EDC9D'}, 200); //reverts the win highlight color
            $(".theDisplay .token").animate({backgroundColor: '#8EDC9D', borderColor: '#8EDC9D'}, 200); //hides the token of the winner
        }

        $(".notif").fadeOut(200); //hides the winning text
        isPlaying = true;
        gameStarted = false;
        turnAI = false;
}

var showWarning = function(warningText)
{
    $(".theDisplay .token").hide();
    changeNotifText(warningText);
}

var updateGame = function(index) //passes the a value from 0 (the leftmost column) to 6 (the rightmost column)
{
    if(!isPlaying) return false; //the game will not update if it is not being played

    var columnLength = colArr[index].length; //gives the current length of an column (shows the number of tokens - 1)

    if(columnLength >= maxHeight) return false; //if the column length is six or greater, it will not add another token to the column
        tokens++;

    var type = tokens % 2; //determines whether the token is player 1's or player 2's (0 for p1, 1 for p2)

    colArr[index].push(type); //inserts the token in the desired collumn

    if(winner(type, index, columnLength)) //checks if a player won
    {
        $(".theDisplay .token").show();
        $(".notif").css({marginTop: '0px'});
        changeNotifText('Winner!');

        if(type % 2 == 0) //if the last token placed which secured the win is player 1's, it will display player 1's token color
            winnerColorChange('#750A7A');
        else if(type % 2 == 1) //else it will display player 2's token color
            winnerColorChange('#EF7126');

        isPlaying = false;
    }

    if(isPlaying && colArr[index].length === maxHeight) //checks to see if a draw has been met
        checkForDraw();

    return true;
};

var winner = function(type, x, y)
{
    if(!locate(type, x, y)) return false; //

    var direct = [[1,0], [1,1], [0,1], [1,-1]];
    var matches = 0;

    for(var i = 0; i < 4; i++)
    {
        for(var j = 1; ; j++)
        {
            if(locate(type, x + j * direct[i][0], y + j * direct[i][1]))
                matches++;
            else break;
        }

        for(var j = 1; ; j++)
            if(locate(type, x - j * direct[i][0], y - j * direct[i][1]))
                matches++;
            else break;

        if(matches >= 3) return true;

        matches = 0;
    }

    return false;
};

var winnerColorChange = function(color)
{
    var tempString = '3px solid';
    tempString = tempString + ' ' +color;
    $(".theDisplay .token").animate({backgroundColor: color, borderColor: tempString}, 200);
};

$(document).ready(function()
{
    $(".ai").click(function()
    {
        resetAll();
        humanForm = false;
        $(".turnai").fadeIn(200);
        $(".ai").css({border: '3px solid #EF7126'});
        $(".human").css({border: '3px solid #F9E559'});
    });

    $(".human").click(function()
    {
        resetAll();
        humanForm = true;
        $(".turnai").fadeOut(200);
        $(".human").css({border: '3px solid #EF7126'});
        $(".ai").css({border: '3px solid #F9E559'});
    });

    $(".theColumn .button").click(function()
    {
        if(humanForm == null)
        {
            showWarning('Please select an opponent first.');
            return;
        }
            
        if(turnAI && !humanForm) //states that it is the AI's turn
        {
            $(".notif").css({marginTop: '15px'});
            showWarning('It\'s the AI\'s turn.');
            return;
        }
        else //removes warning
        {
            hideWarning();
        }

            var index = $(this).parent().index(); //upon clicking, the button would get the index of the column in which the button is a part of

        if(!updateGame(index)) return; //if the game is not being played, nothing should happen

        gameStarted = true; //else the game would start

        var thePlayer = tokens%2 ? "player2" : "player1"; //defines whether the token is player 2's or player 1's according to the global token variable
        var newToken = "<div class=\"token " + thePlayer + "\"></div>"; //creates a new token for either player 1 or 2

        $(this).prev().prepend(newToken); //helps in defining the topmost token

        var tokenToPass = $(this).prev().children(".token:first-child").position().top; //defines the token to be placed on top

        $(this).prev().children(".token:first-child").css("top", tokenToPass); //helps in aligning the positioning of the tokens, as well as the placement of new
                                                                        //tokens

        $(this).prev().children(".token:first-child").animate({top:"+="+dropLength(index)+"px"}, 300);
            //fixes the animation such that all tokens are seen and are at their proper place

        if(!humanForm)
            turnAI = true;
        if(!isPlaying) return; //if the game ends, we stop
    });

    $(".turnai").click(function()
    {
        if(!turnAI) //states that it is the turn of the AI
        {
            $(".notif").css({marginTop: '15px'});
            showWarning('It\'s your turn.');
            return;
        }
        else //removes warning
        {
            hideWarning();
        }

        var index = aiTurn(); //upon clicking, the button would get the index of the column in which the button is a part of
        var strIndex = "#" + index;
        if(!updateGame(index)) return; //if the game is not being played, nothing should happen

        gameStarted = true; //else the game would start

        var thePlayer = tokens%2 ? "player2" : "player1"; //defines whether the token is player 2's or player 1's according to the global token variable
        var newToken = "<div class=\"token " + thePlayer + "\"></div>"; //creates a new token for either player 1 or 2

        $(".theColumn .button" + strIndex).prev().prepend(newToken); //helps in defining the topmost token

        var tokenToPass = $(".theColumn .button" + strIndex).prev().children(".token:first-child").position().top; //defines the token to be placed on top

        $(".theColumn .button" + strIndex).prev().children(".token:first-child").css("top", tokenToPass); //helps in aligning the positioning of the tokens, as well as the placement of new
                                                                        //tokens

        $(".theColumn .button" + strIndex).prev().children(".token:first-child").animate({top:"+="+dropLength(index)+"px"}, 300);
            //fixes the animation such that all tokens are seen and are at their proper place

        turnAI = false;
        if(!isPlaying) return; //if the game ends, we stop
    });


    $(".reset").click(function() //resets all values
    {
        resetAll();
    });
});