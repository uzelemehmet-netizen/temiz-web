import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received travel inquiry data:", body);

    const {
      full_name,
      email,
      phone,
      travel_dates,
      number_of_people,
      package_preference,
      interests,
      budget_range,
      additional_details,
      hp_field,
    } = body;

    // reCAPTCHA removed by request — no server-side recaptcha validation.
    // Honeypot: block submissions that fill hidden fields
    if (hp_field) {
      console.log('Honeypot triggered on travel inquiry; rejecting.');
      return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }

    // Validation + privacy consent check
    if (!full_name || !email || !phone || !travel_dates || !number_of_people) {
      console.log("Validation failed - missing required fields");
      return Response.json(
        { error: "Lütfen tüm zorunlu alanları doldurun" },
        { status: 400 },
      );
    }

    if (!body.privacy_consent) {
      console.log('Validation failed - privacy consent not given for travel inquiry');
      return Response.json({ error: 'Lütfen gizlilik politikasını kabul edin' }, { status: 400 });
    }

    console.log("Inserting into database...");

    // Insert into database
    const result = await sql`
      INSERT INTO travel_inquiries (
        full_name, 
        email, 
        phone, 
        travel_dates, 
        number_of_people, 
        package_preference, 
        interests, 
        budget_range, 
        additional_details
      )
      VALUES (
        ${full_name}, 
        ${email}, 
        ${phone}, 
        ${travel_dates}, 
        ${parseInt(number_of_people)}, 
        ${package_preference || null}, 
        ${interests || null}, 
        ${budget_range || null}, 
        ${additional_details || null}
      )
      RETURNING id
    `;

    console.log("Database insert successful, ID:", result[0]?.id);

    // Send email notification (hata durumunda devam et)
    try {
      const emailBody = `
Yeni Seyahat Talebi

İsim: ${full_name}
Email: ${email}
Telefon: ${phone}
Seyahat Tarihleri: ${travel_dates}
Kişi Sayısı: ${number_of_people}
Tercih Edilen Paket: ${package_preference || "Belirtilmedi"}
İlgi Alanları: ${interests || "Belirtilmedi"}
Bütçe Aralığı: ${budget_range || "Belirtilmedi"}
Ek Detaylar: ${additional_details || "Yok"}
      `;

      console.log("Sending email notification...");

      const emailResponse = await fetch(
        `${process.env.APP_URL || ""}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: "uzelemehmet@gmail.com",
            subject: `Yeni Seyahat Talebi - ${full_name}`,
            text: emailBody,
            template_params: { full_name, email, phone: phone || 'Belirtilmedi', travel_dates, number_of_people, package_preference, interests, budget_range, additional_details: additional_details || 'Yok', privacy_consent: !!body.privacy_consent },
            // Allow sending travel inquiries with a dedicated template (if configured)
            template_id: process.env.EMAILJS_TRAVEL_TEMPLATE_ID || undefined
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
      message: "Talebiniz başarıyla kaydedildi!",
    });
  } catch (error) {
    console.error("Travel inquiry error:", error);
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
