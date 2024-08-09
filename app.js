const express = require("express");
const app = express();
require("dotenv").config();
const DEFAULT_PORT_NUMBER = 3000;
const DEFAULT_URI = "mongodb://localhost:27017";
const PORT = process.env.PORT || DEFAULT_PORT_NUMBER;
const URI = process.env.URI || DEFAULT_URI;
const { MongoClient } = require("mongodb");
const client = new MongoClient(URI);
const multer = require("multer");
const upload = multer({ dest: "public/uploads" });
const fs = require("fs");

app.use(express.json());
app.use(express.static("public"));
client.connect();

app.get("/search", async (req, res) => {
  const db = client.db("engine");
  const collection = db.collection("pages");
  const term = req.query.q;
  const pages = await collection.find({ terms: term }).toArray();
  return res.send(pages);
});

app.post("/crawl", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send("Title and content are required!");
  }
  const db = client.db("engine");
  const collection = db.collection("pages");
  await collection.insertOne({ title, terms: content.split(" ") });
  res.send("Completed!");
});

app.post("/upload", upload.single("textfile"), async (req, res) => {
  const fileContents = fs.readFileSync(req.file.path, "utf-8");
  console.log(req.file);
  console.log(fileContents);
  res.send("Completed!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
