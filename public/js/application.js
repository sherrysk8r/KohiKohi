//Global Variables
question = "";
themeItems = [];
displayText = "";
question_form =[]; //Stores the different question forms 
nums = []; //Array stores all the numbers generated in the question 
userInput = null;
count=10; // 10 seconds on the clock/timer 
selected_theme_items = [];
upper_range = 9;
strikes = 0;
score = 0;
counter = "";

$(document).ready(function() {
    //Load question into question space as soon as the document is ready
    //For the Problem.html page only!
    $("#playAgain").click(startNewGame());
    if (window.location.pathname == '/problem.html') {
        generateQuestion();
        // Listeners
        $( "#text_question" ).click(displayTextQuestion);
        $( "#icon_view ").click(displayIconView);
        $( "#equation" ).click(displayEquation);
        $( ".calc-input ").click(function(){
            userCalcInput($(this).text());        
        });
        $( ".calc-submit" ).click(checkAnswer);
    }
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

// roll the timer after question is initially generated and displayede 
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
    $('#timer_countdown').text(count + " seconds");
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
        displayText = "<p>" + userInput + "<\/p>";
    }
    else{
        displayText = "<p> <\/p>";
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
    $.getJSON("themes/animals.json", function(responseObject, diditwork) {
            // console.log(diditwork);
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
    count = 10; //reset count
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
    //Parse through the question and fill in the blanks with randomized numbers and themes
    // Keep track of the index of all the #s in the blank questions
    var indices = [];
    if(contains(filled_in_question, "#")){
        for(var i=0; i<filled_in_question.length;i++) {
            if (filled_in_question[i] === "#") indices.push(i);
        }
        //  Loop through the # indices and fill in/replace them 
        for (index of indices){
            randomNum = Math.floor((Math.random() * upper_range) +1);
            nums.push(randomNum);
            filled_in_question = replaceAt(filled_in_question, index, randomNum);
        }
    }

    while (contains(filled_in_question, "TOREPLACE")){
        var phrase = filled_in_question.match(/TOREPLACE\d/i)[0];
        var animalIndex = phrase.substr(phrase.length - 1) - 1;
        filled_in_question = replaceAll(filled_in_question, phrase, theme_filler[animalIndex].pluralize);
    }
    
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
    extra_space = ""
    if (character.length > 1){
        extra_space = " ".repeat(character.length-1);
    }
    return string.substr(0, index) + character + extra_space + string.substr(index + character.length);
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
function computerAnswer(question){
    var current_total = 0; 
    //depending on the operations, do the following:
    if(question.operation === "+"){
        // console.log("Addition!");
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
    correctAnswer = computerAnswer(question);
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
    clearInterval(counter);
    $('#finalScore').html(score);
    $('#endGame').openModal({
        dismissible: true,
        opacity: 1
    });
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