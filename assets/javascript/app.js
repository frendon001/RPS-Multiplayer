// Initialize Firebase
var config = {
	apiKey: "AIzaSyCB45gHZ3clUbWIruaNt5mrkoA69rVBHKA",
	authDomain: "in-class-assignment.firebaseapp.com",
	databaseURL: "https://in-class-assignment.firebaseio.com",
	projectId: "in-class-assignment",
	storageBucket: "in-class-assignment.appspot.com",
	messagingSenderId: "312806900640"
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();