import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received contact data:", body);

    const { full_name, email, phone, subject, message, hp_field } = body;

    // reCAPTCHA removed by request — we no longer validate reCAPTCHA here.
    // Honeypot: if the hidden form field is filled, treat as bot submission
    if (hp_field) {
      console.log('Honeypot triggered on contact form; rejecting.');
      return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Validation + privacy consent check
    if (!full_name || !email || !subject || !message) {
      console.log("Validation failed - missing required fields");
      return Response.json(
        { error: "Lütfen tüm zorunlu alanları doldurun" },
        { status: 400 },
      );
    }

    if (!body.privacy_consent) {
      console.log('Validation failed - privacy consent not given');
      return Response.json({ error: 'Lütfen gizlilik politikasını kabul edin' }, { status: 400 });
    }

    console.log("Inserting contact message into database...");

    // Insert into database
    const result = await sql`
      INSERT INTO contact_messages (full_name, email, phone, subject, message)
      VALUES (${full_name}, ${email}, ${phone || null}, ${subject}, ${message})
      RETURNING id
    `;

    console.log("Database insert successful, ID:", result[0]?.id);

    // Send email notification (hata durumunda devam et)
    try {
      const emailBody = `
Yeni İletişim Mesajı

İsim: ${full_name}
Email: ${email}
Telefon: ${phone || "Belirtilmedi"}
Konu: ${subject}

Mesaj:
${message}
      `;

      console.log("Sending email notification...");

      const emailResponse = await fetch(
        `${process.env.APP_URL || ""}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: "uzelemehmet@gmail.com",
            subject: `İletişim Formu - ${subject}`,
            text: emailBody,
            template_params: { full_name, email, phone: phone || 'Belirtilmedi', subject, message, privacy_consent: !!body.privacy_consent },
          }),
        },
      );

      if (!emailResponse.ok) {
        console.error("Email send failed:", await emailResponse.text());
      } else {
        console.log("Email sent successfully");
      }
    } catch (emailError) {
      console.error("Email error (continuing anyway):", emailError);
    }

    return Response.json({
      success: true,
      id: result[0]?.id,
      message: "Mesajınız başarıyla gönderildi!",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    console.error("Error stack:", error.stack);

    return Response.json(
      {
        error: "Bir hata oluştu. Lütfen tekrar deneyin.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
