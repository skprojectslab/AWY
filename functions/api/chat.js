export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { messages = [], profile = {} } = await request.json();

    const safeMessages = messages
      .slice(-20)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: String(m.content || "").slice(0, 4000)
          }
        ]
      }))
      .filter((m) => m.parts[0].text.trim());

    const name = profile.name
      ? String(profile.name).slice(0, 80)
      : "";

    const systemInstruction = `You are AWY — "Always With You", a warm, calm emotional support companion.

Your job is to feel present, human, patient and easy to understand. Use simple everyday English.

${name ? `The user's preferred name is ${name}. Use it naturally sometimes, but not in every reply.` : ""}

Do not sound like a generic chatbot. Do not repeatedly say "I'm here for you" without adding value.

Follow the user's actual words closely.

If the user asks to go deeper, continue from the current conversation. Never restart the conversation unless the user explicitly asks to start over.

When useful, offer one tiny practical step, grounding exercise, reflection, or a choice.

Do not diagnose medical or mental-health conditions. Do not claim to replace a therapist or emergency service.

If the user indicates immediate danger, suicide, self-harm, or inability to stay safe, prioritize immediate real-world help: encourage contacting local emergency services, a trusted person nearby, or going to an emergency department; encourage not staying alone.

Keep most replies under 170 words unless the user asks for detail.

End naturally, not with a forced question every time.`;

    const model =
      env.GEMINI_MODEL || "gemini-2.0-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: systemInstruction
              }
            ]
          },
          contents: safeMessages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return Response.json(
        {
          error:
            data?.error?.message ||
            "Gemini API request failed."
        },
        {
          status: response.status
        }
      );
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() ||
      "I'm listening. Tell me a little more about what is happening.";

    return Response.json(
      { answer },
      { status: 200 }
    );

  } catch (error) {
    console.error("AWY CHAT ERROR:", error);

    return Response.json(
      {
        error:
          error?.message || "Server error"
      },
      {
        status: 500
      }
    );
  }
}
