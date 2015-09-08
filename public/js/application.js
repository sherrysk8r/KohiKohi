//Global Variables
question = "";
animals = [];
displayText = "";
//Aray stores all the numbers generated in the question 
nums = [];

$(function() {    // do once original document loaded and ready
    $('#animal_theme').click(function() {
        $.getJSON("themes/animals.json", function(responseObject, diditwork) {
            // console.log(diditwork);
            nums = [];
            displayText = "<p><b>Generated Question</b></p><p>";
            //Randomly select a question from the repository
            var randomizedQuestionIndex = Math.floor(Math.random() * responseObject.questions.length);
            question = responseObject.questions[randomizedQuestionIndex];
            //retrieve the animals array
            animals = responseObject.animals;
            //Fill in & update the question
            question_completed = fillInQuestionTemplate(question);
            //Display the question
            console.log("Question: " + question_completed);
            //Calculate the answer
            answer = computerAnswer(question);
            console.log("Answer: " + answer);
            displayText += question_completed + "<\/p>";
            // $("#question-area").html(displayText);
        } ); // getJSON
    } );  // click
  } ); // onReady


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
        filled_in_question = replaceAll(filled_in_question, "ANIMAL1", animal_filler[0].pluralize);
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
        console.log("Addition!");
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


