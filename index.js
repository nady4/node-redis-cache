import express from "express";
import axios from "axios";
import { createClient } from "redis";

const app = express();
const client = createClient({
  host: "localhost",
  port: 6379,
});

app.get("/", (req, res) => {
  res.send("Hello from Express");
});

app.get("/characters", async (req, res) => {
  const cachedResults = await client.get("characters");
  if (cachedResults) {
    console.log("Cache hit");
    return res.json(JSON.parse(cachedResults));
  } else {
    axios
      .get("https://rickandmortyapi.com/api/character")
      .then(async (response) => {
        console.log("Cache miss");
        await client.set("characters", JSON.stringify(response.data));
        return res.json(response.data);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error fetching characters");
      });
  }
});

app.get("/characters/:id", async (req, res) => {
  const { id } = req.params;
  const cachedResults = await client.get(`character-${id}`);
  if (cachedResults) {
    console.log("Cache hit");
    return res.json(JSON.parse(cachedResults));
  } else {
    axios
      .get(`https://rickandmortyapi.com/api/character/${id}`)
      .then(async (response) => {
        console.log("Cache miss");
        await client.set(`character-${id}`, JSON.stringify(response.data));
        return res.json(response.data);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error fetching character");
      });
  }
});

app.listen(3000, async () => {
  await client.connect();
  console.log("Server is running on port 3000");
});
