const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/apiError");

const SYSTEM_PROMPT = `
Bạn là một huấn luyện viên ảo bên trong ứng dụng phòng gym.  
Quy tắc:
- Chỉ tập trung trong phạm vi gym: giáo án tập luyện, kỹ thuật bài tập, kiến thức dinh dưỡng cơ bản, phục hồi, động lực tập luyện.
- Không đưa ra chẩn đoán y khoa hoặc lời khuyên nguy hiểm.
- Giữ câu trả lời thực tế và thân thiện với người mới bắt đầu.
- Mặc định trả lời ngắn gọn, nhưng nếu người dùng muốn chi tiết, hãy cung cấp kế hoạch có cấu trúc và đầy đủ.
- Nếu người dùng hỏi ngoài phạm vi gym, hãy lịch sự điều hướng lại chủ đề về thể hình/thể dục.
`.trim();

const RETRYABLE_PROVIDER_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const MIN_OUTPUT_TOKENS = 512;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeModelList() {
  const models = [env.openrouter.model, ...(env.openrouter.fallbackModels || [])]
    .map((model) => String(model || "").trim())
    .filter(Boolean);

  return [...new Set(models)];
}

function buildEndpoint() {
  const baseUrl = String(env.openrouter.baseUrl || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
  return `${baseUrl}/chat/completions`;
}

function createPayload(model, message, maxOutputTokens) {
  return {
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: maxOutputTokens,
  };
}

function extractMessageContent(content) {
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const combined = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        return "";
      })
      .filter((text) => text.trim())
      .join("\n")
      .trim();

    if (combined) {
      return combined;
    }
  }

  return null;
}

function extractAnswer(responseData) {
  const content = responseData?.choices?.[0]?.message?.content;
  const text = extractMessageContent(content);
  if (text) {
    return text;
  }

  return "Mình có thể hỗ trợ lịch tập, kỹ thuật tập và chế độ dinh dưỡng. Bạn có thể hỏi chi tiết hơn nhé.";
}

function parseAxiosError(error, model) {
  const providerStatus = error?.response?.status || null;
  const providerMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Unknown error";

  if (providerStatus === 401 || providerStatus === 403) {
    return new ApiError(502, "OpenRouter authentication failed. Please check OPENROUTER_API_KEY.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (providerStatus === 402) {
    return new ApiError(402, "OpenRouter credits are insufficient. Please top up or use another model.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (providerStatus === 404) {
    return new ApiError(500, `OpenRouter model '${model}' is not available. Please check OPENROUTER_MODEL.`, {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (providerStatus === 400 || providerStatus === 422) {
    return new ApiError(400, "Invalid request sent to OpenRouter.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (providerStatus && RETRYABLE_PROVIDER_STATUS.has(providerStatus)) {
    return new ApiError(503, "AI service is temporarily unavailable. Please try again in a moment.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (error?.code === "ECONNABORTED") {
    return new ApiError(504, "AI service timeout. Please try again.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  if (error?.code === "ENOTFOUND" || error?.code === "ECONNRESET" || error?.code === "EAI_AGAIN") {
    return new ApiError(503, "AI service network error. Please try again.", {
      model,
      providerStatus,
      providerMessage,
    });
  }

  return new ApiError(500, "Failed to get AI response.", {
    model,
    providerStatus,
    providerMessage,
  });
}

function shouldRetry(error) {
  return error?.statusCode === 503 || error?.statusCode === 504;
}

function buildOutputTokenPlan(maxOutputTokens, attemptCount) {
  const plan = [Math.max(MIN_OUTPUT_TOKENS, maxOutputTokens)];

  while (plan.length < attemptCount) {
    const previous = plan[plan.length - 1];
    const reduced = Math.max(MIN_OUTPUT_TOKENS, Math.floor(previous * 0.75));
    plan.push(reduced);
  }

  return plan;
}

async function requestOpenRouter(model, message, maxOutputTokens) {
  const endpoint = buildEndpoint();
  const payload = createPayload(model, message, maxOutputTokens);
  const headers = {
    Authorization: `Bearer ${env.openrouter.apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.clientUrl,
    "X-Title": env.openrouter.appName,
  };

  const response = await axios.post(endpoint, payload, {
    headers,
    timeout: env.openrouter.timeoutMs,
  });

  return extractAnswer(response.data);
}

async function askGymAssistant(message) {
  if (!env.openrouter.apiKey) {
    throw new ApiError(500, "OpenRouter API key is missing");
  }

  const models = normalizeModelList();
  if (models.length === 0) {
    throw new ApiError(500, "OpenRouter model is missing");
  }

  let lastError = null;
  const attemptCount = Math.max(1, env.openrouter.maxRetries + 1);
  const outputTokenPlan = buildOutputTokenPlan(env.openrouter.maxOutputTokens, attemptCount);

  for (const model of models) {
    for (let attempt = 0; attempt < attemptCount; attempt += 1) {
      try {
        const maxOutputTokens = outputTokenPlan[attempt] || env.openrouter.maxOutputTokens;
        return await requestOpenRouter(model, message, maxOutputTokens);
      } catch (error) {
        const mappedError = parseAxiosError(error, model);
        lastError = mappedError;

        const isLastTry = attempt >= attemptCount - 1;
        if (!shouldRetry(mappedError) || isLastTry) {
          break;
        }

        const backoffMs = 400 * (attempt + 1);
        await sleep(backoffMs);
      }
    }
  }

  throw lastError || new ApiError(500, "Failed to get AI response");
}

module.exports = {
  askGymAssistant,
};
