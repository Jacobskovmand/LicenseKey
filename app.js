const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

const FILE = "Licenses.txt";

// Sørg for at filen findes
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, "");
}

// Læs alle aktiveringer fra tekstfilen
function readActivations() {
  const data = fs.readFileSync(FILE, "utf8").trim();
  if (!data) return [];
  return data.split("\n").map(line => {
    const [license, machine] = line.split(";");
    return { license, machine };
  });
}

// Tilføj ny aktivering
function addActivation(license, machine) {
  fs.appendFileSync(FILE, `${license};${machine}\n`);
}

app.post("/validate", (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  const activations = readActivations();

  // Find om licens+maskine allerede findes
  const exists = activations.find(
    (a) => a.license === license && a.machine === machine
  );

  if (exists) {
    return res.json({ status: "valid" });
  }

  // Hvis ikke → registrér ny aktivering
  addActivation(license, machine);

  return res.json({ status: "registered" });
});

app.get("/", (req, res) => {
  res.send("License API running with flat text file storage");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
