const express = require('express');
const app = express();
const fs = require("fs");
const port = 1290;
require('dotenv').config();
const { MongoClient } = require("mongodb");
const URI = `mongodb://muumi:${process.env.MONGO_PASSWORD}@192.168.0.13:27017/?authMechanism=DEFAULT`;
const client = new MongoClient(URI);

app.get('/', (req, res) => {
      res.send('Hello World!')
})

app.get("/logs", (req, res) => {
      fs.readFile(process.env.LOGS_LOCATION, 'utf8', function(err,data) {
            const logs = [];
           if (err) throw err;
           let array = data.toString().replace(/\r\n/g,'\n').split('\n')
           for (i in array){
                 logs.push(array[i]);
           }
           res.send(logs);
      });
})

app.get("/dbStats", async (req, res) => {
       try {
		await client.connect();

		const userCount = await client.db("EdgyLoba").collection("users").countDocuments();
            const guildCount = await client.db("EdgyLoba").collection("guilds").countDocuments();
            const historyCount = await client.db("EdgyLoba").collection("userHistory").countDocuments();
            res.send({
                  userCount: userCount,
                  guildCount: guildCount,
                  historyCount: historyCount,
            })
	}
	finally {
		await client.close();
	}
})
    
app.listen(port, () => {
console.log(`Edgy-Loba API started on ${port}`)
})