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

async function postForm(path: string, formData: FormData) {
  const urls = buildApiCandidates(path);
  let lastNetworkError: Error | null = null;

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
        throw new Error(json.error || json.detail || "Erreur serveur.");
      }

      return json;
    } catch (error) {
      // On retente uniquement en cas d'erreur réseau
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    lastNetworkError?.message ||
      "Impossible de contacter le serveur de compression. Vérifiez que le backend est lancé."
  );
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const urls = buildApiCandidates(path);
  let lastNetworkError: Error | null = null;

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
        throw new Error(json.error || json.detail || "Erreur serveur.");
      }

      return json as T;
    } catch (error) {
      if (error instanceof TypeError) {
        lastNetworkError = error;
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    lastNetworkError?.message ||
      "Impossible de contacter le serveur. Vérifiez que le backend est lancé."
  );
}

export const api = {
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
};
