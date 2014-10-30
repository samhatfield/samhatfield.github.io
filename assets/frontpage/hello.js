var greetings = [
		["नमस्ते, दुनिया!", "Hindi"],
		//"こんにちは世界",
		//"Përshëndetje, bota!",
		//"Zdravo, svijete!",
		["Hej, verden!", "Dutch"],
		//"Hei, maailma!",
		["Olá, mundo!", "Portuguese"],
		//"Hallo, verden!",
		["Ciao, mondo!", "Italian"],
		//"Bonjour, monde!",
		["Ahoj, světe!", "Czech"],
		["Hallo, Welt!", "German"],
		["Kaabo, aye!", "Yoruba"],
		["สวัสดีชาวโลก", "Thai"],
		["ສະບາຍດີ, ໂລກ!", "Lao"],
		["हॅलो, जग!", "Marathi"],
		["Helló, világ!", "Hungarian"],
		["مرحبا، العالم!", "Arabic"]
];

$(document).ready(function() {
	var rand = Math.floor(greetings.length * Math.random());
	var description = "That's &quot;Hello, world!&quot; in " + greetings[rand][1] + ".";
	$("#description").html(description + " ");
	$("#hello").html("<h1>"+greetings[rand][0]+"</h1>")
});


