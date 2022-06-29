const express = require("express");
const { readFile, watch } = require("fs");
require("dotenv").config();
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 1290;
const sassMiddleware = require("node-sass-middleware");
const { tcpPingPort } = require("tcp-ping-port");

app.use(sassMiddleware({
	src: __dirname + "/public/sass",
	dest: __dirname + "/public/",
}));

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
	res.redirect("/console");
});

app.get("/console", (req, res) => {
	res.sendFile(__dirname + "/pages/console.html");
});

io.on("connection", (socket) => {
	console.log("A user has connected!");

	watch(process.env.LOGS_LOCATION, (eventType, filename) => {
		if (eventType == "change") {
			socket.emit("internal", "getlogs");
		}
	});

	socket.on("command", async command => {
		if (command == "/getlogs") {
			readFile(process.env.LOGS_LOCATION, "utf-8", function(err, data) {
				if (err) socket.emit("log", err);
				let logs = data.toString().replace(/\r\n/g, "\n").split("\n");

				logs = logs.map(log => {
					if (log == "") {
						return;
					}
					return JSON.parse(log);
				});

				logs.forEach(log => {
					if (log == "" || log == undefined) return;
					if (log.command != undefined) {
						const formatted = `[${log.level}] [${log.timestamp.split(" ")[1]}] [${log.command}]: ${log.message}`;
						io.emit("log", formatted);
					}
					if (log.level == "error") {
						if (log.DBOP != undefined) {
							const formatted = `[${log.level}] [${log.timestamp.split(" ")[1]}] [${log.DBOP}]: ${log.message}`;
							io.emit("log", formatted);
						}
						if (log.module != undefined) {
							const formatted = `[${log.level}] [${log.timestamp.split(" ")[1]}] [${log.module}]: ${log.message}`;
							io.emit("log", formatted);
						}
					}
				});

			});
		}

		if (command == "/getstatus") {
			const statuses = [];
			await tcpPingPort(process.env.SERVER_IP, 1290).then(online => {
				if (online.online) {
					statuses.push({ website: true });
				}
				else {statuses.push({ website: false });}
			}).catch(err => {statuses.push({ website: false });});

			await tcpPingPort(process.env.SERVER_IP, 27017).then(online => {
				if (online.online) {
					statuses.push({ DB: true });
				}
				else {statuses.push({ DB: false });}
			}).catch(err => {statuses.push({ DB: false });});

			io.emit("status", statuses);
		}
	});

	socket.on("log", msg => {
		console.log(msg);
		io.emit("log", msg);
	});
	socket.on("disconnect", () => {
		console.log("A user has disconnected!");
	});
});

http.listen(port, () => {
	console.log(`Listening on port ${port}`);
});