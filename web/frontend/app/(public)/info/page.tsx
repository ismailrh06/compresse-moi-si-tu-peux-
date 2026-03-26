"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  BookOpen,
  QrCode,
  GitBranch,
  BarChart3,
  Heart,
  ArrowRight,
} from "lucide-react";

const algorithms = [
  {
    id: "huffman",
    title: "Huffman",
    icon: GitBranch,
    color: "from-blue-500 to-cyan-500",
    accentColor: "text-blue-300",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    description:
      "Algorithme de compression sans perte basé sur la fréquence d'apparition des symboles.",
    theory: [
      "Crée un arbre binaire optimal où les caractères fréquents utilisent moins de bits",
      "Génère des codes de longueur variable (VLC - Variable Length Coding)",
      "Aucune perte de données - le décodage est exact et sans dégradation",
    ],
    useCase:
      "Idéal pour les fichiers texte, les documents, et tout type de données avec distribution fréquente inégale.",
    pros: ["Compression très efficace", "Optimal pour données textuelles", "Sans perte"],
    cons: ["Construction d'arbre coûteuse", "Nécessite transmettre le dictionnaire"],
    wiki: "https://fr.wikipedia.org/wiki/Codage_de_Huffman",
  },
  {
    id: "lzw",
    title: "LZW",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    accentColor: "text-purple-300",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    description:
      "Lempel-Ziv-Welch : compression dictionnaire adaptatif construit dynamiquement.",
    theory: [
      "Remplace les motifs répétés par des codes de dictionnaire plus courts",
      "Le dictionnaire se remplit automatiquement au fur et à mesure de la lecture",
      "Très efficace pour les données avec motifs répétitifs",
    ],
    useCase:
      "Parfait pour les images GIF, les fichiers compressés TIFF, et les données avec répétitions.",
    pros: ["Adaptation dynamique", "Bonne compression", "Rapide"],
    cons: ["Perte possible avec LZW adapté", "Espace mémoire variable"],
    wiki: "https://fr.wikipedia.org/wiki/Lempel-Ziv-Welch",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* HEADER */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Théorie & Concepts
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-300 sm:text-xl">
            Explorez en détail les algorithmes de compression et découvrez comment
            ils optimisent vos données pour réduire leur taille.
          </p>
        </motion.div>
      </div>

      {/* ALGORITHMS GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {algorithms.map((algo, index) => {
            const IconComponent = algo.icon;
            return (
              <motion.div
                key={algo.id}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group rounded-2xl border ${algo.borderColor} ${algo.bgColor} p-8 backdrop-blur-xl transition-all hover:border-opacity-100 hover:shadow-2xl`}
              >
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                  <div
                    className={`rounded-xl bg-gradient-to-br ${algo.color} p-3 shadow-lg`}
                  >
                    <IconComponent size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-400">0{index + 1}</span>
                </div>

                {/* TITLE & DESCRIPTION */}
                <h3 className="mb-3 text-2xl font-bold">{algo.title}</h3>
                <p className="mb-6 text-gray-300">{algo.description}</p>

                {/* THEORY POINTS */}
                <div className="mb-6 space-y-3 border-t border-white/10 pt-6">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase">Principes</h4>
                  {algo.theory.map((point, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className={`${algo.accentColor} mt-0.5 font-bold`}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* USE CASE */}
                <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-gray-400 mb-2">Cas d&apos;usage</p>
                  <p className="text-sm text-gray-300">{algo.useCase}</p>
                </div>

                {/* PROS & CONS */}
                <div className="grid gap-4 mb-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-green-400 mb-2">✓ Avantages</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {algo.pros.map((pro, i) => (
                        <li key={i}>• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-2">✗ Inconvénients</p>
                    <ul className="space-y-1 text-xs text-gray-300">
                      {algo.cons.map((con, i) => (
                        <li key={i}>• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <motion.a
                  href={algo.wiki}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 5 }}
                  className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r ${algo.color} px-4 py-2 text-sm font-semibold transition-all hover:shadow-lg w-full justify-center`}
                >
                  En savoir plus
                  <ArrowRight size={16} />
                </motion.a>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* COMPARISON SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-12">
          <h2 className="mb-8 text-3xl font-bold sm:text-4xl">
            Comparaison des Algorithmes
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-gray-300">Critère</th>
                  <th className="px-4 py-3 text-left font-semibold text-blue-300">Huffman</th>
                  <th className="px-4 py-3 text-left font-semibold text-purple-300">LZW</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {[
                  ["Vitesse", "Moyenne", "Rapide"],
                  ["Compression", "Excellente", "Bonne"],
                  ["Perte de données", "Non", "Non"],
                  ["Complexité", "Élevée", "Moyenne"],
                  ["Cas optimal", "Texte", "Motifs rép."],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-gray-300">{row[0]}</td>
                    <td className="px-4 py-3 text-blue-200">{row[1]}</td>
                    <td className="px-4 py-3 text-purple-200">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* RESOURCES SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* QR CODE */}
          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <QrCode size={24} className="text-blue-300" />
              </div>
              <h3 className="text-xl font-bold">Ressources</h3>
            </div>
            <p className="mb-8 text-gray-300">
              Scannez ce QR code pour accéder à la documentation complète du projet et
              à nos ressources éducatives.
            </p>
            <div className="flex justify-center rounded-xl bg-white/5 p-6">
              <QRCodeSVG
                value="https://compresse-moi-si-tu-peux.vercel.app/"
                size={200}
                bgColor="transparent"
                fgColor="#ffffff"
                level="H"
              />
            </div>
          </motion.div>

          {/* ABOUT */}
          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <BookOpen size={24} className="text-purple-300" />
              </div>
              <h3 className="text-xl font-bold">À propos</h3>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="font-semibold text-purple-300">Compresse-moi si tu peux</span> est une
                plateforme éducative dédiée à l&apos;exploration des algorithmes de compression.
              </p>
              <p>
                Notre objectif : démocratiser la compréhension des techniques modernes de
                réduction de données.
              </p>
              <div className="mt-6 flex items-center gap-2 text-pink-300">
                <Heart size={16} />
                <span className="text-sm">Conçu avec passion pour l&apos;informatique</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* FOOTER */}
      <div className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-gray-400">
          <p>
            © 2025 Compresse-moi si tu peux • Une exploration des algorithmes de compression
          </p>
        </div>
      </div>
    </div>
  );
}

