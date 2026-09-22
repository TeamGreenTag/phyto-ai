require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

// ===============================
// CORS
// ===============================

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(express.static(__dirname));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(express.static(__dirname));

const PHYTO_INSTRUCTIONS =
    "You are PHYTO, an intelligent AI assistant specializing in plants, botany, agriculture, horticulture and plant science. " +
    "Answer questions about botany, plant anatomy, morphology, physiology, taxonomy, genetics, breeding, ecology, biotechnology, " +
    "agriculture, horticulture, crops, irrigation, soil, fertilizers, pests, insects, plant diseases, nutrient deficiencies, " +
    "plant identification, gardening, plant care, weather effects on plants and agricultural exams. " +
    "When a user provides a plant image, analyze visible characteristics and provide a likely identification, but do not claim " +
    "100 percent certainty when the image is insufficient. " +
    "For plant problems, consider disease, pests, nutrient deficiency, nutrient toxicity, water stress, temperature stress, " +
    "sun damage, physical damage and soil problems. Do not present uncertain diagnoses as confirmed diagnoses. " +
    "For fertilizers and pesticides, avoid giving blindly fixed doses without knowing the plant, product, concentration, " +
    "growth stage and application method. " +
    "Give clear, friendly and practical answers. Use headings and bullet points when useful. " +
    "You are PHYTO.";

if (!process.env.OPENAI_API_KEY) {
    console.log("WARNING: OPENAI_API_KEY is missing from .env");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {

    try {

        const message = req.body.message || "";
        const history = Array.isArray(req.body.history)
            ? req.body.history
            : [];

        const image = req.body.image || null;
        const imageType = req.body.imageType || "image/jpeg";

        if (!message.trim() && !image) {
            return res.status(400).json({
                error: "Please enter a message or upload an image."
            });
        }

        const input = [];

        for (const item of history) {

            if (!item || !item.content) {
                continue;
            }

            if (item.role === "user") {
                input.push({
                    role: "user",
                    content: String(item.content)
                });
            }

            if (item.role === "assistant") {
                input.push({
                    role: "assistant",
                    content: String(item.content)
                });
            }
        }

        const currentContent = [];

        if (message.trim()) {
            currentContent.push({
                type: "input_text",
                text: message.trim()
            });
        }

        if (image) {

            let imageData = image;

            if (!image.startsWith("data:")) {
                imageData =
                    "data:" +
                    imageType +
                    ";base64," +
                    image;
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

        console.log("PHYTO is thinking...");

        const response = await openai.responses.create({
            model: MODEL,
            instructions: PHYTO_INSTRUCTIONS,
            input: input,
            max_output_tokens: 2000
        });

        const reply =
            response.output_text ||
            "Sorry, PHYTO could not generate a response.";

        console.log("PHYTO replied.");

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error("PHYTO ERROR:");
        console.error(error);

        res.status(500).json({
            error:
                error.message ||
                "PHYTO could not connect to the AI service."
        });
    }
});

app.get("/api/health", (req, res) => {

    res.json({
        status: "ok",
        chatbot: "PHYTO",
        model: MODEL
    });
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index3.html")
    );
});

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log("          PHYTO AI");
    console.log("================================");
    console.log("Server: http://localhost:" + PORT);
    console.log("Model: " + MODEL);
    console.log("================================");
    console.log("");

});