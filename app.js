app.post("/validate", async (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  // 1. Find licensen i databasen
  const { data: existing, error: selectError } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license)
    .maybeSingle();

  // Hvis licensen ikke findes → fejl
  if (!existing) {
    return res.json({ status: "license_not_found" });
  }

  // 2. Hvis licensen allerede er bundet til denne maskine → valid
  if (existing.machine === machine) {
    return res.json({ status: "valid" });
  }

  // 3. Hvis licensen er bundet til en anden maskine → fejl
  if (existing.machine && existing.machine !== machine) {
    return res.json({ status: "invalid_machine" });
  }

  // 4. Hvis licensen findes, men machineId er tom → opdater
  const { error: updateError } = await supabase
    .from("activations")
    .update({ machine })
    .eq("license", license);

  if (updateError) {
    return res.json({ status: "error" });
  }

  return res.json({ status: "registered" });
});
