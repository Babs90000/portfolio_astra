import type { APIRoute } from "astro";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  // 🔍 DEBUG — variables d'environnement
  console.log("=== DEBUG ENV ===");
  console.log("process.env.SMTP_HOST:", process.env.SMTP_HOST);
  console.log("process.env.SMTP_PORT:", process.env.SMTP_PORT);
  console.log("process.env.SMTP_USER:", process.env.SMTP_USER);
  console.log(
    "process.env.SMTP_PASS:",
    process.env.SMTP_PASS ? "***défini***" : "undefined",
  );
  console.log("process.env.SMTP_TO:", process.env.SMTP_TO);
  console.log("import.meta.env.SMTP_HOST:", import.meta.env.SMTP_HOST);
  console.log("import.meta.env.SMTP_PORT:", import.meta.env.SMTP_PORT);
  console.log("import.meta.env.SMTP_USER:", import.meta.env.SMTP_USER);
  console.log(
    "import.meta.env.SMTP_PASS:",
    import.meta.env.SMTP_PASS ? "***défini***" : "undefined",
  );
  console.log("import.meta.env.SMTP_TO:", import.meta.env.SMTP_TO);
  console.log("=================");

  try {
    const data = await request.formData();
    const name = data.get("name")?.toString().trim();
    const email = data.get("email")?.toString().trim();
    const message = data.get("message")?.toString().trim();

    console.log("📬 Données reçues:", {
      name,
      email,
      message: message?.slice(0, 20),
    });

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Tous les champs sont requis." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Utilise la première valeur définie
    const smtpHost = import.meta.env.SMTP_HOST ?? process.env.SMTP_HOST;
    const smtpPort = import.meta.env.SMTP_PORT ?? process.env.SMTP_PORT;
    const smtpUser = import.meta.env.SMTP_USER ?? process.env.SMTP_USER;
    const smtpPass = import.meta.env.SMTP_PASS ?? process.env.SMTP_PASS;
    const smtpTo = import.meta.env.SMTP_TO ?? process.env.SMTP_TO;

    console.log("📡 Config SMTP utilisée:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass ? "***défini***" : "undefined",
      to: smtpTo,
    });

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: { rejectUnauthorized: false },
    });

    console.log("🔌 Tentative de connexion SMTP...");
    await transporter.verify();
    console.log("✅ Connexion SMTP OK !");

    await transporter.sendMail({
      from: `"Portfolio Contact" <${smtpUser}>`,
      to: smtpTo,
      replyTo: email,
      subject: `📩 Message de ${name} via portfolio`,
      html: `
        <h2>Nouveau message depuis le portfolio</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    console.log("📨 Email envoyé avec succès !");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ [contact API] Erreur complète:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
