const express = require('express');
const app = express();
const fs = require("fs");
const port = 1290;
require('dotenv').config();
var net = require('net');
const { MongoClient } = require("mongodb");
const URI = `mongodb://muumi:${process.env.MONGO_PASSWORD}@192.168.0.13:27017/?authMechanism=DEFAULT`;
const client = new MongoClient(URI);

app.get("/logs", (req, res) => {
      if (req.query.log == "bot"){
            return fs.readFile(process.env.LOGS_LOCATION, 'utf8', function(err,data) {
                  const logs = [];
                 if (err) throw err;
                 let array = data.toString().replace(/\r\n/g,'\n').split('\n')
                 for (i in array){
                       logs.push(array[i]);
                 }
                 return res.send(logs);
            });
      }

      if (req.query.log == "web") {
            return res.send("Website logs returned!");
      }

      if (req.query.log == "api") { 
            return res.send("API backend logs returned!");
      }

      return res.status(404).send("Wrong query options!");
})

app.get("/stats", async (req, res) => {
       try {
		await client.connect();

		const userCount = await client.db("EdgyLoba").collection("users").countDocuments();
            const guildCount = await client.db("EdgyLoba").collection("guilds").countDocuments();
            const historyCount = await client.db("EdgyLoba").collection("userHistory").countDocuments();
            const users = await client.db("EdgyLoba").collection("users").find({}).toArray();

            let averageRP = 0;
            let averageAP = 0;

            for (let i = 0; i < users.length; i++){
                  averageRP += users[i].RP;   
                  averageAP += users[i].AP;               
            }

            averageRP /= userCount;
            averageAP /= userCount;
            averageRP = Math.round(averageRP);
            averageAP = Math.round(averageAP);

            res.send({
                  DB: {
                        userCount: userCount,
                        guildCount: guildCount,
                        historyCount: historyCount,
                        users: {
                              averageRP: averageRP,
                              averageAP: averageAP,
                        }
                  }
            })
	}
	finally {
		await client.close();
	}
})

app.get("/status", (req, res) => {
      let website = false, backend = false, bot = false, db = false;

      var hosts = [["webserver", 'localhost', 8080, false], ["backend", 'localhost', 1290, false], ["db", '192.168.0.13', 27017, false]];
      hosts.forEach(function(item) {
          var sock = new net.Socket();
          sock.setTimeout(2500);
          sock.on('connect', function() {
              console.log(item[1]+':'+item[2]+' is up.');
              item[3] = true;
              sock.destroy();
          }).on('error', function(e) {
              console.log(item[1]+':'+item[2]+' is down: ' + e.message);
          }).on('timeout', function(e) {
              console.log(item[1]+':'+item[2]+' is down: timeout');
          }).connect(item[2], item[1]);
      });

      console.log(hosts[0][3])
      
})

    
app.listen(port, () => {
console.log(`Edgy-Loba API started on ${port}`)
})