/**
 *  Name: Yash Patel
 *  Email: Yash_Patel5@student.uml.edu
 *  File: scrabble.js
 * 
 *  Referred to the following websites for learning about various features implemented in this assignment:
 *  - Referred to this link for learning about generating random numbers: https://www.w3schools.com/js/js_random.asp
 *  - Referred to the following link for learning about JQuery Draggable and Droppable (drag & drop):
 *          - https://api.jqueryui.com/draggable/
 *          - https://api.jqueryui.com/droppable/
 *  - Also referred to the resources and examples provided in the homework handout.
 * 
 */


// Global variable for holding the scrable tiles
var scrabble_tiles = [] ;

// Array of letters
var letters = ['_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

// Dictionary for holding the letters currently in the rack
var letters_in_rack = {};

// Dictionary for indicating what slot of the board has what letter
var board = {};

// Similar to the board dictionary, this is for indicating what letter is placecd on what slot of the board
var board_pos = {};

// Dictionary for holding the positions of the tiles on the rack 
var tiles_pos = {};

var first_draw = false;
var second_draw = false;

// global variable for holding the final score
var final_score = 0;


// function for adding a tile to the rack, letter is the letter to be inserted, 
// while index is concataneted to the letter which would be the ID for the image
function add_tile(letter, index) {
    var img_source = "<img class=\"tile\" src=" + scrabble_tiles[letter].img + " id=\"" + letter + index + "\" alt=\"" + letter + index + "\">";
    $('#tiles').append(img_source);
    letters_in_rack[letter+index] = letter;
}

// function for generating random letters, count is for indicating number of random letters to be generated
function get_random_letters(count) {
    var random_letters = [];
    var remaining_letters = 0;
    // checking how many letters are remaining
    for (var i = 0; i < letters.length; i++) {
        remaining_letters += scrabble_tiles[letters[i]].amount;
    }    
    var remaining = remaining_letters + Object.keys(letters_in_rack).length;

    if (remaining === 0) {
        $("#error").html("All the tiles have been used, please start again.");
        return random_letters;
    }
    if (remaining <= 7) {
        $("#error").html("These are the last " + remaining + " tiles.");
    }
    
    // checking if the count is less than remaining letters, so that the function doesn't error
    if (remaining_letters > 0 && remaining_letters < count) {
        // finding the remaining letters by iterating through the scrabble_tiles dictionary
        for (var i = 0; i < letters.length; i++) {
            if (scrabble_tiles[letters[i]].amount > 0) {
                random_letters.push(letters[i]);
                scrabble_tiles[letters[i]].amount -= 1;
            }
        }
    }
    else if (remaining_letters == 0 && remaining > 0) {
        $("#error").html("These are the last " + remaining + " tiles.");
        return random_letters;
    }
    else {
        // generating random letters
        while (random_letters.length < count) {
            var curr_num = Math.floor(Math.random() * 27);
            if (scrabble_tiles[letters[curr_num]].amount >= 1){
                scrabble_tiles[letters[curr_num]].amount -= 1;
                random_letters.push(letters[curr_num]);
            }
        }
    }      

    return random_letters;
}

// function for calculating the score, also returns the overall final score
function calculate_scores(){
    var scores = 0;
    var double_word = false;

    // goes through the board dictionary to see what slots have what letters
    // and those letters are then used to get their values from the scrabble_tiles dictionary 
    for (var i = 1; i < 10; i++) {
        if (board["t"+i] != "-"){
            scores += scrabble_tiles[board["t"+i]].value;
            if (i == 3) {
                double_word = true;
            }
            else if (i == 5 || i == 7) {
                scores += scrabble_tiles[board["t"+i]].value;
            }    
        }    
    }
    if (double_word) {
        scores *= 2;
    }

    if (final_score != 0) {
        $("#scores").html("Score: <span>" + final_score + "</span> + <span id=\"c_score\">" + scores + "</span>");
    }
    else {
        $("#scores").html("Score: <span>" + scores + "</span>");
    }
    
    return final_score + scores;
}

// function for storing the positions for the tiles on the rack, so that if the tiles
// are dropped back to the rack they are aligned properly to their original position
function record_tiles_pos() {
    tiles_pos = {};
    var letter_index = Object.keys(letters_in_rack);

    for (var i = 0; i < letter_index.length; i++) {
        var pos = $("#" + letter_index[i]).offset();
        tiles_pos[letter_index[i]] = pos;
    }

    if (!first_draw && !second_draw){
        first_draw = true;
    }
    else if (second_draw && first_draw) {
        first_draw = false;
    }
}

// function for checking whether the dragged object is being placed at a valid slot  
// on the board that is the letter being placed directly next to another letter
function valid(index) {
    var is_board_empty = true;

    for (var i = 1; i < 10; i++) {
        if (board["t"+String(i)] != "-"){
            is_board_empty = false;
        }
    }

    // if board is empty, which means that this is the first letter being placed,
    // than it can be placed at any slot
    if (is_board_empty) {
        return true;
    }
    else {
        var index_num = parseInt(index.substring(1));

        if (index_num - 1 == 0) {
            return true;
        }
        else{
            var prev_index = "t" + String(index_num - 1);

            if (board[prev_index] != "-") {            
                return true;
            }
            else {
                return false;
            }
        }
    }
}

// functions for making the tiles draggable, and the rack and the scrabble board droppable
function run_drag_drop(){
    // making the tiles draggable
    $(".tile").draggable({
        snap: ".b_tile, #tiles",
        grid: [1,1],
        revert: function(droppable) {
            // if the tile is dropped to invalid area, then revert
            if (!droppable) {
                $("#error").html("Please drop the element at a valid area.");
                return true;
            }

            var droppable_id = droppable.attr('id');
            // checking if the tile is placed next to another letter
            if (droppable_id != "tiles") {
                var letter = board[droppable_id];
                board[droppable_id] = "-";

                if (!valid(droppable_id)) {
                    delete board_pos[droppable_id];
                    calculate_scores();
                    $("#error").html("Please drag the next element next to the another letter, there should be no gaps.");
                    return true;
                }
                else {
                    board[droppable_id] = letter;
                }   
            }
        },
        start: function (event, ui){
            // removing any error message displayed
            $("#error").html("");
        }
    });

    // making the board dropabble
    $(".b_tile").droppable({
        accept: ".tile",
        drop: function (event, ui) {
            var droppable_id = $(this).attr('id'); 
            var draggable_id = ui.draggable.attr('id');
            
            if (board[droppable_id] == "-") {
                board[droppable_id] = draggable_id[0];

                board_pos[draggable_id] = droppable_id;

                var droppable_pos = $("#" + droppable_id).offset();
                $("#" + draggable_id).offset({ top: droppable_pos.top + 3, left: droppable_pos.left + 3 });

                calculate_scores();
                delete letters_in_rack[draggable_id];
            }
        }
    });

    // making the tiles rack droppable
    $("#tiles").droppable({
        accept: ".tile",
        drop: function (event, ui) {           
            var draggable_id = ui.draggable.attr('id');

            board[board_pos[draggable_id]] = "-";
            letters_in_rack[draggable_id] = draggable_id[0];

            // for some reason when dropping the element back to the rack for the first time, 
            // it setting the element position to be 22px above the acutual position, so using
            // boolean to determine whether it is the first draw or not
            if (first_draw) { 
                $("#" + draggable_id).offset({ top: tiles_pos[draggable_id].top + 22, left: tiles_pos[draggable_id].left });           
            }
            else {
                $("#" + draggable_id).offset({ top: tiles_pos[draggable_id].top, left: tiles_pos[draggable_id].left });           
            }

            calculate_scores();
        }
    });
}

// function called when next is pressed, bring the tiles count on the rack to 7
function next() {
    second_draw = true;

    // draw more tiles only when the number of tiles on the rack is less than 7
    if (Object.keys(letters_in_rack).length < 7) {
        // clearing the board
        board = {
            "t1": "-",
            "t2": "-",
            "t3": "-",
            "t4": "-",
            "t5": "-",
            "t6": "-",
            "t7": "-",
            "t8": "-",
            "t9": "-"
        };

        // removing the tiles on the board
        $("#tiles").empty();

        // storing the tiles on the rack and generating new letters
        var remaining_letters = Object.keys(letters_in_rack).length;
        var new_letters = get_random_letters(7 - remaining_letters);

        if (remaining_letters >= 1) {
            var current_letters = Object.values(letters_in_rack).concat(new_letters);
            new_letters = current_letters; 
            letters_in_rack = {};
        }

        for (var i = 0; i < new_letters.length; i++) {
            add_tile(new_letters[i], i);
        }

        // saving the tiles position on the rack
        record_tiles_pos();

        // calling drag & drop
        run_drag_drop();
    }
}

// function for starting the game, this function is also when restart button is pressed
function start(){
    final_score = 0;
    letters_in_rack = {};

    // clearing the board
    board = {
        "t1": "-",
        "t2": "-",
        "t3": "-",
        "t4": "-",
        "t5": "-",
        "t6": "-",
        "t7": "-",
        "t8": "-",
        "t9": "-"
    };

    // initializing the scrabble tiles with their costs, amount, and the corresponding tile image
    scrabble_tiles["A"] = { "value" : 1,  "amount" : 9,  "img" : "img/scrabble_tiles/Scrabble_Tile_A.jpg"  } ;
    scrabble_tiles["B"] = { "value" : 3,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_B.jpg"  } ;
    scrabble_tiles["C"] = { "value" : 3,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_C.jpg"  } ;
    scrabble_tiles["D"] = { "value" : 2,  "amount" : 4,  "img" : "img/scrabble_tiles/Scrabble_Tile_D.jpg"  } ;
    scrabble_tiles["E"] = { "value" : 1,  "amount" : 12, "img" : "img/scrabble_tiles/Scrabble_Tile_E.jpg"  } ;
    scrabble_tiles["F"] = { "value" : 4,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_F.jpg"  } ;
    scrabble_tiles["G"] = { "value" : 2,  "amount" : 3,  "img" : "img/scrabble_tiles/Scrabble_Tile_G.jpg"  } ;
    scrabble_tiles["H"] = { "value" : 4,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_H.jpg"  } ;
    scrabble_tiles["I"] = { "value" : 1,  "amount" : 9,  "img" : "img/scrabble_tiles/Scrabble_Tile_I.jpg"  } ;
    scrabble_tiles["J"] = { "value" : 8,  "amount" : 1,  "img" : "img/scrabble_tiles/Scrabble_Tile_J.jpg"  } ;
    scrabble_tiles["K"] = { "value" : 5,  "amount" : 1,  "img" : "img/scrabble_tiles/Scrabble_Tile_K.jpg"  } ;
    scrabble_tiles["L"] = { "value" : 1,  "amount" : 4,  "img" : "img/scrabble_tiles/Scrabble_Tile_L.jpg"  } ;
    scrabble_tiles["M"] = { "value" : 3,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_M.jpg"  } ;
    scrabble_tiles["N"] = { "value" : 1,  "amount" : 6,  "img" : "img/scrabble_tiles/Scrabble_Tile_N.jpg"  } ;
    scrabble_tiles["O"] = { "value" : 1,  "amount" : 8,  "img" : "img/scrabble_tiles/Scrabble_Tile_O.jpg"  } ;
    scrabble_tiles["P"] = { "value" : 3,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_P.jpg"  } ;
    scrabble_tiles["Q"] = { "value" : 10, "amount" : 1,  "img" : "img/scrabble_tiles/Scrabble_Tile_Q.jpg"  } ;
    scrabble_tiles["R"] = { "value" : 1,  "amount" : 6,  "img" : "img/scrabble_tiles/Scrabble_Tile_R.jpg"  } ;
    scrabble_tiles["S"] = { "value" : 1,  "amount" : 4,  "img" : "img/scrabble_tiles/Scrabble_Tile_S.jpg"  } ;
    scrabble_tiles["T"] = { "value" : 1,  "amount" : 6,  "img" : "img/scrabble_tiles/Scrabble_Tile_T.jpg"  } ;
    scrabble_tiles["U"] = { "value" : 1,  "amount" : 4,  "img" : "img/scrabble_tiles/Scrabble_Tile_U.jpg"  } ;
    scrabble_tiles["V"] = { "value" : 4,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_V.jpg"  } ;
    scrabble_tiles["W"] = { "value" : 4,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_W.jpg"  } ;
    scrabble_tiles["X"] = { "value" : 8,  "amount" : 1,  "img" : "img/scrabble_tiles/Scrabble_Tile_X.jpg"  } ;
    scrabble_tiles["Y"] = { "value" : 4,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_Y.jpg"  } ;
    scrabble_tiles["Z"] = { "value" : 10, "amount" : 1,  "img" : "img/scrabble_tiles/Scrabble_Tile_Z.jpg"  } ;
    scrabble_tiles["_"] = { "value" : 0,  "amount" : 2,  "img" : "img/scrabble_tiles/Scrabble_Tile_Blank.jpg"  } ;
    scrabble_tiles["-"] = { "value" : 0 };

    // getting first 7 tiles
    var random_letters = get_random_letters(7);
    for (var i = 0; i < random_letters.length; i++) {
        add_tile(random_letters[i], i);
    }

    // saving the tiles position on the rack
    record_tiles_pos();

    // calling drag and drop
    run_drag_drop();
}

$(document).ready(function () {
    // starting the game
    start();
    
    // handling the click of the next button
    $("#next").click(function(){
        final_score = calculate_scores();
        $("#scores").html("Score: <span>" + final_score + "</span>");
        next();
    });

    // handling the click of the restart button
    $("#restart").click(function(){
        $("#tiles").empty();
        $("#scores").empty();
        start();
    });
});
