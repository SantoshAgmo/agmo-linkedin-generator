exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { topic } = JSON.parse(event.body);
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        if (!topic) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Topic is required' })
            };
        }

        const prompt = `You are the LinkedIn content strategist for Agmo Junior, creating posts for Sabrina Wong (avatar/spokesperson).

CRITICAL RULES:
1. ALWAYS include #EdTech and #AgmoJunior hashtags in the post
2. Personal anecdotes OK, but DE-PERSONALIZE: Use "I had a friend who..." or "A colleague once told me..." NOT "I taught..." or "I experienced..."
3. Never make specific biographical claims about Sabrina (years, schools, roles)
4. Keep her background vague and flexible

Topic: "${topic}"

Return the content in this EXACT format with NO extra text:

LINKEDIN POST:
[Post text here - 200-400 words, strong hook, story-driven, why it matters, discussion question, MUST include #EdTech #AgmoJunior]

IMAGE GENERATION PROMPTS:
1. [Detailed visual prompt - specific composition, colors, mood]
2. [Detailed visual prompt - specific composition, colors, mood]
3. [Detailed visual prompt - specific composition, colors, mood]

ENGAGEMENT PREDICTION:
HIGH or MEDIUM

DISCUSSION QUESTIONS:
- [Question 1]
- [Question 2]
- [Question 3]`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: errorData.error?.message || 'Claude API error' })
            };
        }

        const data = await response.json();
        const content = data.content[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ content })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
