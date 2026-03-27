"use client";

interface Props {
  assistMode: boolean;
  onStart: () => void;
  onToggleAssist: () => void;
}

const STEPS = [
  {
    icon: "📦",
    color: "border-sky-400/50 bg-sky-500/10",
    title: "Des objets arrivent",
    desc: "Ils s'accumulent en piles par type. Si la file dépasse 20 → danger !",
  },
  {
    icon: "🎯",
    color: "border-yellow-400/50 bg-yellow-500/10",
    title: "Sélectionne une pile",
    desc: "Clique dessus ou appuie sur 1 / 2 / 3 / 4 pour choisir le type cible.",
  },
  {
    icon: "💥",
    color: "border-fuchsia-400/50 bg-fuchsia-500/10",
    title: "Lance COMPRESS",
    desc: "Appuie sur C (ou Espace). Il faut au moins 2 objets du même type.",
  },
  {
    icon: "🐲",
    color: "border-emerald-400/50 bg-emerald-500/10",
    title: "Le monstre mange",
    desc: "Il dévore les snacks compressés automatiquement. Stock vide = frustration !",
  },
];

const COMMANDS = [
  { key: "C / Espace", icon: "💥", name: "COMPRESS", desc: "Compresse le type sélectionné" },
  { key: "X",         icon: "⛓️", name: "CHAIN",    desc: "Compresse TOUS les types d'un coup (cooldown)" },
  { key: "D",         icon: "🍖", name: "DEVOUR",   desc: "Avale tout le stock → ×3 points (cooldown)" },
  { key: "B",         icon: "💣", name: "BLAST",    desc: "Détruit le type cible (même 1 seul objet)" },
  { key: "W",         icon: "🧘", name: "WAIT",     desc: "Pause 3 ticks + frustration −20" },
];

export default function HowToPlay({ assistMode, onStart, onToggleAssist }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-white/50">Comment jouer</p>
        <h2 className="text-2xl font-black text-white">La boucle de jeu en 4 étapes</h2>
      </div>

      {/* Steps flow */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <div key={i} className="relative">
            {/* Arrow connector */}
            {i < STEPS.length - 1 && (
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 hidden lg:block text-white/30 text-xl font-black">
                →
              </div>
            )}
            <div className={`rounded-2xl border p-4 h-full space-y-3 ${step.color}`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs font-black text-white/50 uppercase tracking-wider">Étape {i + 1}</span>
              </div>
              <p className="font-bold text-white text-sm">{step.title}</p>
              <p className="text-xs text-white/60 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Win / lose conditions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 space-y-1">
          <p className="text-emerald-300 font-bold text-sm">✅ Pour gagner des points</p>
          <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
            <li>Compresse de gros groupes → bonus de taille</li>
            <li>Enchaîne plusieurs compressions vite → Combo</li>
            <li>Combo ×3 → 🔥 FRENZY (points ×1.7 pendant 6s)</li>
            <li>DEVOUR le stock plein → ×3 points instantané</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 space-y-1">
          <p className="text-red-300 font-bold text-sm">💀 Comment perdre</p>
          <ul className="text-xs text-white/70 space-y-1 list-disc list-inside">
            <li>File d'attente dépasse 20 objets → frustration</li>
            <li>Stock de snacks vide → monstre frustré</li>
            <li>Frustration atteint 100% → Game Over</li>
          </ul>
        </div>
      </div>

      {/* Commands cheatsheet */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-cyan-400 font-mono">⌘ Raccourcis clavier</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {COMMANDS.map((cmd) => (
            <div
              key={cmd.key}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <span className="text-lg">{cmd.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-300 font-bold">[{cmd.key}]</span>
                  <span className="text-xs font-bold text-white">{cmd.name}</span>
                </div>
                <p className="text-xs text-white/50">{cmd.desc}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-lg">🔢</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-300 font-bold">[1–4]</span>
                <span className="text-xs font-bold text-white">SÉLECTIONNER</span>
              </div>
              <p className="text-xs text-white/50">Change le type cible sans compresser</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode + Start */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <button
          onClick={onToggleAssist}
          className={`rounded-2xl border px-6 py-3 text-sm font-semibold transition ${
            assistMode
              ? "border-emerald-300/60 bg-emerald-400/20 text-emerald-100"
              : "border-white/20 bg-white/5 text-white/60"
          }`}
        >
          {assistMode ? "🤝 Mode Assisté (ON)" : "💪 Mode Normal (OFF)"}
          <span className="ml-2 text-xs opacity-70">— cliquer pour changer</span>
        </button>
        <button
          onClick={onStart}
          className="flex-1 sm:flex-none rounded-2xl border border-fuchsia-300/50 bg-fuchsia-500/20 px-10 py-3 text-base font-black text-white transition hover:bg-fuchsia-500/35 hover:scale-[1.02]"
        >
          ▶️ DÉMARRER — Appuie sur Entrée
        </button>
      </div>
    </div>
  );
}
