"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { BookOpen, QrCode, Barcode as BarcodeIcon, Info } from "lucide-react";

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6 sm:py-10">
      <motion.h1
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold sm:mb-10 sm:text-4xl"
      >
        Informations & Théorie
      </motion.h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">

        {/* QR CODE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <QrCode size={28} className="text-blue-300" />
            <h2 className="text-xl font-semibold sm:text-2xl">QR Code</h2>
          </div>

          <p className="text-white/70 mb-6">
            Ce QR code permet d’accéder directement à la documentation ou à la
            page officielle du projet.
          </p>

          <div className="flex justify-center">
            <QRCodeSVG
              value="https://github.com/ismael/compressemos"
              size={160}
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
          className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <BarcodeIcon size={28} className="text-purple-300" />
            <h2 className="text-xl font-semibold sm:text-2xl">Code-barres</h2>
          </div>

          <p className="text-white/70 mb-6">
            Le code-barres représente une version encodée d’un identifiant de
            fichier ou d’un hash.
          </p>

          <div className="overflow-x-auto">
            <div className="flex min-w-max justify-center px-2">
              <Barcode
                value="COMPRESSEMOS-2025"
                width={1.6}
                height={72}
                background="transparent"
                lineColor="#ffffff"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* THEORIE */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:mt-14 sm:p-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-emerald-300" />
          <h2 className="text-2xl font-semibold sm:text-3xl">Théorie des algorithmes</h2>
        </div>

        <div className="space-y-10">

          {/* HUFFMAN */}
          <section>
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl">🔵 Huffman</h3>
            <p className="text-white/70 leading-relaxed">
              Huffman est un algorithme de compression basé sur la fréquence
              d’apparition des symboles. Il produit un arbre binaire
              optimal permettant d’encoder les caractères les plus fréquents
              avec moins de bits.
            </p>
          </section>

          {/* LZW */}
          <section>
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl">🟣 LZW</h3>
            <p className="text-white/70 leading-relaxed">
              LZW (Lempel-Ziv-Welch) utilise un dictionnaire construit 
              dynamiquement. Plus les motifs se répètent, plus la compression
              devient efficace.
            </p>
          </section>

          {/* RLE */}
          <section>
            <h3 className="mb-3 text-xl font-semibold sm:text-2xl">🟡 RLE</h3>
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

