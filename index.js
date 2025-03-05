import express from "express";
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
    console.log("🔥 Cache hit");
    return res.json(JSON.parse(cachedResults));
  } else {
    try {
      const response = await fetch("https://rickandmortyapi.com/api/character");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log("🛑 Cache miss");
      await client.set("characters", JSON.stringify(data));
      return res.json(data);
    } catch (error) {
      console.error("🚨 Error fetching characters:", error);
      res.status(500).send("Error fetching characters");
    }
  }
});

app.get("/characters/:id", async (req, res) => {
  const { id } = req.params;
  const cachedResults = await client.get(`character-${id}`);
  if (cachedResults) {
    console.log("🔥 Cache hit");
    return res.json(JSON.parse(cachedResults));
  } else {
    try {
      const response = await fetch(
        `https://rickandmortyapi.com/api/character/${id}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      console.log("🛑 Cache miss");
      await client.set(`character-${id}`, JSON.stringify(data));
      return res.json(data);
    } catch (error) {
      console.error("🚨 Error fetching character:", error);
      res.status(500).send("Error fetching character");
    }
  }
});

app.listen(3000, async () => {
  await client.connect();
  console.log("🚀 Server is running on port 3000");
});
