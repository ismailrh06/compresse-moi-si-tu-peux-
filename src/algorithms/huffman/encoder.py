from .tree import HuffmanTree

class HuffmanEncoder:
    def __init__(self, freq_table: dict):
        self.tree = HuffmanTree(freq_table)
        self.root = self.tree.build_tree()   # 1 seule fois
        self.codes = {}

    def _generate_codes(self, node, code):
        if node is None:
            return
        if node.is_leaf():
            self.codes[node.char] = code or "0"
            return

        self._generate_codes(node.left, code + "0")
        self._generate_codes(node.right, code + "1")

    def build_codes(self):
        if not self.codes:
            self._generate_codes(self.root, "")

    def encode(self, text: str) -> str:
        self.build_codes()
        return "".join(self.codes[ch] for ch in text)

    def encode_bits(self, data: bytes):
        """Génère un flux d'entiers 0/1 à partir de bytes."""
        self.build_codes()
        for b in data:
            code = self.codes[b]
            for bit in code:
                yield 1 if bit == "1" else 0
