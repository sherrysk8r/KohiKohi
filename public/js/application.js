//Global Variables
question = "";
animals = [];
displayText = "";
question_form =[]; //Stores the different question forms 
nums = []; //Array stores all the numbers generated in the question 
userInput = null;
count=10; // 10 seconds on the clock/timer 


//Load question into question space as soon as the document is ready
$(document).ready(function() {
    generateQuestion();
    // Listeners
    $( "#text_question" ).click(displayTextQuestion);
    $( "#icon_view ").click(displayIconView);
    $( "#equation" ).click(displayEquation);
    $( ".calc-input ").click(function(){
        userCalcInput($(this).text());        
    });
    $( ".calc-submit" ).click(checkAnswer);
});

// roll the timer after question is initially generated and displayede 
// Adapted from Stack Overflow: 
// http://stackoverflow.com/questions/1191865/code-for-a-simple-javascript-countdown-timer
function manageTime(){
    count=count-1;
    if (count <= 0){
     clearInterval(counter);
     //counter ended, do something here
     window.alert("Time is up!");
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
    displayText = "<div class='col s4'></div><div class='col s4'></div>";
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
    question_form = [];
    $.getJSON("themes/animals.json", function(responseObject, diditwork) {
            // console.log(diditwork);
            nums = [];
            //Randomly select a question from the repository
            var randomizedQuestionIndex = Math.floor(Math.random() * responseObject.questions.length);
            question = responseObject.questions[randomizedQuestionIndex];
            //retrieve the animals array
            animals = responseObject.animals;
            //Fill in & update the question
            question_completed = fillInQuestionTemplate(question);
            //Store the question forms (word problem, equation)
            question_form.push(question_completed);
            var equation_form = generateEquation(question);
            question_form.push(equation_form);
            // //Calculate the answer
            // answer = computerAnswer(question);
            // //Dsiplay the question in the box 
            // console.log("Question: " + question_completed);
            // console.log("Answer: " + answer);
            displayText = "<p class='center-align'>" + question_completed + "<\/p>";
            $("#question-box").html(displayText);
    } ); // getJSON
    //Start the Timer
    $('#timer_countdown').text("10 seconds");
    count = 10; //reset count
    counter=setInterval(manageTime, 1000); //Run the timer function/update the display every second
}



//Return the qurstion in equation form
function generateEquation(question){
    var equation = "";
    equation += question.starting_num + " "; //Start Number
    //Append the operation to the equation 
    equation += question.operation + " ";
    //Append the number on which the operation will be applied on (base case, to expand on later)
    equation += nums[0] + " ";
    //Finish off the equation
    equation += "= ?";
    return equation;
}

//Fills in a question template 
function fillInQuestionTemplate(question){
    var filled_in_question = question.question;
    var animal_filler = returnAnimalsNeeded(question.num_animals_needed, animals);
    //Parse through the question and fill in the blanks with randomized numbers and animals
    if(contains(filled_in_question, "#")){
        var num_animal_1 = Math.floor((Math.random() * 10) +1);
        nums.push(num_animal_1);
        filled_in_question = replaceAll(filled_in_question, "#", num_animal_1);
    }
    if(contains(filled_in_question,"ANIMAL1")){
        if (num_animal_1 == 1){
            filled_in_question = replaceAll(filled_in_question, "ANIMAL1", animal_filler[0].animal_name);
        } 
        else{
            filled_in_question = replaceAll(filled_in_question, "ANIMAL1", animal_filler[0].pluralize);
        }
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

//Returns an array of random animals to fill in the questions 
function returnAnimalsNeeded(num_of_animals_needed, animals){
    var animals_for_question = [];
    for (i = 0; i < num_of_animals_needed; i++) { 
        var randomizedAnimalIndex = Math.floor(Math.random() * animals.length);
        var animal = animals[randomizedAnimalIndex];
        animals_for_question.push(animal);
    }
    return animals_for_question;
}

//Returns the expected answer for a generated question
function computerAnswer(question){
    var current_total = 0; 
    //depending on the operations, do the following:
    if(question.operation === "+"){
        // console.log("Addition!");
        current_total = addToStart(question.starting_num, nums);
    }
    return current_total;
}

//Applies addition to the starting number and an array of numbers
function addToStart(start, num_array){
    var total = start;
    for (var i = num_array.length - 1; i >= 0; i--) {
        total += num_array[i];
    };
    return total;
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

function checkAnswer(){
    correctAnswer = computerAnswer(question);
    console.log(correctAnswer);
    console.log(userInput);
    console.log(correctAnswer == userInput);
    if (correctAnswer == userInput){
        window.alert("Correct!");
    }
    else{
        window.alert("Not quite. The correct answer is " + correctAnswer);
    }
    // Since answer is submitted, we can kill the timer and generate a new question
    clearInterval(counter);
    generateQuestion();
    //  Clear the user input area 
    userInput = null;
    displayUserInput(userInput);
}