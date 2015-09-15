//Global Variables
theme = "";
subject = "";
question = "";
themeItems = [];
displayText = "";
question_form =[]; //Stores the different question forms 
nums = []; //Array stores all the numbers generated in the question 
userInput = null;
count=15; // 10 seconds on the clock/timer 
selected_theme_items = [];
upper_range = 10;
strikes = 0;
score = 0;
counter = "";

$(document).ready(function() {
    //Load question into question space as soon as the document is ready
    //For the Problem.html page only!
    $('#go_button').click(function() {
        // get all the inputs into an array.
        var inputs = $('#main-form :selected');
        console.log(inputs[0]);
        sessionStorage.setItem("theme", inputs[0].value);
        sessionStorage.setItem("subject", inputs[1].value);
        window.location = "/problem.html";
    });
    theme = sessionStorage.getItem("theme");
    subject = sessionStorage.getItem("subject");

    $(".calc-submit").css('background-color', "#9e9e9e");

    if (window.location.pathname == '/problem.html') {
        startNewGame();
        // Listeners
        $( "#text_question" ).click(displayTextQuestion);
        $( "#icon_view ").click(displayIconView);
        $( "#equation" ).click(displayEquation);
        $( ".calc-input ").click(function(){
            userCalcInput($(this).text());        
        });
        $( ".calc-submit" ).click(checkAnswer);
        $("#leaderboard").click(displayLeaderboard(false));
    }

    // Modal triggers on the problem.html page 
    $('.badge-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
    $('.leader-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
});

// Populate the Leaderboard Modal
function displayLeaderboard(isGameOver, final_score){
    // read from the leaderboard.json file (where leaderboard data is stored)
    $.getJSON("leaderboard.json", function(responseObject, diditwork) {
        var leaderboard = responseObject.leaders;
        // Add the user's current score here
        if(isGameOver===true){
            leaderboard.push({"user":"You", "points_collected":final_score});
        }
        console.log(leaderboard);
        // Sort the leaderboard, scores DESC, adapted from Stack Overflow
        // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
        leaderboard.sort(function(a, b) {
            return parseFloat(b.points_collected) - parseFloat(a.points_collected);
        });
        // Populate the table using the sorted leaderboard data 
        var displayTable = "<table class='striped'><th>KohiKohi Rock Stars<\/th><th>High Score<\/th><\/tr>";
        for (var i = 0; i<leaderboard.length; i++) {
            // create a new row in the table
            displayTable += "<tr>";
            var leader = leaderboard[i];
            displayTable += "<td>" + leader.user + "<\/td>";
            displayTable += "<td>" + leader.points_collected + "<\/td>";
            displayTable += "<\/tr>";
                }
        displayTable += "<\/table>";
        $(".leaderboard_table").html(displayTable);
    } ); // getJSON
}


// roll the timer after question is initially generated and displayed
// Adapted from Stack Overflow: 
// http://stackoverflow.com/questions/1191865/code-for-a-simple-javascript-countdown-timer
function manageTime(){
    count=count-1;
    if (count <= 0){
     clearInterval(counter);
     //counter ended, do something here
     Materialize.toast('Time is up!', 1000);
     addStrike();
     generateQuestion();
     return;
    }
    //Display the number of seconds
    if (count == 1){
        $('#timer_countdown').text(count + " second");
    }else{
        $('#timer_countdown').text(count + " seconds");
    }
}


function displayTextQuestion(){
    displayText = "<p class='center-align'>" + question_form[0] + "<\/p>";
    $("#question-box").html(displayText);
}

function displayEquation(){
    displayText = "<p class='equation-form center-align'>" + question_form[1] + "<\/p>";
    $("#question-box").html(displayText);
}

function displayIconView(){
    var display = [];
    for (var i = 0; i < nums.length; i++){
        var imageLink = "";
        if (selected_theme_items.length < nums.length){
            imageLink = selected_theme_items[0].image;
        }else{
            imageLink = selected_theme_items[i].image;
        }
        d = "<img class= 'responsive-img' src=" + imageLink + "></img>";
        d = d.repeat(nums[i]);
        display.push(d);
    }

    // hard-coded. Not great.
    displayText = "<div class='responsive-img col s5 center-align'>" + display[0] + "</div><div class='col s1 center-align valign-wrapper'><p class='valign'>" + question.operation + "</p></div><div class='responsive-img col s5 center-align'>" + display[1] + "</div>";
    $("#question-box").html(displayText);
}

function displayUserInput(userInput){
    if (!isNaN(userInput) & userInput != null){
        $(".calc-submit").css('background-color', "#b2ff59");
        displayText = "<p>" + userInput + "<\/p>";
    }
    else{
        $(".calc-submit").css('background-color', "#9e9e9e");
        displayText = "<p><\/p>";
    }
    $(".calcInput").html(displayText);
}

function generateQuestion(){
    clearInterval(counter);
    if (isGameOver()){
        gameOver();
        return;
    }
    question_form = [];
    nums = [];
    var fileName = "themes/" + theme + ".json";
    $.getJSON(fileName, function(responseObject, diditwork) {
            //Randomly select a question from the repository
            var randomizedQuestionIndex = Math.floor(Math.random() * responseObject.questions.length);
            question = responseObject.questions[randomizedQuestionIndex];
            //retrieve the theme items array
            themeItems = responseObject.items;
            //Fill in & update the question
            question_completed = fillInQuestionTemplate(question);
            //Store the question forms (word problem, equation)
            question_form.push(question_completed);
            var equation_form = generateEquation(question);
            question_form.push(equation_form);
            selectRandomDisplay();
    } ); // getJSON
    //Start the Timer
    count = 15; //reset count
    if (count == 1){
        $('#timer_countdown').text(count + " second");
    }else{
        $('#timer_countdown').text(count + " seconds");
    }
    counter = setInterval(manageTime, 1000); //Run the timer function/update the display every second
}



//Return the qurstion in equation form
function generateEquation(question){
    var equation = "";
    for (var i = 0; i < nums.length-1; i++){
        equation += nums[i] + " " + question.operation + " " ;
    }
    equation += nums[nums.length-1] + " = ?";
    return equation;
}

//Fills in a question template 
function fillInQuestionTemplate(question){
    var filled_in_question = question.question;
    var theme_filler = returnThemeItems(question.num_needed, themeItems);
    console.log(theme_filler);

    nums = [];
    while(contains(filled_in_question, "# TOREPLACE")){
        var index = filled_in_question.search(/# TOREPLACE\d/);
        console.log(index);
        var phraseToSub = filled_in_question.match(/# TOREPLACE\d/);
        console.log(phraseToSub);
        phraseToSub = phraseToSub.toString();
        var themeIndex = phraseToSub.substr(phraseToSub.length-1) -1;
        console.log(theme_filler[themeIndex]);

        var randomNum = Math.ceil(Math.random() * upper_range);
        var result;
        nums.push(randomNum);

        if (randomNum == 1){
            result = randomNum + " " + theme_filler[themeIndex].name;
        }else{
            result = randomNum + " " + theme_filler[themeIndex].pluralize;
        }

        filled_in_question = filled_in_question.substr(0, index) + result + filled_in_question.substr(index+phraseToSub.length);

        if (contains(filled_in_question, "#") && question.operation == "-"){
            upper_range = randomNum;
        }
    }

    //Parse through the question and fill in the blanks with randomized numbers and themes
    // Keep track of the index of all the #s in the blank questions
    
    // nums = [];
    // while(contains(filled_in_question, "#")){
    //     var index = filled_in_question.search(/# TOREPLACE\d/gi);
    //     // var phraseToSub = filled_in_question.match(/TOREPLACE\d/i);
    //     // phraseToSub = phraseToSub[0];

    //     // var themeIndex = phraseToSub.substr(index.length-1) -1;
    //     // console.log(themeIndex);

    //     // var selectedTheme = theme_filler[themeIndex];
    //     // console.log(selectedTheme);
    //     // var phraseResult = "";
        
    //     var randomNum = Math.ceil((Math.random() * upper_range));
    //     nums.push(randomNum);
    //     filled_in_question = replaceAt(filled_in_question, index, randomNum);
    //     // if (randomNum == 1){
    //     //     phraseResult = randomNum + " " + selectedTheme.name;
    //     // }else{
    //     //     phraseResult = randomNum + " " + selectedTheme.pluralize;
    //     // }

    //     // filled_in_question = filled_in_question.substr(0, phraseIndex) + phraseResult + filled_in_question.substr(phraseIndex+10,filled_in_question.length);
        
        
    // }
    upper_range = 10;

    // // var phraseIndex = filled_in_question.search(/TOREPLACE\d/i);
    // // var phrase = filled_in_question.match(/TOREPLACE\d/i)[0];
    // // var themeIndex = phrase.substr(phrase.length - 1) - 1;

    // // if (nums[0] == 1){
    // //     filled_in_question = filled_in_question.substr(0, phraseIndex) + theme_filler[themeIndex].name + filled_in_question.substr(phraseIndex+10,filled_in_question.length);
    // // }
    // // else{
    // //     filled_in_question = filled_in_question.substr(0, phraseIndex) + theme_filler[themeIndex].pluralize + filled_in_question.substr(phraseIndex+10,filled_in_question.length);
    // // }

    // // var phraseIndex = filled_in_question.search(/TOREPLACE\d/i);
    // // var phrase = filled_in_question.match(/TOREPLACE\d/i)[0];
    // // var themeIndex = phrase.substr(phrase.length - 1) - 1;

    // // console.log(phrase);
    // // console.log(phraseIndex);
    // // if (nums[1] == 1){
    // //     filled_in_question = filled_in_question.substr(0, phraseIndex) + theme_filler[themeIndex].name + filled_in_question.substr(phraseIndex+10,filled_in_question.length);
    // //     console.log(filled_in_question);
    // // }
    // // else{
    // //     filled_in_question = filled_in_question.substr(0, phraseIndex) + theme_filler[themeIndex].pluralize + filled_in_question.substr(phraseIndex+10,filled_in_question.length);
    // //     console.log(filled_in_question);
    // // }

    
    
    // while(contains(filled_in_question, "TOREPLACE")){
    //     var phrase = filled_in_question.match(/TOREPLACE\d/i)[0];
    //     var themeIndex = phrase.substr(phrase.length - 1) - 1;
    //     filled_in_question = replaceAll(filled_in_question, phrase, theme_filler[themeIndex].pluralize);
    // }

    return filled_in_question;
}

//Check if a string contains a fragment 
function contains(string, fragment){
    return string.indexOf(fragment) >= 0;
}

//Replace all method - adapted from Stackoverflow
//Source - http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

//escapeRegExp helper method - adapted from Stackoverflow
//Source - http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAt(string, index, character) {
    character += ""
    return string.substr(0, index) + character + string.substr(index + 1);
}

String.prototype.repeat = function(times) {
   return (new Array(times + 1)).join(this);
};

//Returns an array of random theme items to fill in the questions 
function returnThemeItems(num_needed, themeItems){
    selected_theme_items = [];
    for (i = 0; i < num_needed; i++) { 
        var randomizedIndex = Math.floor(Math.random() * themeItems.length);
        var themeItem = themeItems[randomizedIndex];
        selected_theme_items.push(themeItem);
    }
    return selected_theme_items;
}

//Returns the expected answer for a generated question
function computeAnswer(question){
    //depending on the operations, do the following:
    current_total = 0;
    switch (question.operation){
        case "+":
            current_total = nums.reduce(function(pv, cv) { return pv + cv; }, 0);
            break;
        case "-":
            current_total = nums[0] - nums[1];
            break;
        default:
            current_total = nums.reduce(function(pv, cv) { return pv + cv; }, 0);
    }
    return current_total;
}

function userCalcInput(inputValue){
    if (userInput == null){
        if (inputValue != "keyboard_backspace" ){
            userInput = inputValue;
            displayUserInput(userInput);
        }
    }
    else if (inputValue == "keyboard_backspace"){
        var sUserInput = userInput.toString();
        sUserInput = sUserInput.slice(0,-1);
        if (sUserInput.length == 0){
            userInput = null;
        }
        else{
            userInput = parseInt(sUserInput);
        }
        displayUserInput(userInput);
    }
    else{
        var sUserInput = userInput.toString();
        sUserInput += inputValue;
        userInput = parseInt(sUserInput);
        displayUserInput(userInput);
    }
}
function imageToast(imageUrl) {
        Materialize.toast('<img src="' + imageUrl + '" />', 800, 'custom-toast');
}

function checkAnswer(){
    if (userInput == null || userInput.length == 0){
        Materialize.toast('Remember to type in an answer!', 2000);
    }
    else{
        correctAnswer = computeAnswer(question);
        if (correctAnswer == userInput){
            imageToast('images/GoodJob350.png');
            score += 100;
        }
        else{
            Materialize.toast('Not quite. The correct answer is ' + correctAnswer + '.', 2000);
            addStrike();
        }
        // Since answer is submitted, we can kill the timer and generate a new question
        generateQuestion();
        // reset calculator
        userInput = null;
        displayUserInput(userInput);
    }    
}

function addStrike(){
    strikes += 1;
    $("#strikes").children().first().remove();
    currentContent = $("#strikes").html();
    currentContent += "<img src='images/redfish.png'></img>";
    $("#strikes").html(currentContent);
}

function isGameOver(){
    return ((strikes == 5) ? true : false);
}

function gameOver(){
    $('#finalScore').html(score);
    displayLeaderboard(true, score);
    $('#endGame').openModal({
        dismissible: false,
        opacity: .5
    });
    $("#playAgain").click(startNewGame);
}

function startNewGame(){
    strikes = 0;
    score = 0;
    generateQuestion();
}

function selectRandomDisplay(){
    var randomNum = Math.ceil(Math.random() * 3);
    switch (randomNum) { 
    case 1: 
        displayTextQuestion();
        break;
    case 2: 
        displayEquation();
        break;
    case 3: 
        displayIconView();
        break;
    default:
        displayTextQuestion();
    }
}
