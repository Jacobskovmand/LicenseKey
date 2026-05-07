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
    return res.json("error");
  }

  // 1. Find licensen i activations-tabellen
  const { data, error } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license)
    .limit(1);

  if (error) {
    console.log("Select error:", error);
    return res.json("error");
  }

  const existing = data[0];

  // 2. Licensen findes ikke
  if (!existing) {
    return res.json("license_not_found");
  }

  // 3. Licensen er disabled
  if (existing.disabled === true) {
    return res.json("License disabled");
  }

  // 4. Licensen er ikke bundet til en maskine endnu
  if (!existing.machine || existing.machine === "") {
    const { error: updateError } = await supabase
      .from("activations")
      .update({ machine })
      .eq("license", license);

    if (updateError) {
      console.log("Update error:", updateError);
      return res.json("error");
    }

    return res.json("registered");
  }

  // 5. Maskinen matcher → valid
  if (existing.machine === machine) {
    return res.json("valid");
  }

  // 6. Maskinen matcher ikke → invalid
  return res.json("invalid_machine");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
