const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type LeaderboardEntry = {
  rank: number;
  player_name: string;
  score: number;
  steps: number;
  errors: number;
  elapsed_seconds: number;
  difficulty: string;
  accuracy: number;
  created_at: string;
};

export type LeaderboardResponse = {
  entries: LeaderboardEntry[];
  total_players: number;
  total_submissions: number;
  updated_at: string;
};

export type LeaderboardSubmission = {
  player_name: string;
  score: number;
  steps: number;
  errors: number;
  elapsed_seconds: number;
  difficulty: string;
  accuracy: number;
};

export type AuthPayload = {
  full_name: string;
  password: string;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatResponse = {
  reply: string;
};

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getRuntimeApiBaseUrl() {
  if (!API_URL) return "";

  if (typeof window === "undefined") {
    return API_URL;
  }

  try {
    const parsed = new URL(API_URL);

    // Si l'app est ouverte via IP réseau (ex: 192.168.x.x),
    // ne pas garder localhost côté navigateur client.
    if (isLocalHost(parsed.hostname) && !isLocalHost(window.location.hostname)) {
      parsed.hostname = window.location.hostname;
    }

    return parsed.origin;
  } catch {
    return API_URL;
  }
}

function buildApiCandidates(path: string) {
  const runtimeBase = getRuntimeApiBaseUrl();
  const candidates = [
    runtimeBase ? `${runtimeBase}/api/${path}` : "",
    `/api/${path}`,
  ].filter(Boolean);

  return Array.from(new Set(candidates));
}

function buildPublicErrorMessage(path: string) {
  if (path.startsWith("chat")) {
    return "Assistant IA temporairement indisponible. Réessayez dans quelques instants.";
  }

  if (path.startsWith("auth/")) {
    return "Service d'authentification temporairement indisponible.";
  }

  if (path.startsWith("compress") || path.startsWith("compare")) {
    return "Service de compression temporairement indisponible.";
  }

  if (path.startsWith("leaderboard")) {
    return "Classement temporairement indisponible.";
  }

  return "Service temporairement indisponible. Réessayez dans quelques instants.";
}

function getApiErrorMessage(path: string, payload: unknown) {
  const fallback = buildPublicErrorMessage(path);

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const detail = (payload as { detail?: unknown }).detail;
  const error = (payload as { error?: unknown }).error;
  const message = (payload as { message?: unknown }).message;

  if (typeof detail === "string" && detail.trim()) return detail;
  if (typeof error === "string" && error.trim()) return error;
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
}

async function postForm(path: string, formData: FormData) {
  const urls = buildApiCandidates(path);
  const publicMessage = buildPublicErrorMessage(path);

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const json = await response
        .json()
        .catch(() => ({ error: "Réponse serveur invalide." }));

      if (!response.ok) {
        console.error("API form error:", { path, url, status: response.status, payload: json });
        throw new Error(getApiErrorMessage(path, json));
      }

      return json;
    } catch (error) {
      // On retente uniquement en cas d'erreur réseau
      if (error instanceof TypeError) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    publicMessage
  );
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const urls = buildApiCandidates(path);
  const publicMessage = buildPublicErrorMessage(path);

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      const json = await response
        .json()
        .catch(() => ({ error: "Réponse serveur invalide." }));

      if (!response.ok) {
        console.error("API json error:", { path, url, status: response.status, payload: json });
        throw new Error(getApiErrorMessage(path, json));
      }

      return json as T;
    } catch (error) {
      if (error instanceof TypeError) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    publicMessage
  );
}

export const api = {
  signup: async (payload: AuthPayload) => {
    return requestJson<{ message: string; full_name: string }>("auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: AuthPayload) => {
    return requestJson<{ message: string; full_name: string }>("auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  compress: async (file: File, algorithm: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("algorithm", algorithm);

    return postForm("compress", formData);
  },

  compare: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return postForm("compare", formData);
  },

  getLeaderboard: async (limit = 20) => {
    return requestJson<LeaderboardResponse>(`leaderboard?limit=${limit}`, {
      method: "GET",
    });
  },

  submitLeaderboard: async (payload: LeaderboardSubmission) => {
    return requestJson<{ message: string; entry: LeaderboardEntry }>("leaderboard/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  chat: async (messages: ChatMessage[]) => {
    return requestJson<ChatResponse>("chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  },
};
