const $ = (s) => document.querySelector(s);

const app = $("#app");
const backBtn = $("#backBtn");
const themeBtn = $("#themeBtn");
const toast = $("#toast");

const state = {
  history: [],
  profile: JSON.parse(localStorage.getItem("awy_profile") || "{}"),
  messages: JSON.parse(localStorage.getItem("awy_messages") || "[]"),
  sound: JSON.parse(localStorage.getItem("awy_sound") || "true"),
  screen: "welcome"
};

function save() {
  localStorage.setItem("awy_profile", JSON.stringify(state.profile));
  localStorage.setItem("awy_messages", JSON.stringify(state.messages));
  localStorage.setItem("awy_sound", JSON.stringify(state.sound));
}

function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m])
  );
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function beep(freq = 520, duration = 0.08) {
  if (!state.sound || !window.AudioContext) return;

  try {
    const c = new AudioContext();
    const o = c.createOscillator();
    const g = c.createGain();

    o.frequency.value = freq;
    g.gain.value = 0.04;

    o.connect(g);
    g.connect(c.destination);

    o.start();

    g.gain.exponentialRampToValueAtTime(
      0.001,
      c.currentTime + duration
    );

    o.stop(c.currentTime + duration);

  } catch (e) {}
}

function speak(text) {
  if (!state.sound || !("speechSynthesis" in window)) return;

  speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(
    text.replace(/[*_#]/g, "")
  );

  u.rate = 0.98;
  u.pitch = 1.05;

  speechSynthesis.speak(u);
}

function render(html, screen, push = true) {

  if (
    push &&
    state.screen &&
    state.screen !== screen
  ) {
    state.history.push(state.screen);
  }

  state.screen = screen;

  app.innerHTML = html;

  backBtn.classList.toggle(
    "hidden",
    state.history.length === 0
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function goBack() {
  const prev = state.history.pop();

  if (prev) {
    navigate(prev, false);
  }
}

backBtn.onclick = goBack;

themeBtn.onclick = () => {

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "awy_theme",
    document.body.classList.contains("dark")
      ? "dark"
      : "light"
  );

};

if (
  localStorage.getItem("awy_theme") === "dark"
) {
  document.body.classList.add("dark");
}


const emotions = [

  [
    "Sad",
    "assets/emotions/sad.svg",
    "I feel low or heavy"
  ],

  [
    "Anxious",
    "assets/emotions/anxious.svg",
    "My mind or body feels on edge"
  ],

  [
    "Overthinking",
    "assets/emotions/overthinking.svg",
    "I cannot stop thinking"
  ],

  [
    "Overwhelmed",
    "assets/emotions/overwhelmed.svg",
    "Everything feels like too much"
  ],

  [
    "Doubting myself",
    "assets/emotions/doubting.svg",
    "I am questioning myself"
  ],

  [
    "Hurt",
    "assets/emotions/hurt.svg",
    "Something has affected me deeply"
  ],

  [
    "Exhausted",
    "assets/emotions/exhausted.svg",
    "I have very little left"
  ],

  [
    "Angry",
    "assets/emotions/angry.svg",
    "Something is making me angry"
  ],

  [
    "I'm not sure",
    "assets/emotions/unsure.svg",
    "I just know I need someone"
  ]

];


function welcome() {

  const name = state.profile.name
    ? `Hi ${esc(state.profile.name)}.`
    : "Hi.";

  render(

    `
    <div class="hero">

      <div class="orb"></div>

      <h1>
        ${name}<br>
        I'm here with you.
      </h1>

      <p class="sub">
        You do not have to explain everything perfectly.
        Start wherever you are.
      </p>

    </div>


    <div class="card">

      <h2>
        What do you need from me right now?
      </h2>

      <div class="grid" id="needs">

        ${[

          [
            "🤍",
            "Just be with me",
            "Stay with me while I talk"
          ],

          [
            "👂",
            "Listen to me",
            "I want to get something out"
          ],

          [
            "🫁",
            "Help me feel better now",
            "I need to calm down"
          ],

          [
            "🧠",
            "Help me understand this",
            "Help me make sense of it"
          ],

          [
            "🎯",
            "Help me figure out what to do",
            "I need a next step"
          ]

        ].map(
          (x, i) => `
          
          <button
            class="choice"
            data-need="${i}"
          >

            <strong>
              ${x[0]} ${x[1]}
            </strong>

            <span>
              ${x[2]}
            </span>

          </button>

        `
        ).join("")}

      </div>

    </div>


    <div class="row">

      <button
        class="btn secondary"
        id="profileBtn"
      >
        Personalise AWY
      </button>


      <button
        class="btn ghost"
        id="settingsBtn"
      >
        Sound & settings
      </button>

    </div>

    `,

    "welcome"

  );


  document
    .querySelectorAll("[data-need]")
    .forEach(b => {

      b.onclick = () => {
        startNeed(
          Number(b.dataset.need)
        );
      };

    });


  $("#profileBtn").onclick = profile;

  $("#settingsBtn").onclick = settings;

}


function profile() {

  render(

    `

    <div class="card">

      <h2>
        Let's make this feel a little more personal
      </h2>

      <p class="sub">
        Only share what you are comfortable sharing.
        You can skip anything.
      </p>


      <div class="profile">


        <label>

          Name (optional)

          <input
            id="name"
            class="input"
            placeholder="What should I call you?"
            value="${esc(state.profile.name || "")}"
          >

        </label>


        <div>

          <div class="meta">
            Gender (optional)
          </div>


          <div class="chips">

            ${[
              "Woman",
              "Man",
              "Non-binary",
              "Prefer not to say"
            ].map(
              x => `
              
              <button
                class="chip gender"
                data-v="${x}"
              >
                ${x}
              </button>
              
              `
            ).join("")}

          </div>

        </div>


        <div>

          <div class="meta">
            Age range (optional)
          </div>


          <div class="age-grid">

            ${[
              "Under 18",
              "18–24",
              "25–34",
              "35–44",
              "45–54",
              "55+"
            ].map(
              x => `
              
              <button
                class="chip age"
                data-v="${x}"
              >
                ${x}
              </button>
              
              `
            ).join("")}

          </div>

        </div>


        <div class="row">

          <button
            class="btn"
            id="saveProfile"
          >
            Continue
          </button>


          <button
            class="btn ghost"
            id="skipProfile"
          >
            Skip
          </button>

        </div>


      </div>

    </div>

    `,

    "profile"

  );


  let gender = state.profile.gender || "";
  let age = state.profile.age || "";


  document
    .querySelectorAll(".gender")
    .forEach(b => {

      b.onclick = () => {

        gender = b.dataset.v;

        document
          .querySelectorAll(".gender")
          .forEach(x => {

            x.classList.toggle(
              "active",
              x === b
            );

          });

      };

    });


  document
    .querySelectorAll(".age")
    .forEach(b => {

      b.onclick = () => {

        age = b.dataset.v;

        document
          .querySelectorAll(".age")
          .forEach(x => {

            x.classList.toggle(
              "active",
              x === b
            );

          });

      };

    });


  $("#saveProfile").onclick = () => {

    state.profile = {

      name: $("#name").value.trim(),

      gender,

      age

    };

    save();

    welcome();

  };


  $("#skipProfile").onclick = welcome;

}


function settings() {

  render(

    `

    <div class="card">

      <h2>
        Settings
      </h2>


      <div class="sound-row">

        <div>

          <strong>
            Sound and voice
          </strong>

          <div class="meta">
            Soft interaction sounds and spoken replies
          </div>

        </div>


        <input
          class="switch"
          type="checkbox"
          id="soundToggle"
          ${state.sound ? "checked" : ""}
        >

      </div>


      <hr
        style="
          border:0;
          border-top:1px solid var(--line);
          margin:18px 0
        "
      >


      <button
        class="btn ghost"
        id="clearChat"
      >
        Clear this conversation
      </button>

    </div>

    `,

    "settings"

  );


  $("#soundToggle").onchange = e => {

    state.sound = e.target.checked;

    save();

    beep();

  };


  $("#clearChat").onclick = () => {

    state.messages = [];

    save();

    showToast(
      "Conversation cleared"
    );

  };

}


function startNeed(i) {

  const map = [

    "Just be with me",

    "Listen to me",

    "Help me feel better now",

    "Help me understand this",

    "Help me figure out what to do"

  ];


  state.messages.push({

    role: "user",

    content: map[i]

  });


  save();

  chat();

}


function chat() {

  const name = state.profile.name
    ? `, ${esc(state.profile.name)}`
    : "";


  render(

    `

    <div class="card">

      <div class="orb small"></div>

      <h2>
        I'm here${name}
      </h2>

      <p class="meta">
        You can type, use the microphone,
        choose a quick option, or simply say
        what is on your mind.
      </p>

    </div>


    <div id="safetyBox"></div>


    <div
      class="chat"
      id="chat"
    ></div>


    <div class="composer">


      <div
        class="chips"
        id="chips"
      >

        <button class="chip">
          Go deeper
        </button>

        <button class="chip">
          I don't feel understood
        </button>

        <button class="chip">
          Give me a small step
        </button>

        <button class="chip">
          Start over
        </button>

      </div>


      <div class="composer-row">


        <button
          class="mic"
          id="micBtn"
          title="Voice input"
        >
          🎙
        </button>


        <input
          id="msg"
          class="input"
          placeholder="Write in your own words…"
          autocomplete="off"
        >


        <button
          class="btn send"
          id="sendBtn"
        >
          Send
        </button>


      </div>


    </div>

    `,

    "chat"

  );


  drawMessages();


  $("#sendBtn").onclick = sendMessage;


  $("#msg").addEventListener(
    "keydown",
    e => {

      if (e.key === "Enter") {
        sendMessage();
      }

    }
  );


  $("#chips").onclick = e => {

    if (
      !e.target.classList.contains("chip")
    ) {
      return;
    }


    const t = e.target.textContent.trim();


    if (t === "Start over") {

      state.messages = [];

      save();

      welcome();

      return;

    }


    sendMessage(t);

  };


  setupVoice();


  if (state.messages.length === 1) {

    sendAI();

  }

}


function drawMessages() {

  const c = $("#chat");

  if (!c) return;


  c.innerHTML = "";


  state.messages.forEach(m => {

    const d =
      document.createElement("div");


    d.className =
      "bubble " +
      (
        m.role === "user"
          ? "user"
          : "bot"
      );


    d.textContent = m.content;


    c.appendChild(d);

  });


  window.scrollTo({

    top: document.body.scrollHeight,

    behavior: "smooth"

  });

}


async function sendMessage(forced) {

  const input = $("#msg");


  const text = (
    forced ||
    input.value
  ).trim();


  if (!text) return;


  input.value = "";


  state.messages.push({

    role: "user",

    content: text

  });


  save();


  beep(600);


  drawMessages();


  if (isCrisis(text)) {

    showSafety();

    return;

  }


  await sendAI();

}


function isCrisis(t) {

  return /\b(
    kill myself|
    suicide|
    end my life|
    want to die|
    hurt myself|
    harm myself|
    can't stay safe
  )\b/ix.test(t);

}


function showSafety() {

  $("#safetyBox").innerHTML = `

    <div class="safety">

      <strong>
        I'm really glad you told me.
      </strong>


      <p>
        If you might hurt yourself or are in immediate danger,
        please move toward a trusted person or emergency help
        right now. Do not stay alone.
      </p>


      <p>
        If you can, call your local emergency number or go
        to the nearest emergency department.
      </p>


      <p>
        You can also tell someone nearby:
        <em>
          "I don't feel safe being alone right now."
        </em>
      </p>

    </div>

  `;


  const message =
    "I’m staying with you here, but I can’t safely handle an immediate crisis alone. Please reach a real person near you now.";


  state.messages.push({

    role: "assistant",

    content: message

  });


  save();


  drawMessages();


  speak(message);

}


async function sendAI() {

  const c = $("#chat");

  if (!c) return;


  const typing =
    document.createElement("div");


  typing.className = "typing";


  typing.textContent =
    "AWY is thinking…";


  c.appendChild(typing);


  window.scrollTo({

    top: document.body.scrollHeight,

    behavior: "smooth"

  });


  try {

    /*
      This goes to:

      Cloudflare Pages Function:

      functions/api/chat.js

      URL:

      /api/chat
    */

    const r = await fetch(

      "/api/chat",

      {

        method: "POST",

        headers: {

          "Content-Type":
            "application/json"

        },

        body: JSON.stringify({

          messages: state.messages,

          profile: state.profile

        })

      }

    );


    let data;


    try {

      data = await r.json();

    } catch {

      throw new Error(
        "The server returned an invalid response."
      );

    }


    if (!r.ok) {

      console.error(
        "AWY API ERROR:",
        data
      );

      throw new Error(

        data?.error ||
        "AI request failed"

      );

    }


    const answer =

      data.answer ||

      "I'm listening. Tell me a little more about what is happening.";


    state.messages.push({

      role: "assistant",

      content: answer

    });


    save();


    typing.remove();


    drawMessages();


    speak(answer);


  } catch (err) {

    console.error(
      "AWY CONNECTION ERROR:",
      err
    );


    typing.remove();


    state.messages.push({

      role: "assistant",

      content:

        "I’m having trouble connecting to my AI brain right now. Your message is still here. Please try again in a moment."

    });


    save();


    drawMessages();


    /*
      Shows a small error message.

      This will help us troubleshoot
      Cloudflare or Gemini problems.
    */

    showToast(
      err.message || "Connection problem"
    );

  }

}


function setupVoice() {

  const SR =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;


  if (!SR) {

    $("#micBtn").onclick = () => {

      showToast(
        "Voice input is not supported in this browser."
      );

    };


    return;

  }


  const rec = new SR();


  rec.lang = "en-IN";


  rec.interimResults = false;


  $("#micBtn").onclick = () => {

    try {

      rec.start();

      showToast("Listening…");

    } catch (e) {}

  };


  rec.onresult = e => {

    $("#msg").value =
      e.results[0][0].transcript;

  };


  rec.onerror = () => {

    showToast(
      "I couldn't hear that clearly. You can type instead."
    );

  };

}


function navigate(screen, push = false) {

  if (screen === "welcome") {

    welcome();

  }

  else if (screen === "profile") {

    profile();

  }

  else if (screen === "settings") {

    settings();

  }

  else {

    chat();

  }

}


navigate("welcome", false);
