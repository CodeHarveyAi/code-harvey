// File: /app/lib/openaiutils.js

export async function rewriteStructureOnly(config) {
  try {
    // Ensure the model defaults to your fine-tuned GPT-3.5 if not provided
    if (!config.model) {
      config.model = 'ft:gpt-3.5-turbo-0125:code-harvey:harvs-v1:BZlX0oSv';
    }

    console.log('[rewriteStructureOnly] ⚙️ Config object:', config); // Log before stringify
    console.log('[rewriteStructureOnly] 📤 Request config:', JSON.stringify(config, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    console.log('[rewriteStructureOnly] 📥 Response status:', response.status);
    console.log('[rewriteStructureOnly] 📥 Response headers:', response.headers);

    let json;
    try {
      json = await response.json();
      console.log('[rewriteStructureOnly] 📥 Full response JSON:', JSON.stringify(json, null, 2));
    } catch (parseErr) {
      const fallbackText = await response.text();
      console.error('[rewriteStructureOnly] ❌ Failed to parse JSON. Raw response:', fallbackText);
      throw new Error(`Non-JSON response: ${fallbackText}`);
    }

    if (!response.ok) {
      if (response.status === 429) {
        console.error('[rewriteStructureOnly] ❌ Rate limit exceeded');
      }
      console.error('[rewriteStructureOnly] ❌ API Error:', json.error || 'Unknown API error');
      return '';
    }

    if (!json.choices || !json.choices[0]?.message?.content) {
      console.error('[rewriteStructureOnly] ❌ Unexpected response structure');
      return '';
    }

    const content = json.choices[0].message.content?.trim() || '';
    console.log('[rewriteStructureOnly] ✅ Extracted content:', content);

    return content;

  } catch (err) {
    console.error('[rewriteStructureOnly] ❌ Exception:', err.message);
    console.error('[rewriteStructureOnly] ❌ Full error:', err);
    return '';
  }
}