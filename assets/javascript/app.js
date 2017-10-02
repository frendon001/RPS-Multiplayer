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
var startGame = false;

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
	if (snapshot.child('1').exists() && snapshot.child('2').exists() && playerNumber === 0) {
		$(".instructions-text").text("The game is full.");
		$(".introductions input").addClass("d-none");
		$(".introductions button").addClass("d-none");
		startGame = true;

	} else {
		console.log("CHILD1: " + snapshot.child('1').exists() + "CHILD2: " + snapshot.child('2').exists());
		if (!snapshot.child('1').exists() && rpsPlayer.name === "") {
			playerNumber = 1;
			console.log
		}else if (!snapshot.child('2').exists()  && rpsPlayer.name === "") {
			playerNumber = 2;
		}

	}
});



player1.on("value", function(snapshot) {
	if (snapshot.exists()) {
		console.log(snapshot.val());
		if (snapshot.val().name) {
			$("#player-1-name").text(snapshot.val().name);
			$("#player-1-wins").text(snapshot.val().wins);
			$("#player-1-losses").text(snapshot.val().losses);
		} else {
			$("#player-1-name").text("Waiting for Player 1");
			$("#player-1-wins").text(0);
			$("#player-1-losses").text(0);
		}
	} else {
		startGame = false;
		$("#player-1-name").text("Waiting for Player 1");
		$("#player-1-wins").text(0);
		$("#player-1-losses").text(0);
		if (playerNumber === 1) {
			$(".introductions").removeClass("d-none");
			$(".active-game").addClass("d-none");
		}
	}

});

player2.on("value", function(snapshot) {
	if (snapshot.exists()) {
		console.log(snapshot.val());
		if (snapshot.val().name) {
			$("#player-2-name").text(snapshot.val().name);
			$("#player-2-wins").text(snapshot.val().wins);
			$("#player-2-losses").text(snapshot.val().losses);

		} else {
			$("#player-2-name").text("Waiting for Player 2");
			$("#player-2-wins").text(0);
			$("#player-2-losses").text(0);
		}
	} else {
		startGame = false;
		$("#player-2-name").text("Waiting for Player 2");
		$("#player-2-wins").text(0);
		$("#player-2-losses").text(0);
		if (playerNumber === 2) {
			$(".introductions").removeClass("d-none");
			$(".active-game").addClass("d-none");
		}
	}

});

playerTurn.on("value", function(snapshot) {
	//Check if player turn has a value
	if (snapshot.exists()) {
		//If odd turn value then player 1 gets to choose
		if (snapshot.val() % 2) {
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
		// // var test = 0;
		// // firebase.database().ref('/players').once('value').then(function(snap,test) {
		// // 	test = snap.numChildren();
		// // 	console.log(test); 
		// // });

		// // console.log(newPlayer);

		// console.log("testing: " + test);
		// Remove user from the connection list when they disconnect.

		console.log(playerNumber);
		players.child(1).onDisconnect().remove();
		players.child(2).onDisconnect().remove();
		database.ref("/turn").onDisconnect().remove();
	}
});



function assignPlayer(num, name) {
	$(".introductions").addClass("d-none");
	$("#player-name").text(name);
	$("#player-num").text(num);
	$(".active-game").removeClass("d-none");
	$("#player-" + num).addClass("current-player");
	$("#player-" + num + "-name").text(name);

	if (num === 1) {
		$("#player-2-options").addClass("d-none");
	}

	if (num === 2) {
		$("#player-1-options").addClass("d-none");
	}
};




$("#start-game").on("click", function(event) {
	rpsPlayer.name = $("#name").val().trim();

	if (rpsPlayer.name) {

		totalPlayersRef.once("value")
			.then(function(snapshot) {
				var playersActive = snapshot.exists();
				var totalPlayers = snapshot.numChildren();

				if (snapshot.child('1').exists() && !snapshot.child('2').exists()) {
					player2.set(rpsPlayer);
					assignPlayer(2, rpsPlayer.name);
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
	console.log("P#:" + playerNumber);
	var choice = $(this).text();
	console.log
	playerTurn.once("value", function(snapshot) {
		if (snapshot.exists()) {

			playerTurn.set(snapshot.val() + 1);
			console.log(snapshot.val());
			console.log(choice);

		}
	});
});