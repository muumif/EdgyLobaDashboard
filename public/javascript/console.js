// eslint-disable-next-line no-undef
const socket = io();

const logs = document.getElementById("logs");
const form = document.getElementById("form");
const input = document.getElementById("input");
const statusDiv = document.getElementById("status");


socket.emit("command", "/getlogs");
socket.emit("command", "/getstatus");


form.addEventListener("submit", function(e) {
	e.preventDefault();
	if (input.value) {
		if (input.value == "/getlogs" || input.value == "/getstatus") {
			if (input.value == "/getlogs") {logs.innerHTML = "";}
			socket.emit("command", input.value);
			input.value = "";
		}
	}
});

socket.on("log", function(msg) {
	const log = document.createElement("li");
	if (msg.includes("error")) {
		msg = msg.replace("error", "<mark id='error'>error</mark>");
	}
	if (msg.includes("info")) {
		msg = msg.replace("info", "<mark id='info'>info</mark>");
	}
	log.innerHTML = msg;
	logs.appendChild(log);
	window.scrollTo(0, document.body.scrollHeight);
});

socket.on("internal", function(msg) {
	if (msg == "getlogs") {
		socket.emit("command", "/getlogs");
		logs.innerHTML = "";
	}
});

socket.on("status", function(msg) {
	statusDiv.innerHTML = "";
	const websiteStatus = document.createElement("h2");
	const botStatus = document.createElement("h2");
	const dbStatus = document.createElement("h2");

	if (msg[0].website == true) {
		websiteStatus.innerHTML = "Website: <mark id='online'>Online</mark>";
	}
	else {
		websiteStatus.innerHTML = "Website: <mark id='offline'>Offline</mark>";
	}
	if (msg[1].DB == true) {
		dbStatus.innerHTML = "DB: <mark id='online'>Online</mark>";
	}
	else {
		websiteStatus.innerHTML = "DB: <mark id='offline'>Offline</mark>";
	}

	statusDiv.appendChild(websiteStatus);
	statusDiv.appendChild(dbStatus);
});