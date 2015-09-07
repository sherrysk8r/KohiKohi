//Global Variables
question = "";
animals = [];
displayText = "";

$(function() {    // do once original document loaded and ready
    $('#animal_theme').click(function() {
        $.getJSON("themes/animals.json", function(responseObject, diditwork) {
            // console.log(diditwork);
            displayText = "<p><b>Generated Question</b></p><p>";
            //Randomly select a question from the repository
            var randomizedQuestionIndex = Math.floor(Math.random() * responseObject.questions.length);
            question = responseObject.questions[randomizedQuestionIndex];
            //retrieve the animals array
            animals = responseObject.animals;
            //Fill in & update the question
            question_completed = fillInQuestionTemplate(question);
            //Display the question
            console.log(question_completed);
            displayText += question_completed + "<\/p>";
            $("#question-area").html(displayText);
        } ); // getJSON
    } );  // click
  } ); // onReady


//Fills in a question template 
function fillInQuestionTemplate(question){
    var filled_in_question = question.question;
    var animal_filler = returnAnimalsNeeded(question.num_animals_needed, animals);
    var total = 0; 
    //Parse through the question and fill in the blanks with randomized numbers and animals
    if(contains(filled_in_question, "#")){
        var num_animal_1 = Math.floor((Math.random() * 10) +1);
        filled_in_question = replaceAll(filled_in_question, "#", num_animal_1);
    }
    if(contains(filled_in_question,"ANIMAL1")){
        filled_in_question = replaceAll(filled_in_question, "ANIMAL1", animal_filler[0].pluralize);
    }
    // if(contains(filled_in_question, "")){

    // }
    return filled_in_question;
}

function contains(string, fragment){
    return string.indexOf(fragment) >= 0;
}

//Replace all method - adapted from Stackoverflow
//Source - http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// escapeRegExp method - adapted from Stackoverflow
//Source - http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function returnAnimalsNeeded(num_of_animals_needed, animals){
    // return "Hippie HORRAY!";
    var animals_for_question = [];
    for (i = 0; i < num_of_animals_needed; i++) { 
        var randomizedAnimalIndex = Math.floor(Math.random() * animals.length);
        var animal = animals[randomizedAnimalIndex];
        animals_for_question.push(animal);
    }
    return animals_for_question;
}

