from .tree import HuffmanTree

class HuffmanDecoder:
    def __init__(self, freq_table: dict):
        self.tree = HuffmanTree(freq_table)
        self.root = self.tree.build_tree()

    def decode(self, bits: str) -> bytes:
        if self.root is None:
            return b""

        if self.root.is_leaf():
            return bytes([self.root.char] * len(bits))

        node = self.root
        out = bytearray()

        for b in bits:
            node = node.left if b == "0" else node.right

            if node.is_leaf():
                out.append(node.char)
                node = self.root

        return bytes(out)
