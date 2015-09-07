$(function() {    // do once original document loaded and ready
        $('#animal_theme').click(function() {
                $.getJSON("themes/animals.json", function(responseObject, diditwork) {
                        console.log(diditwork);
                        var displayText = 
                                "<b>Animals in the Repo</b><table><tr>";
                        for (var i = 0; i<responseObject.animals.length; i++) {
                                var animal = responseObject.animals[i];
                                displayText += "<td>" + animal.animal_name + "<\/td>";
                                }
                        displayText += "<\/tr><\/table>";
                $("#response-area").html(displayText);
                } );  // getJSON
        } );  // click
  } ); // onReady