const OpenAI = require("openai");

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

const PHYTO_INSTRUCTIONS = `
You are PHYTO, an intelligent AI assistant specializing in plants, botany,
agriculture, horticulture and plant science.

Answer questions about:
- botany
- plant anatomy
- morphology
- physiology
- taxonomy
- genetics
- breeding
- ecology
- biotechnology
- agriculture
- horticulture
- crops
- irrigation
- soil
- fertilizers
- pests
- insects
- plant diseases
- nutrient deficiencies
- plant identification
- gardening
- plant care
- weather effects on plants
- agricultural exams

When a user provides a plant image, analyze visible characteristics and provide
a likely identification, but do not claim 100 percent certainty when the image
is insufficient.

For plant problems, consider disease, pests, nutrient deficiency, nutrient
toxicity, water stress, temperature stress, sun damage, physical damage and
soil problems.

Do not present uncertain diagnoses as confirmed diagnoses.

For fertilizers and pesticides, avoid blindly fixed doses without knowing the
plant, product, concentration, growth stage and application method.

Give clear, friendly and practical answers.

You are PHYTO.
`;

module.exports = async (req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            message = "",
            history = [],
            image = null,
            imageType = "image/jpeg"
        } = req.body || {};

        if (!String(message).trim() && !image) {
            return res.status(400).json({
                error: "Please enter a message or upload an image."
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is not configured in Vercel."
            });
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });

        const input = [];

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

        const currentContent = [];

        if (String(message).trim()) {

            currentContent.push({
                type: "input_text",
                text: String(message).trim()
            });

        }

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

        const response =
            await openai.responses.create({
                model: MODEL,
                instructions: PHYTO_INSTRUCTIONS,
                input: input,
                max_output_tokens: 2000
            });

        return res.status(200).json({

            reply:
                response.output_text ||
                "Sorry, PHYTO could not generate a response."

        });

    } catch (error) {

        console.error("PHYTO ERROR:", error);

        return res.status(500).json({

            error:
                error.message ||
                "PHYTO could not connect to the AI service."

        });
    }
};