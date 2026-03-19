"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Crown,
  Medal,
  RefreshCcw,
  Target,
  Timer,
  Trophy,
  Users,
} from "lucide-react";

import { api, type LeaderboardEntry, type LeaderboardResponse } from "@/lib/api";

function formatDifficulty(difficulty: string) {
  if (difficulty === "easy") return "Facile";
  if (difficulty === "medium") return "Moyen";
  if (difficulty === "hard") return "Difficile";
  return difficulty;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function podiumIcon(rank: number) {
  if (rank === 1) return <Crown size={18} />;
  if (rank === 2) return <Medal size={18} />;
  return <Trophy size={18} />;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLeaderboard() {
    setLoading(true);
    setError("");

    try {
      const response = await api.getLeaderboard(20);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger le classement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  const podium = data?.entries.slice(0, 3) ?? [];
  const others = data?.entries.slice(3) ?? [];

  return (
    <div className="px-6 py-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-6xl"
      >
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/15 via-white/8 to-cyan-500/15 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/75">
                <Trophy size={14} />
                Classement global
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">Les meilleurs joueurs du site</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                Compare les scores des clients sur le jeu Huffman et vise la première place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void loadLeaderboard()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium transition hover:bg-white/15"
              >
                <RefreshCcw size={16} />
                Actualiser
              </button>
              <Link
                href="/game-huffman"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                <Target size={16} />
                Jouer maintenant
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<Users size={16} />} label="Joueurs classés" value={data?.total_players ?? 0} />
            <MetricCard icon={<Trophy size={16} />} label="Scores soumis" value={data?.total_submissions ?? 0} />
            <MetricCard
              icon={<Crown size={16} />}
              label="Meilleur score"
              value={data?.entries[0]?.score ?? "—"}
            />
            <MetricCard
              icon={<Timer size={16} />}
              label="Dernière mise à jour"
              value={data ? new Date(data.updated_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">
            <AlertTriangle size={18} className="text-red-300" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            Chargement du classement…
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {podium.map((entry) => (
                <motion.div
                  key={`${entry.player_name}-${entry.rank}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl border p-5 shadow-lg backdrop-blur-xl ${
                    entry.rank === 1
                      ? "border-amber-300/40 bg-amber-400/15"
                      : entry.rank === 2
                      ? "border-slate-300/30 bg-slate-200/10"
                      : "border-orange-300/30 bg-orange-400/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                        {podiumIcon(entry.rank)}
                        Rang {entry.rank}
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">{entry.player_name}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-xs uppercase tracking-[0.14em] text-white/55">Score</div>
                      <div className="text-3xl font-extrabold">{entry.score}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/80">
                    <InfoChip label="Niveau" value={formatDifficulty(entry.difficulty)} />
                    <InfoChip label="Précision" value={`${entry.accuracy}%`} />
                    <InfoChip label="Temps" value={formatDuration(entry.elapsed_seconds)} />
                    <InfoChip label="Erreurs" value={entry.errors} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl">
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="text-xl font-semibold">Top 20</h2>
              </div>

              {data && data.entries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm text-white/85">
                    <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-white/50">
                      <tr>
                        <th className="px-5 py-4">Rang</th>
                        <th className="px-5 py-4">Joueur</th>
                        <th className="px-5 py-4">Score</th>
                        <th className="px-5 py-4">Niveau</th>
                        <th className="px-5 py-4">Précision</th>
                        <th className="px-5 py-4">Temps</th>
                        <th className="px-5 py-4">Erreurs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...podium, ...others].map((entry) => (
                        <tr key={`${entry.player_name}-${entry.rank}-table`} className="border-t border-white/8">
                          <td className="px-5 py-4 font-semibold">#{entry.rank}</td>
                          <td className="px-5 py-4">{entry.player_name}</td>
                          <td className="px-5 py-4 font-bold text-emerald-200">{entry.score}</td>
                          <td className="px-5 py-4">{formatDifficulty(entry.difficulty)}</td>
                          <td className="px-5 py-4">{entry.accuracy}%</td>
                          <td className="px-5 py-4">{formatDuration(entry.elapsed_seconds)}</td>
                          <td className="px-5 py-4">{entry.errors}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-10 text-center text-white/55">
                  Aucun score enregistré pour le moment. Sois le premier à jouer.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/55">
        {icon}
        {label}
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/50">{label}</div>
      <div className="mt-1 font-medium text-white">{value}</div>
    </div>
  );
}
