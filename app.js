const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Railway miljøvariabler
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/validate", async (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  //
  // 1. Hent licensen fra licenses-tabellen
  //
  const { data: licenseData, error: licenseError } = await supabase
    .from("licenses")
    .select("*")
    .eq("license", license)
    .maybeSingle();

  if (!licenseData) {
    return res.json({ status: "license_not_found" });
  }

  //
  // 2. Tjek om licensen er disabled
  //
  if (licenseData.disabled === true) {
    return res.json({ status: "disabled" });
  }

  //
  // 3. Hent alle aktiveringer for denne licens
  //
  const { data: activations, error: actError } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license);

  if (actError) {
    return res.json({ status: "error" });
  }

  //
  // 4. Hvis maskinen allerede findes → valid
  //
  const existing = activations.find(a => a.machine === machine);
  if (existing) {
    return res.json({ status: "valid" });
  }

  //
  // 5. Hvis du vil bruge max_machines (valgfrit)
  //
  if (licenseData.max_machines) {
    if (activations.length >= licenseData.max_machines) {
      return res.json({ status: "invalid_machine" });
    }
  }

  //
  // 6. Ellers registrér maskinen
  //
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
