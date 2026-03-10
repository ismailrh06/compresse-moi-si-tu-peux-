from typing import ByteString
import struct

MAX_DICT_SIZE = 1 << 16  # 65536, codes 0..65535


def encoder(data: ByteString) -> bytes:
    if not data:
        return b""

    dict_size = 256
    dictionary = {bytes([i]): i for i in range(256)}

    w = b""
    result_codes = []

    for byte in data:
        c = bytes([byte])
        wc = w + c
        if wc in dictionary:
            w = wc
        else:
            # output code for w
            result_codes.append(dictionary[w])

            # add wc to the dictionary ONLY if we haven't reached max size
            if dict_size < MAX_DICT_SIZE:
                dictionary[wc] = dict_size
                dict_size += 1

            w = c

    if w:
        result_codes.append(dictionary[w])

    out = bytearray()
    for code in result_codes:
        out.extend(struct.pack(">H", code))  # 16 bits big-endian

    return bytes(out)
