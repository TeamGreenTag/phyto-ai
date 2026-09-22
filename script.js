
/* =========================================================
   GREENTAG AI
   UNIVERSAL PLANT / BOTANY / AGRICULTURE ASSISTANT
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const chatBox =
    document.getElementById("chatBox");

const chatContainer =
    document.getElementById("chatContainer");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const typing =
    document.getElementById("typing");

const clearChat =
    document.getElementById("clearChat");

const imageInput =
    document.getElementById("imageInput");

const imageButton =
    document.getElementById("imageButton");

const imagePreview =
    document.getElementById("imagePreview");

const previewImage =
    document.getElementById("previewImage");

const removeImage =
    document.getElementById("removeImage");

const micButton =
    document.getElementById("micButton");

const topics =
    document.querySelectorAll(".topic");


/* =========================================================
   CONFIGURATION
   ========================================================= */

/*
 * IMPORTANT
 *
 * Do NOT put a private AI API key inside this file.
 *
 * Your browser should communicate with your own backend:
 *
 * Browser
 *    ↓
 * /api/chat
 *    ↓
 * AI API
 *
 * Change this URL if your backend uses another address.
 */

const AI_API_URL =
    "https://phyto-nipgay65s-teamgreentag.vercel.app/api/chat";


/*
 * Default weather location.
 *
 * This is Delhi.
 *
 * Later you can replace this with:
 * - GPS location
 * - user's selected city
 * - your own location system
 */

let weatherLatitude = 28.6139;
let weatherLongitude = 77.2090;

let selectedTopic = "general";

let selectedImage = null;


/* =========================================================
   PLANT AI SYSTEM INSTRUCTIONS
   ========================================================= */

const SYSTEM_PROMPT = `

You are GreenTag AI.

You are a comprehensive educational assistant specializing
in plants, botany, agriculture, horticulture and related
life sciences.

You should be able to discuss:

BOTANY
- plant anatomy
- plant morphology
- plant physiology
- taxonomy
- systematics
- nomenclature
- genetics
- plant breeding
- evolution
- ecology
- plant biotechnology
- plant cells
- tissues
- meristems
- photosynthesis
- respiration
- transpiration
- mineral nutrition
- plant hormones
- growth and development

AGRICULTURE
- agronomy
- crop production
- crop management
- seed science
- irrigation
- water management
- weeds
- weed management
- cropping systems
- sustainable agriculture
- organic farming
- precision agriculture

HORTICULTURE
- fruit crops
- vegetable crops
- ornamental plants
- floriculture
- pomology
- olericulture
- nursery management
- protected cultivation
- pruning
- propagation
- grafting
- budding
- layering
- cuttings

PLANT HEALTH
- plant diseases
- fungal diseases
- bacterial diseases
- viral diseases
- nematodes
- pests
- insects
- integrated pest management
- biological control
- plant disorders
- abiotic stress
- nutrient deficiencies
- toxicity

SOIL
- soil science
- soil pH
- soil texture
- soil structure
- organic matter
- compost
- manure
- soil fertility
- salinity
- sodicity
- nutrient availability

FERTILIZERS
- nitrogen
- phosphorus
- potassium
- secondary nutrients
- micronutrients
- NPK
- organic fertilizers
- inorganic fertilizers
- foliar nutrition
- fertilizer management

ENVIRONMENT
- climate
- temperature
- rainfall
- humidity
- sunlight
- drought
- heat stress
- cold stress
- climate effects on crops
- plant ecology
- biodiversity

PLANT IDENTIFICATION
- common names
- scientific names
- family
- genus
- species
- identifying characteristics
- leaves
- flowers
- fruits
- stems
- roots

EXAMINATION
- definitions
- short answers
- long answers
- MCQs
- viva questions
- practical questions
- comparisons
- important facts
- scientific names

GENERAL GARDENING
- houseplants
- terrace gardening
- kitchen gardens
- watering
- sunlight
- potting mixtures
- propagation
- pruning
- repotting
- plant care

RESPONSE RULES:

1. Answer the actual question directly.

2. Use simple language when the user asks for a simple
   explanation.

3. Use scientific terminology when appropriate and explain
   difficult terminology.

4. When discussing a plant, provide scientific name when
   relevant.

5. When discussing diseases, distinguish:
   - disease
   - pest
   - nutrient deficiency
   - environmental/abiotic stress
   - physical damage

6. Never claim that a plant disease has been definitively
   diagnosed from a text description alone.

7. For plant health problems, explain:
   - possible causes
   - symptoms
   - how to distinguish causes
   - practical next steps
   - prevention

8. For fertilizers, do not automatically recommend a fixed
   dose without knowing crop, soil, growth stage and local
   recommendations.

9. Encourage soil testing when fertilizer decisions depend
   on soil nutrient status.

10. For agriculture questions, consider:
    - crop
    - growth stage
    - soil
    - climate
    - irrigation
    - pests
    - diseases

11. When useful, structure answers using headings,
    bullet points and tables.

12. If the user asks a comparison, clearly compare both
    subjects.

13. If the user asks for an exam answer, provide an
    exam-friendly answer.

14. If the user asks for an MCQ, provide the answer and
    a short explanation.

15. Do not invent scientific names, chemical information,
    disease names or agricultural recommendations.

16. Clearly indicate uncertainty when information is
    insufficient.

17. If weather data is supplied, use it when explaining
    weather-related plant or crop problems.

18. Always prioritize accuracy and plant safety.

`;


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    const text =
        messageInput.value.trim();

    if (!text && !selectedImage) {
        return;
    }


    /*
     * Display user message.
     */

    addUserMessage(
        text || "Please analyze this plant image."
    );


    /*
     * Clear input.
     */

    messageInput.value = "";

    autoResize();


    /*
     * Show typing.
     */

    showTyping();


    try {

        /*
         * Check whether this is a weather request.
         *
         * Weather can be answered directly through
         * Open-Meteo.
         */

        if (isWeatherQuestion(text)) {

            const weather =
                await getWeather();

            hideTyping();

            addBotMessage(weather);

            clearSelectedImage();

            return;
        }


        /*
         * Otherwise use your AI backend.
         */

        const response =
            await askAI(
                text,
                selectedImage
            );


        hideTyping();

        addBotMessage(response);

    }

    catch (error) {

        console.error(error);

        hideTyping();

        addBotMessage(`

            <h3>🌿 GreenTag AI</h3>

            <p>
                I couldn't connect to the AI service right now.
            </p>

            <div class="ai-section ai-warning">

                <div class="ai-section-title">
                    Check these things
                </div>

                Make sure your backend is running and that
                <strong>/api/chat</strong> is available.

            </div>

        `);
    }


    clearSelectedImage();
}


/* =========================================================
   ASK AI BACKEND
   ========================================================= */

async function askAI(message, image) {

    const payload = {
        message: message,
        topic: selectedTopic,
        system: SYSTEM_PROMPT,
        image: image ? image.data : null,
        imageType: image ? image.type : null
    };

    const response = await fetch(
        "https://phyto-mu.vercel.app/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

    const data = await response.json();

    console.log("Vercel response:", data);

    if (!response.ok) {
        throw new Error(
            data.error ||
            `API error: ${response.status}`
        );
    }

    if (data.reply) {
        return formatAIResponse(data.reply);
    }

    if (data.message) {
        return formatAIResponse(data.message);
    }

    throw new Error("The AI service returned no reply.");
}

/* =========================================================
   FORMAT AI RESPONSE
   ========================================================= */

function formatAIResponse(text) {

    /*
     * Convert basic Markdown into HTML.
     */

    let html =
        escapeHTML(text);


    /*
     * Bold.
     */

    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Headings.
     */

    html =
        html.replace(
            /^### (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    /*
     * Bullet points.
     */

    html =
        html.replace(
            /^\- (.*)$/gm,
            "• $1"
        );


    /*
     * New lines.
     */

    html =
        html.replace(
            /\n\n/g,
            "<br><br>"
        );


    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;
}


/* =========================================================
   WEATHER DETECTION
   ========================================================= */

function isWeatherQuestion(text) {

    if (!text) {
        return false;
    }


    const words = [

        "weather",
        "forecast",
        "temperature",
        "rain",
        "rainfall",
        "humidity",
        "wind",
        "sunlight",
        "climate",
        "today's weather",
        "tomorrow's weather"

    ];


    return words.some(
        word =>
            text.toLowerCase().includes(word)
    );
}


/* =========================================================
   WEATHER
   ========================================================= */

async function getWeather() {

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${weatherLatitude}` +
        `&longitude=${weatherLongitude}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=auto`;


    const response =
        await fetch(url);


    if (!response.ok) {

        throw new Error(
            "Weather service failed."
        );
    }


    const data =
        await response.json();
console.log(data);

    const current =
        data.current;

    const daily =
        data.daily;


    const description =
        weatherCodeDescription(
            current.weather_code
        );


    return `

        <h3>☀️ Weather Information</h3>

        <div class="ai-section">

            <div class="ai-section-title">
                🌡️ Temperature
            </div>

            ${current.temperature_2m}°C

        </div>


        <div class="ai-section">

            <div class="ai-section-title">
                🌦️ Condition
            </div>

            ${description}

        </div>


        <div class="ai-section">

            <div class="ai-section-title">
                💧 Humidity
            </div>

            ${current.relative_humidity_2m}%

        </div>


        <div class="ai-section">

            <div class="ai-section-title">
                🌧️ Rain probability
            </div>

            ${daily.precipitation_probability_max[0]}%

        </div>


        <div class="ai-section">

            <div class="ai-section-title">
                💨 Wind
            </div>

            ${current.wind_speed_10m} km/h

        </div>


        <p>
            Weather conditions can affect irrigation,
            disease development, pest activity and crop growth.
        </p>

    `;
}


/* =========================================================
   WEATHER CODE
   ========================================================= */

function weatherCodeDescription(code) {

    const codes = {

        0: "Clear sky ☀️",

        1: "Mainly clear 🌤️",

        2: "Partly cloudy ⛅",

        3: "Overcast ☁️",

        45: "Fog 🌫️",

        48: "Rime fog 🌫️",

        51: "Light drizzle 🌦️",

        53: "Moderate drizzle 🌦️",

        55: "Dense drizzle 🌧️",

        61: "Light rain 🌦️",

        63: "Moderate rain 🌧️",

        65: "Heavy rain 🌧️",

        71: "Light snow ❄️",

        73: "Moderate snow ❄️",

        75: "Heavy snow ❄️",

        80: "Light rain showers 🌦️",

        81: "Moderate rain showers 🌧️",

        82: "Heavy rain showers 🌧️",

        95: "Thunderstorm ⛈️",

        96: "Thunderstorm with hail ⛈️",

        99: "Thunderstorm with heavy hail ⛈️"

    };


    return (
        codes[code] ||
        "Unknown weather condition"
    );
}


/* =========================================================
   USER MESSAGE
   ========================================================= */

function addUserMessage(text) {

    const message =
        document.createElement("div");


    message.className =
        "message user";


    message.innerHTML = `

        <div class="avatar">
            👤
        </div>

        <div class="message-body">

            <div class="sender">
                You
            </div>

            <div class="bubble">

                ${escapeHTML(text)}

                ${
                    selectedImage
                    ? `
                        <br><br>
                        📷 Plant image attached
                      `
                    : ""
                }

            </div>

        </div>

    `;


    chatBox.appendChild(message);

    scrollBottom();
}


/* =========================================================
   BOT MESSAGE
   ========================================================= */

function addBotMessage(text) {

    const message =
        document.createElement("div");


    message.className =
        "message bot";


    message.innerHTML = `

        <div class="avatar">
            🌿
        </div>

        <div class="message-body">

            <div class="sender">
                GreenTag AI
            </div>

            <div class="bubble">

                ${text}

            </div>

        </div>

    `;


    chatBox.appendChild(message);

    scrollBottom();
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function askSuggestion(question) {

    messageInput.value =
        question;

    sendMessage();
}


/* =========================================================
   TOPIC SELECTION
   ========================================================= */

topics.forEach(
    topic => {

        topic.addEventListener(
            "click",
            () => {

                topics.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                topic.classList.add(
                    "active"
                );


                selectedTopic =
                    topic.dataset.topic;


                /*
                 * Put a small notification in the chat.
                 */

                addBotMessage(`

                    <p>
                        🌿 <strong>${escapeHTML(
                            topic.textContent
                        )}</strong> mode selected.
                    </p>

                    <p>
                        Ask your question and I will
                        focus the response on this area.
                    </p>

                `);

            }
        );

    }
);


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

imageButton.addEventListener(
    "click",
    () => {

        imageInput.click();

    }
);


imageInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image file."
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload = function(e) {

            selectedImage = {

                data:
                    e.target.result,

                type:
                    file.type,

                name:
                    file.name

            };


            previewImage.src =
                e.target.result;


            imagePreview.classList.remove(
                "hidden"
            );

        };


        reader.readAsDataURL(file);

    }
);


/* =========================================================
   REMOVE IMAGE
   ========================================================= */

removeImage.addEventListener(
    "click",
    clearSelectedImage
);


function clearSelectedImage() {

    selectedImage = null;

    imageInput.value = "";

    previewImage.src = "";

    imagePreview.classList.add(
        "hidden"
    );
}


/* =========================================================
   VOICE INPUT
   ========================================================= */

let recognition = null;

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    recognition.onstart =
        function() {

            micButton.classList.add(
                "recording"
            );

        };


    recognition.onend =
        function() {

            micButton.classList.remove(
                "recording"
            );

        };


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0].transcript;


            messageInput.value =
                transcript;


            autoResize();

        };


    recognition.onerror =
        function() {

            micButton.classList.remove(
                "recording"
            );

        };


    micButton.addEventListener(
        "click",
        () => {

            try {

                recognition.start();

            }

            catch(error) {

                console.log(error);

            }

        }
    );

}

else {

    micButton.addEventListener(
        "click",
        () => {

            alert(
                "Voice input is not supported by this browser."
            );

        }
    );

}


/* =========================================================
   TEXTAREA
   ========================================================= */

messageInput.addEventListener(
    "input",
    autoResize
);


function autoResize() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


/* =========================================================
   ENTER TO SEND
   ========================================================= */

messageInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   SEND BUTTON
   ========================================================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* =========================================================
   CLEAR CHAT
   ========================================================= */

clearChat.addEventListener(
    "click",
    () => {

        if (
            !confirm(
                "Clear this conversation?"
            )
        ) {

            return;

        }


        chatBox.innerHTML = "";


        addBotMessage(`

            <h3>🌿 Fresh conversation</h3>

            <p>
                Your GreenTag AI conversation has been
                cleared.
            </p>

            <p>
                Ask me anything about plants, botany,
                agriculture or horticulture.
            </p>

        `);

    }
);


/* =========================================================
   TYPING
   ========================================================= */

function showTyping() {

    typing.classList.remove(
        "hidden"
    );

    scrollBottom();
}


function hideTyping() {

    typing.classList.add(
        "hidden"
    );
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollBottom() {

    setTimeout(
        () => {

            chatContainer.scrollTop =
                chatContainer.scrollHeight;

        },
        50
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    if (!value) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

console.log(
    "🌿 GreenTag AI initialized."
);

console.log(
    "Topic:",
    selectedTopic
);
