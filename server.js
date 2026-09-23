require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(express.json({
    limit: "20mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "20mb"
}));

app.use(express.static(__dirname));


// =========================================================
// PHYTO SYSTEM INSTRUCTIONS
// =========================================================

const PHYTO_INSTRUCTIONS = `
You are PHYTO, the GreenTag AI assistant.

You specialize in:

- Botany
- Plant science
- Agriculture
- Horticulture
- Plant identification
- Plant anatomy
- Plant physiology
- Taxonomy
- Genetics
- Plant breeding
- Ecology
- Plant biotechnology
- Crops
- Irrigation
- Soil science
- Fertilizers
- Plant diseases
- Plant pests
- Nutrient deficiencies
- Gardening
- Plant care
- Agricultural exams

When a user provides a plant image, analyze visible characteristics and provide
a likely identification. Never claim 100% certainty when the image is insufficient.

For plant health problems, consider:

- Disease
- Pest
- Nutrient deficiency
- Nutrient toxicity
- Water stress
- Temperature stress
- Sun damage
- Physical damage
- Soil problems

Do not present uncertain diagnoses as confirmed diagnoses.

For fertilizers and pesticides, do not blindly give fixed doses without knowing
the plant, product, concentration, growth stage and application method.

Give clear, friendly and practical answers.

Use headings and bullet points when useful.

You are PHYTO.
`;


// =========================================================
// AI CHAT API
// =========================================================

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message = "",
            history = [],
            image = null,
            imageType = "image/jpeg",
            topic = "general"
        } = req.body || {};

        if (!String(message).trim() && !image) {
            return res.status(400).json({
                error: "Please enter a message or upload an image."
            });
        }

        const contents = [];

        // conversation history
        if (Array.isArray(history)) {
            for (const item of history) {
                if (!item || !item.content) continue;

                if (item.role === "user" || item.role === "assistant") {
                    contents.push({
                        role: item.role === "assistant" ? "model" : "user",
                        parts: [{ text: String(item.content) }]
                    });
                }
            }
        }

        // current message
        const parts = [];

        if (String(message).trim()) {
            parts.push({ text: String(message).trim() });
        }

        if (image) {
            // strip "data:image/xxx;base64," prefix if present
            const base64Data = String(image).startsWith("data:")
                ? String(image).split(",")[1]
                : image;

            parts.push({
                inlineData: {
                    mimeType: imageType,
                    data: base64Data
                }
            });
        }

        contents.push({ role: "user", parts });

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: contents,
            config: {
                systemInstruction:
                    PHYTO_INSTRUCTIONS + `\n\nCurrent topic: ${topic}`,
                maxOutputTokens: 2000
            }
        });

        const reply =
            response.text ||
            "Sorry, PHYTO could not generate a response.";

        return res.status(200).json({ reply: reply });

    } catch (error) {
        console.error("PHYTO ERROR:", error);
        return res.status(500).json({
            error: error.message || "PHYTO could not connect to the AI service."
        });
    }
});

        // -----------------------------------------------------
        // CONVERSATION HISTORY
        // -----------------------------------------------------

        if (Array.isArray(history)) {

            for (const item of history) {

                if (!item || !item.content) {
                    continue;
                }

                if (
                    item.role === "user" ||
                    item.role === "assistant"
                ) {

                    input.push({
                        role: item.role,
                        content: String(item.content)
                    });

                }

            }

        }


        // -----------------------------------------------------
        // CURRENT USER MESSAGE
        // -----------------------------------------------------

        const currentContent = [];


        if (String(message).trim()) {

            currentContent.push({
                type: "input_text",
                text: String(message).trim()
            });

        }


        // -----------------------------------------------------
        // IMAGE
        // -----------------------------------------------------

        if (image) {

            let imageData = image;

            if (!String(image).startsWith("data:")) {

                imageData =
                    `data:${imageType};base64,${image}`;

            }

            currentContent.push({

                type: "input_image",

                image_url: imageData

            });

        }


        input.push({

            role: "user",

            content: currentContent

        });


        // -----------------------------------------------------
        // OPENAI
        // -----------------------------------------------------

        const response =
            await openai.responses.create({

                model: MODEL,

                instructions:
                    PHYTO_INSTRUCTIONS +
                    `\n\nCurrent topic: ${topic}`,

                input: input,

                max_output_tokens: 2000

            });


        const reply =
            response.output_text ||
            "Sorry, PHYTO could not generate a response.";


        return res.status(200).json({

            reply: reply

        });



    try {
    // ... your async logic (openai/gemini call etc.)
} catch (error) {


        console.error("PHYTO ERROR:", error);

        return res.status(500).json({

            error:
                error.message ||
                "PHYTO could not connect to the AI service."

        });

    }

;


// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/api/health", (req, res) => {

    res.json({

        status: "ok",

        chatbot: "PHYTO",

        model: MODEL

    });

});


// =========================================================
// WEBSITE
// =========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index3.html")
    );

});


// =========================================================
// LOCAL DEVELOPMENT
// =========================================================

if (require.main === module) {

    const PORT =
        process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log(
            `PHYTO running at http://localhost:${PORT}`
        );

    });

}


// IMPORTANT FOR VERCEL

module.exports = app;