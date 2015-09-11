//Global Variables
question = "";
animals = [];
displayText = "";
//Stores the different question forms 
question_form =[]; 
//Array stores all the numbers generated in the question 
nums = [];
userInput = null;
animals_for_question = [];
upper_range = 10;

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
        if (animals_for_question.length < nums.length){
            imageLink = animals_for_question[0].image;
        }else{
            imageLink = animals_for_question[i].image;
        }
        d = "<img class= 'responsive-img' src=" + imageLink + "></img>";
        d = d.repeat(nums[i]);
        display.push(d);
    }

    displayText = "<div class='responsive-img col s4 offset-s1 center-align'>" + display[0] + "</div><div class='col s1 center-align valign-wrapper'><p class='valign'>" + question.operation + "</p></div><div class='responsive-img col s4 center-align'>" + display[1] + "</div>";
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
    question_form = [];
    nums = [];
    $.getJSON("themes/animals.json", function(responseObject, diditwork) {
            // console.log(diditwork);
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
        var indices = [];
        for(var i=0; i<filled_in_question.length;i++) {
            if (filled_in_question[i] === "#") indices.push(i);
        }
        
        for (index of indices){
            randomNum = Math.floor((Math.random() * upper_range) +1);
            nums.push(randomNum);
            filled_in_question = replaceAt(filled_in_question, index, randomNum);
        }
    }

    while (contains(filled_in_question, "TOREPLACE")){
        phrase = filled_in_question.match(/TOREPLACE\d/i)[0];
        index = phrase.substring(phrase.length - 1) - 1;
        filled_in_question = replaceAll(filled_in_question, phrase, animal_filler[index].animal_name);
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
    return string.substr(0, index) + character + string.substr(index + 1);
}

String.prototype.repeat = function(times) {
   return (new Array(times + 1)).join(this);
};

//Returns an array of random animals to fill in the questions 
function returnAnimalsNeeded(num_of_animals_needed, animals){
    animals_for_question = [];
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

function checkAnswer(){
    correctAnswer = computerAnswer(question);
    if (correctAnswer == userInput){
        window.alert("Correct!");
    }
    else{
        window.alert("Not quite. The correct answer is " + correctAnswer);
    }
    generateQuestion();
    // reset calculator
    userInput = null;
    displayUserInput(userInput);
}
