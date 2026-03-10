"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { BookOpen, QrCode, Barcode as BarcodeIcon, Info } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="text-white px-6 py-10">
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-10"
      >
        Informations & Théorie
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* QR CODE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <QrCode size={28} className="text-blue-300" />
            <h2 className="text-2xl font-semibold">QR Code</h2>
          </div>

          <p className="text-white/70 mb-6">
            Ce QR code permet d’accéder directement à la documentation ou à la
            page officielle du projet.
          </p>

          <div className="flex justify-center">
            <QRCodeSVG
              value="https://github.com/ismael/compressemos"
              size={180}
              bgColor="transparent"
              fgColor="#ffffff"
              level="H"
            />
          </div>
        </motion.div>

        {/* BARCODE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarcodeIcon size={28} className="text-purple-300" />
            <h2 className="text-2xl font-semibold">Code-barres</h2>
          </div>

          <p className="text-white/70 mb-6">
            Le code-barres représente une version encodée d’un identifiant de
            fichier ou d’un hash.
          </p>

          <div className="flex justify-center">
            <Barcode
              value="COMPRESSEMOS-2025"
              width={2}
              height={80}
              background="transparent"
              lineColor="#ffffff"
            />
          </div>
        </motion.div>
      </div>

      {/* THEORIE */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-14 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-emerald-300" />
          <h2 className="text-3xl font-semibold">Théorie des algorithmes</h2>
        </div>

        <div className="space-y-10">

          {/* HUFFMAN */}
          <section>
            <h3 className="text-2xl font-semibold mb-3">🔵 Huffman</h3>
            <p className="text-white/70 leading-relaxed">
              Huffman est un algorithme de compression basé sur la fréquence
              d’apparition des symboles. Il produit un arbre binaire
              optimal permettant d’encoder les caractères les plus fréquents
              avec moins de bits.
            </p>
          </section>

          {/* LZW */}
          <section>
            <h3 className="text-2xl font-semibold mb-3">🟣 LZW</h3>
            <p className="text-white/70 leading-relaxed">
              LZW (Lempel-Ziv-Welch) utilise un dictionnaire construit 
              dynamiquement. Plus les motifs se répètent, plus la compression
              devient efficace.
            </p>
          </section>

          {/* RLE */}
          <section>
            <h3 className="text-2xl font-semibold mb-3">🟡 RLE</h3>
            <p className="text-white/70 leading-relaxed">
              RLE (Run Length Encoding) compresse en remplaçant les séquences 
              répétées par un compteur, idéal pour les images simples ou les 
              longues répétitions.
            </p>
          </section>

        </div>
      </motion.div>
    </div>
  );
}

