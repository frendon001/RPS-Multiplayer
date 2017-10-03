// Initialize Firebase
var config = {
	apiKey: "AIzaSyCcCgV4yl0BDtUjSJCbXVqUh-zv_qkTGO4",
	authDomain: "rps-multiplayer-a2633.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-a2633.firebaseio.com",
	projectId: "rps-multiplayer-a2633",
	storageBucket: "rps-multiplayer-a2633.appspot.com",
	messagingSenderId: "1073394374463"
};
firebase.initializeApp(config);




// Initial Values
var totalPlayersNum = 0;
var playerNumber = 0;
var lastPlayerAddedKey = "";
var rpsPlayer = {
	name: "",
	losses: 0,
	wins: 0,
	choice: ""

};
var gameReady = false;

// Create a variable to reference the database.
var database = firebase.database();

// All of our connections will be stored in this directory.
var totalPlayersRef = database.ref("/players");
var playerTurn = database.ref("/turn");
var player1 = database.ref("/players/1");
var player2 = database.ref("/players/2");

// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");



totalPlayersRef.on('value', function(snapshot) {

	totalPlayersNum = snapshot.numChildren();

	console.log("total players: " + totalPlayersNum);
	//Check if game is full
	if (snapshot.child('1').exists() && snapshot.child('2').exists() && playerNumber === 0) {
		$(".instructions-text").text("The game is full.");
		$(".introductions input").addClass("d-none");
		$(".introductions button").addClass("d-none");
		//otherwise players still needto be added
	} else {
		//assign player values to player's page and set default values
		console.log("CHILD1: " + snapshot.child('1').exists() + " CHILD2: " + snapshot.child('2').exists());
		if (!snapshot.child('1').exists() && rpsPlayer.name === "") {
			playerNumber = 1;
			$("#player-1-name").text("Waiting for Player 1");
			$("#player-1-wins").text(0);
			$("#player-1-losses").text(0);
		} else if (!snapshot.child('2').exists() && rpsPlayer.name === "") {
			playerNumber = 2;
			$("#player-2-name").text("Waiting for Player 2");
			$("#player-2-wins").text(0);
			$("#player-2-losses").text(0);
		}

	}

	//if players 1 and 2 are  in the session check for changes and display on web page
	if (snapshot.child('1').exists() && snapshot.child('2').exists() && playerNumber != 0) {
		//store player objects in variables
		var updatedPlayer1 = snapshot.child(1).val();
		var updatedPlayer2 = snapshot.child(2).val();

		//set display for player 1
		$("#player-1-name").text(updatedPlayer1.name);
		$("#player-1-wins").text(updatedPlayer1.wins);
		$("#player-1-losses").text(updatedPlayer1.losses);
		$("#player-1-selection").text(updatedPlayer1.choice);
		//set display for player 1
		$("#player-2-name").text(updatedPlayer2.name);
		$("#player-2-wins").text(updatedPlayer2.wins);
		$("#player-2-losses").text(updatedPlayer2.losses);
		$("#player-2-selection").text(updatedPlayer2.choice);




	}




});



// player1.on("value", function(snapshot) {
// 	if (snapshot.exists()) {
// 		console.log(snapshot.val());
// 		if (snapshot.val().name) {
// 			$("#player-1-name").text(snapshot.val().name);
// 			$("#player-1-wins").text(snapshot.val().wins);
// 			$("#player-1-losses").text(snapshot.val().losses);
// 		} else {
// 			$("#player-1-name").text("Waiting for Player 1");
// 			$("#player-1-wins").text(0);
// 			$("#player-1-losses").text(0);
// 		}
// 	} else {

// 		$("#player-1-name").text("Waiting for Player 1");
// 		$("#player-1-wins").text(0);
// 		$("#player-1-losses").text(0);
// 		if (playerNumber === 1) {
// 			$(".introductions").removeClass("d-none");
// 			$(".active-game").addClass("d-none");
// 		}
// 	}

// });

// player2.on("value", function(snapshot) {
// 	if (snapshot.exists()) {
// 		console.log(snapshot.val());
// 		if (snapshot.val().name) {
// 			$("#player-2-name").text(snapshot.val().name);
// 			$("#player-2-wins").text(snapshot.val().wins);
// 			$("#player-2-losses").text(snapshot.val().losses);

// 		} else {
// 			$("#player-2-name").text("Waiting for Player 2");
// 			$("#player-2-wins").text(0);
// 			$("#player-2-losses").text(0);
// 		}
// 	} else {

// 		$("#player-2-name").text("Waiting for Player 2");
// 		$("#player-2-wins").text(0);
// 		$("#player-2-losses").text(0);
// 		if (playerNumber === 2) {
// 			$(".introductions").removeClass("d-none");
// 			$(".active-game").addClass("d-none");
// 		}
// 	}

// });

playerTurn.on("value", function(snapshot) {
	//Check if player turn has a value
	if (snapshot.exists()) {
		//If odd turn value then player 1 gets to choose
		if (snapshot.val() % 2) {
			//find winner of the match
			rpsWinner();


			//prompt for next game
			if (playerNumber == 1) {
				$("#display-text").text("It's your turn!");
				$("#player-1-options").removeClass("d-none");
				$("#player-1-selection").addClass("d-none");
			}
			if (playerNumber == 2) {
				$("#display-text").text("Waiting for player 1 to choose.");
				$("#player-2-options").addClass("d-none");
				$("#player-2-selection").removeClass("d-none");

			}
			//Otherwise player 2 gets to choose
		} else {
			if (playerNumber == 1) {
				$("#display-text").text("Waiting for player 2 to choose.");
				$("#player-1-options").addClass("d-none");
				$("#player-1-selection").removeClass("d-none");
			}
			if (playerNumber == 2) {
				$("#display-text").text("It's your turn!");
				$("#player-2-options").removeClass("d-none");
				$("#player-2-selection").addClass("d-none");
			}
		}
	}

});





//When the client's connection state changes...
connectedRef.on("value", function(snapshot) {

	// If they are connected..
	if (snapshot.val()) {

		var players = firebase.database().ref("/players");
		// Remove user from the connection list when they disconnect.

		var num = playerNumber + "";

		players.child('1').onDisconnect().remove();
		players.child('2').onDisconnect().remove();
		database.ref("/turn").onDisconnect().remove();
	}
});

function rpsWinner() {
	totalPlayersRef.once("value", function(snapshot) {
		//populate variables with info from database
		var player1Choice = snapshot.child('1').child('choice').val();
		var player2Choice = snapshot.child('2').child('choice').val();
		var player1Name = snapshot.child('1').child('name').val();
		var player2Name = snapshot.child('2').child('name').val();
		console.log("p1Choice: " + player1Choice + " p2Choice: " +
			player2Choice + " p1Name: " + player1Name + " p2Name: " + player2Name);

		//check choices have been selected
		if (player1Choice != "" && player2Choice != "") {
			//Check for a tie
			if (player1Choice === player2Choice) {
				$("#result").text("It's a tie!");
			}

			//Conditions for Player 1 to win
			if (player1Choice === "Rock" && player2Choice === 'Scissors' ||
				player1Choice === "Paper" && player2Choice === 'Rock' ||
				player1Choice === "Scissors" && player2Choice === 'Paper') {
				//Player 1 wins
				$("#result").text(player1Name + " is the Winner!");
				database.ref("/players/1/wins").set(snapshot.child('1').child('wins').val() +1);
				database.ref("/players/2/losses").set(snapshot.child('2').child('losses').val() +1);
			}

			if (player1Choice === "Rock" && player2Choice === 'Paper' ||
				player1Choice === "Paper" && player2Choice === 'Scissors' ||
				player1Choice === "Scissors" && player2Choice === 'Rock') {
				//Player 2 wins
				$("#result").text(player2Name + " is the Winner!");
				database.ref("/players/2/wins").set(snapshot.child('2').child('wins').val() +1);
				database.ref("/players/1/losses").set(snapshot.child('1').child('losses').val() +1);
			}
		}

	});
};


function assignPlayer(num, name) {
	//changes to html based on which player entered their name
	$(".introductions").addClass("d-none");
	$("#player-name").text(name);
	$("#player-num").text(num);
	$(".active-game").removeClass("d-none");
	$("#player-" + num).addClass("current-player");
	$("#player-" + num + "-name").text(name);

};


function setChoice(player, choice) {
	//set choice to required player in database
	if (player === 1) {
		player1.child("choice").set(choice);
	}
	if (player === 2) {
		player2.child("choice").set(choice);
	}
}





$("#start-game").on("click", function(event) {
	//get input value for player name
	rpsPlayer.name = $("#name").val().trim();
	//makes sure name is not empty
	if (rpsPlayer.name) {
		//set player information to database
		totalPlayersRef.once("value")
			.then(function(snapshot) {
				//add to player 1 or player 2 as necessary
				if (snapshot.child('1').exists() && !snapshot.child('2').exists()) {
					player2.set(rpsPlayer);
					assignPlayer(2, rpsPlayer.name);
					//once  the second player is added set turn value to 1
					playerTurn.set(1);
				}
				if (!snapshot.child('1').exists()) {
					player1.set(rpsPlayer);
					assignPlayer(1, rpsPlayer.name);
				}

			});
	}
});


$(".choice").on("click", function() {
	//set choice
	setChoice(playerNumber, $(this).text());

	//find current Turn value and increment by 1
	playerTurn.once("value", function(snapshot) {
		if (snapshot.exists()) {
			playerTurn.set(snapshot.val() + 1);
		}
	});


});