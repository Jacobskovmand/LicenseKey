const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Miljøvariabler fra Railway
const supabase = createClient(
  process.env.SUPABASE_URL = https://bneoucvqzxmtlksvgyqj.supabase.co
  process.env.SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZW91Y3ZxenhtdGxrc3ZneXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk3MjkzMywiZXhwIjoyMDkzNTQ4OTMzfQ.ZUIs4lNQXZdbjd4IqiGeBCZkXC8agfvDb-rzbjHGuhA
);

app.post("/validate", async (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  // Tjek om licens+maskine allerede findes
  const { data: existing, error: selectError } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license)
    .eq("machine", machine)
    .maybeSingle();

  if (existing) {
    return res.json({ status: "valid" });
  }

  // Ellers indsæt ny aktivering
  const { error: insertError } = await supabase
    .from("activations")
    .insert([{ license, machine }]);

  if (insertError) {
    return res.json({ status: "error" });
  }

  return res.json({ status: "registered" });
});

app.get("/", (req, res) => {
  res.send("License API running with Supabase storage");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
