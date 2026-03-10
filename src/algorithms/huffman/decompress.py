from .decoder import HuffmanDecoder


def _bytes_to_bits(data: bytes, padding: int) -> str:
    bits = "".join(f"{b:08b}" for b in data)
    return bits[:-padding] if padding else bits


def huffman_decompress(data: bytes) -> bytes:
    """
    Reçoit des bytes compressés.
    Retourne les bytes originaux.
    """

    idx = 0

    # nombre de symboles
    count = int.from_bytes(data[idx:idx+2], "big")
    idx += 2

    freq = {}

    for _ in range(count):
        sym = data[idx]
        idx += 1

        fr = int.from_bytes(data[idx:idx+4], "big")
        idx += 4

        freq[sym] = fr

    padding = data[idx]
    idx += 1

    compressed_bytes = data[idx:]

    bits = _bytes_to_bits(compressed_bytes, padding)

    decoder = HuffmanDecoder(freq)
    return decoder.decode(bits)
