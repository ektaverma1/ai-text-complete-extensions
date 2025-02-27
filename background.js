console.log("Background script loaded!");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in background:", request);

  if (request.type === "getCompletion") {
    fetchCompletion(request.text)
      .then((completion) => {
        console.log("Success - sending completion:", completion);
        sendResponse({ completion });
      })
      .catch((error) => {
        console.error("Error in fetchCompletion:", error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

async function fetchCompletion(text) {
  console.log("Starting API call with text:", text);
  const API_KEY =
    "YOUR_API_KEY";

  try {
    const requestBody = {
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an autocomplete assistant. Respond only with natural continuations of the user's text, 3-10 words max. No explanations or punctuation at the end.",
        },
        {
          role: "user",
          content: "I love",
        },
        {
          role: "assistant",
          content: "spending time with my family and friends",
        },
        {
          role: "user",
          content: "The best way to",
        },
        {
          role: "assistant",
          content: "learn is by doing it yourself",
        },
        {
          role: "user",
          content: text,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
      top_p: 0.9,
    };

    console.log("About to make API call with:", JSON.stringify(requestBody));

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "HTTP-Referer": chrome.runtime.getURL(""),
          "X-Title": "Chrome Extension - AI Text Autocomplete",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Response not OK:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API response:", data);

    // debug the response format
    console.log("Full API response structure:", JSON.stringify(data, null, 2));

    // Check for choices array format
    if (!data.choices || !data.choices[0]) {
      console.error("No choices in API response:", data);
      throw new Error("No choices in API response");
    }

    // Extract completion based on provider (OpenRouter works with different APIs)
    let completion = "";

    if (data.choices[0].message && data.choices[0].message.content) {
      completion = data.choices[0].message.content.trim();
    } else if (data.choices[0].text) {
      completion = data.choices[0].text.trim();
    } else if (data.completion) {
      completion = data.completion.trim();
    } else {
      console.error("Could not find completion in response:", data);
      throw new Error("Could not find completion in response");
    }

    console.log("Initial completion:", completion);

    if (!completion) {
      console.log("Empty completion received, using fallback completions");
      const fallbacks = {
        "the best way to": "improve your skills is through practice",
        "i want to": "learn more about this topic",
        "how can i": "get started with this project",
        "when will": "this be available to everyone",
        "where is": "the documentation for this feature",
        "why does": "this happen so frequently",
        "i think": "we should consider all options",
        "we need": "to focus on the main priorities",
        please: "provide more information about this",
        "could you": "explain how this works",
        "what if": "we tried a different approach",
        "is there": "a better way to solve this",
        "do you": "have any suggestions for improvement",
        "thanks for": "your help with this issue",
        "have you": "considered this alternative solution",
        "let me": "know what you think about this",
      };

      const matchedKey = Object.keys(fallbacks).find((key) =>
        text.toLowerCase().includes(key.toLowerCase())
      );

      if (matchedKey) {
        completion = fallbacks[matchedKey];
        console.log("Using matched fallback:", completion);
      } else {
        completion = "be completed with relevant information";
        console.log("Using generic fallback");
      }
    } else {
      completion = completion
        .replace(/^["']|["']$/g, "") // Remove surrounding quotes
        .replace(/^Complete:?\s*/i, "") // Remove "Complete:" prefix
        .replace(/^Continuation:?\s*/i, "") // Remove "Continuation:" prefix
        .replace(/^Here's a completion:?\s*/i, "") // Remove other common prefixes
        .replace(/^Here is a completion:?\s*/i, "") // Another common prefix
        .replace(/^I would complete this with:?\s*/i, "") // Another common prefix
        .replace(
          new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"),
          ""
        ) // Remove input text if repeated at start
        .split(/[.!?]\s/)[0] // Take only the first sentence
        .trim();
    }

    // Final validation
    if (!completion) {
      console.log("Still no valid completion after cleanup and fallbacks");
      return "complete this task efficiently";
    }

    console.log("Final processed completion:", completion);
    return completion;
  } catch (error) {
    console.error("API call failed:", {
      error,
      text,
      stack: error.stack,
    });

    // fallback completions on error
    console.log("Using fallback completion due to API error");

    const fallbackCompletions = {
      "how to": "solve this problem effectively",
      "the best": "option for most situations",
      "i want": "to learn more about this",
      "can you": "help me understand this concept",
      "when will": "this feature be available",
      "why is": "this happening so frequently",
      "what is": "the purpose of this function",
    };

    // Find a matching fallback
    const matchedPrefix = Object.keys(fallbackCompletions).find((prefix) =>
      text.toLowerCase().includes(prefix.toLowerCase())
    );

    if (matchedPrefix) {
      console.log(`Using matched fallback for "${matchedPrefix}"`);
      return fallbackCompletions[matchedPrefix];
    }

    // Default fallback based on text length
    if (text.length < 5) {
      return "continue with more information";
    } else {
      return "improve this with additional details";
    }
  }
}
