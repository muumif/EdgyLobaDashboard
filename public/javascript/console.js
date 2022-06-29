// eslint-disable-next-line no-undef
const socket = io();

const logs = document.getElementById("logs");
const form = document.getElementById("form");
const input = document.getElementById("input");

socket.emit("command", "/getlogs");

form.addEventListener("submit", function(e) {
	e.preventDefault();
	if (input.value) {
		socket.emit("command", input.value);
		input.value = "";
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
	if (msg == "getlogs") socket.emit("command", "/getlogs");
});