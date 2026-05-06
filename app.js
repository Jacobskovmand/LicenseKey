app.post("/validate", async (req, res) => {
  const { license, machine } = req.body;

  if (!license || !machine) {
    return res.json({ status: "error" });
  }

  // Find licensen uanset maskine
  const { data: existing, error: selectError } = await supabase
    .from("activations")
    .select("*")
    .eq("license", license)
    .maybeSingle();

  // Hvis licensen findes
  if (existing) {
    // Hvis maskinen er den samme → valid
    if (existing.machine === machine) {
      return res.json({ status: "valid" });
    }

    // Hvis maskinen er forskellig → licensen er allerede brugt
    return res.json({ status: "invalid_machine" });
  }

  // Licensen findes ikke → registrér den
  const { error: insertError } = await supabase
    .from("activations")
    .insert([{ license, machine }]);

  if (insertError) {
    return res.json({ status: "error" });
  }

  return res.json({ status: "registered" });
});
