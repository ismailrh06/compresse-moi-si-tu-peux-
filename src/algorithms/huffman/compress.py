from collections import Counter
from .encoder import HuffmanEncoder


def _bits_to_bytes_stream(bit_iter):
    out = bytearray()
    current = 0
    count = 0

    for bit in bit_iter:
        current = (current << 1) | bit
        count += 1

        if count == 8:
            out.append(current)
            current = 0
            count = 0

    padding = (8 - count) % 8
    if count:
        out.append(current << padding)

    return bytes(out), padding


def huffman_compress(data: bytes) -> bytes:
    freq = Counter(data)

    encoder = HuffmanEncoder(freq)
    bit_stream = encoder.encode_bits(data)

    compressed, padding = _bits_to_bytes_stream(bit_stream)

    out = bytearray()

    # nombre de symboles
    out += len(freq).to_bytes(2, "big")

    # table de fréquence
    for sym, fr in freq.items():
        out.append(sym)               # 1 byte
        out += fr.to_bytes(4, "big")  # 4 bytes

    out.append(padding)
    out += compressed

    return bytes(out)
