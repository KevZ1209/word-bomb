
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const lettergen = require(__dirname + "/letterGenerator.js")

var score = 0;
var status = "";
var letters = "";
var timer = 10;
var timeToType = 10000;
var ticktock = 0;
var time;
var timeLimit = 10;
var userWords = [];

// timer functionality
function increaseTime() {
    console.log(ticktock);
    ticktock ++;
}

setInterval(increaseTime, 1000);



const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
    userWords.length = 0;
    res.sendFile(__dirname + "/public/startpage.html");
})

app.get("/play", function(req, res) {
    ticktock = 0;
    score = 0;
    status = "";
    letters = lettergen.get2Letters();
    res.render("game", {letters: letters, userScore: score, gameStatus: status});
})

app.post("/play", function(req, res) {

    console.log(userWords);

    function resetGame() {
        score = 0;
        letters = "";
        status = "";
        userWords.length = 0;
        res.redirect("/");
    }

    function outOfTime() {
        ticktock = 0;
        score = 0;
        letters = "Press Reset Button to Play again!";
        userWords.length = 0;
        res.render("game", {letters: letters, userScore: score, gameStatus: status});
    }

    function nextMove() {
        time = ticktock;
        letters = score >= 25 ? lettergen.get3Letters() : lettergen.get2Letters();
        status = "";
        res.render("game", {letters: letters, userScore: score, gameStatus: status});
    }

    // var word = res.body.userWord;
    if (req.body.button === "reset") {
        resetGame();
    }
    else if (ticktock >= timeLimit) {
        console.log("GAME OVER!!");
        status="GAME OVER!"
        outOfTime();
    }
    else  {
        var word = (req.body.userWord).toUpperCase();
        const url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word;
    
        https.get(url, function(response) {
            // if (response.statusCode !== 200) {
            //     // invalid word
            //     // status = '"' + word + '"' +  "wasn't in the dictionary. Press reset to play again";
            //     // outOfTime();
            // }
            // else if (checkWord(word) === false) {
            //     // status = '"' + word + '"' + " didn't contain the letters " + '"' + letters + '"' + ". Press reset to play again";
            //     // outOfTime();
            // }
            // else if (userWords.includes(word)) {
            //     // status = "You already typed" + '"' + word + '".' + "Press reset to play again";
            //     // outOfTime();
            // }

            if (response.statusCode !== 200 || checkWord(word) === false || userWords.includes(word)) {
                // do nothing
                res.status(204).send()
            }
            else {
                score++;
                userWords.push(word);
                status = "Nice!";
                ticktock = 0;
                nextMove();
            }
        })
    }
    
})

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

function checkWord(word) {
    return word.includes(letters);
}