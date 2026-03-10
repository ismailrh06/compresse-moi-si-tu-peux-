from collections import Counter
import math

def frequency_table(text: str):
    return Counter(text)


def entropy(freq_table: dict) -> float:
    total = sum(freq_table.values())
    H = 0

    for count in freq_table.values():
        p = count / total
        H -= p * math.log2(p)

    return H
