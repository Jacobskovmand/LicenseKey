const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Miljøvariabler fra Railway
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY 
);

app.post("/validate", async (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  // Find licensen
  const { data, error } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license)
    .limit(1);

  if (error) {
    console.log("Select error:", error);
    return res.json({ status: "error" });
  }

  const existing = data[0];

  if (!existing) {
    return res.json({ status: "license_not_found" });
  }

  if (existing.machine === machine) {
    return res.json({ status: "valid" });
  }

  if (existing.machine && existing.machine !== machine) {
    return res.json({ status: "invalid_machine" });
  }

  const { error: updateError } = await supabase
    .from("activations")
    .update({ machine })
    .eq("license", license);

  if (updateError) {
    console.log("Update error:", updateError);
    return res.json({ status: "error" });
  }

  return res.json({ status: "registered" });
});

app.get("/", (req, res) => {
  res.send("License API running with Supabase storage");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
