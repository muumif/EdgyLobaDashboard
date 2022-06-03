const express = require('express');
const app = express();
const fs = require("fs");
const port = 1290;
require('dotenv').config();
const { tcpPingPort } = require("tcp-ping-port")
const { MongoClient } = require("mongodb");
const URI = `mongodb://muumi:${process.env.MONGO_PASSWORD}@${process.env.SERVER_IP}:27017/?authMechanism=DEFAULT`;
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
            const analytics = await client.db("EdgyLoba").admin().serverStatus();

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
                        analytics: {
                              uptime: analytics.uptime,
                              connections: {
                                    current: analytics.connections.current,
                                    active: analytics.connections.active,
                              },
                              network: {
                                    bytesIn: analytics.network.bytesIn,
                                    bytesOut: analytics.network.bytesOut,
                                    numRequests: analytics.network.numRequests,
                              },
                              memory: analytics.tcmalloc.generic
                        },
                        counts: {
                              userCount: userCount,
                              guildCount: guildCount,
                              historyCount: historyCount,
                        },
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

app.get("/status", async (req, res) => {
      let website = "offline", backend = "offline", bot = "offline", db = "offline";
      
      await tcpPingPort(process.env.SERVER_IP, 8080).then(online => {
            if (online.online) {
                  website = "online";
            }
      }).catch(err => {website = "offline"})

      await tcpPingPort(process.env.SERVER_IP, 1290).then(online => {
            if (online.online) {
                  backend = "online";
            }
      }).catch(err => {backend = "offline"})

      await tcpPingPort(process.env.SERVER_IP, 27017).then(online => {
            if (online.online) {
                  db = "online";
            }
      }).catch(err => db ="offline");

      res.send({
            website: website,
            backend: backend,
            bot: bot,
            db: db,
      })
})

    
app.listen(port, () => {
      console.log(`Edgy-Loba API started on ${port}`)
})