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
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [
          {
            text: String(message.content || "").slice(0, 4000)
          }
        ]
      }));

    const name = profile.name
      ? String(profile.name).slice(0, 80)
      : "";

    const systemPrompt = `
You are AWY — "Always With You", a warm, calm emotional support companion.

Your job is to feel present, human, patient and easy to understand.

Use simple everyday English.

${name ? `The user's preferred name is ${name}. Use it naturally sometimes, but not in every reply.` : ""}

Do not sound like a generic chatbot.

Do not repeatedly say "I'm here for you" without adding value.

Follow the user's actual words closely.

Ask one gentle follow-up question when more understanding would help.

If the user asks to go deeper, continue from the current conversation. Never restart the conversation.

When useful, offer one tiny practical step, grounding exercise, reflection, or choice.

Do not diagnose medical or mental-health conditions.

Do not claim to replace a therapist or emergency service.

If the user indicates immediate danger, suicide, self-harm, or inability to stay safe, prioritize immediate real-world help.

Encourage contacting local emergency services, a trusted person nearby, or going to an emergency department.

Encourage not staying alone.

Keep most replies under 170 words unless the user asks for detail.

End naturally, not with a forced question every time.
`;

    const model =
      env.GEMINI_MODEL || "gemini-2.0-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },

        contents: safeMessages,

        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Gemini API error:",
        JSON.stringify(data)
      );

      return Response.json(
        {
          error:
            data?.error?.message ||
            "Gemini request failed."
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
        .trim();

    if (!answer) {
      return Response.json(
        {
          error:
            "Gemini returned an empty response."
        },
        {
          status: 500
        }
      );
    }

    return Response.json({
      answer
    });

  } catch (error) {

    console.error(
      "CHAT FUNCTION ERROR:",
      error
    );

    return Response.json(
      {
        error:
          error.message ||
          "Server error"
      },
      {
        status: 500
      }
    );

  }
}
