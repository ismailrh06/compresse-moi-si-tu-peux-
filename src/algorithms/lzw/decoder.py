# src/algorithms/lzw/decoder.py
from typing import ByteString, List
import struct

MAX_DICT_SIZE = 1 << 16  # même valeur que dans encoder


def _bytes_to_codes(data: ByteString) -> List[int]:
    """
    Convertit un flux de bytes (suite de codes 16 bits big-endian)
    en liste d'entiers.
    """
    if len(data) % 2 != 0:
        raise ValueError("Flux LZW invalide : longueur impaire.")

    codes = []
    for i in range(0, len(data), 2):
        (code,) = struct.unpack(">H", data[i:i + 2])
        codes.append(code)
    return codes


def decoder(data: ByteString) -> bytes:
    """
    Décompression LZW : bytes (codes 16 bits big-endian) -> bytes originaux.
    """
    if not data:
        return b""

    codes = _bytes_to_codes(data)
    if not codes:
        return b""

    # Dictionnaire initial : 0..255 -> bytes([i])
    dict_size = 256
    dictionary = {i: bytes([i]) for i in range(256)}

    # Premier code
    first_code = codes[0]
    if first_code not in dictionary:
        raise ValueError(f"Premier code LZW invalide : {first_code}")

    w = dictionary[first_code]
    result = bytearray(w)

    for k in codes[1:]:
        if k in dictionary:
            entry = dictionary[k]
        elif k == dict_size:
            # Cas spécial LZW : séquence = w + premier octet de w
            entry = w + w[:1]
        else:
            raise ValueError(f"Code LZW invalide pendant la décompression : {k}")

        result.extend(entry)

        # Ajout au dictionnaire : w + premier octet de entry
        if dict_size < MAX_DICT_SIZE:
            dictionary[dict_size] = w + entry[:1]
            dict_size += 1

        w = entry

    return bytes(result)
