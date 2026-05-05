const express = require("express");
const app = express();

app.use(express.json());

let activations = [];

app.post("/validate", (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  const exists = activations.find(
    (a) => a.license === license && a.machine === machine
  );

  if (exists) {
    return res.json({ status: "valid" });
  }

  activations.push({ license, machine });

  return res.json({ status: "registered" });
});

app.get("/", (req, res) => {
  res.send("License API running");
});

app.listen(3000);
