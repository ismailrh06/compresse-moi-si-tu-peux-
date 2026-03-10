import heapq
# import tkinter as tk
import math

class Node:
    def __init__(self, char=None, freq=None):
        self.char = char
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

    def __eq__(self, value):
        return self.freq == value.freq

    def is_leaf(self):
        return self.left is None and self.right is None


class HuffmanTree(Node):
    def __init__(self, freq_table: dict):
        self.freq_table = freq_table

    def build_tree(self):
        priority_queue = [Node(char, freq) for char, freq in self.freq_table.items()]
        heapq.heapify(priority_queue)

        while len(priority_queue) > 1:
            left = heapq.heappop(priority_queue)
            right = heapq.heappop(priority_queue)

            merged = Node(freq=left.freq + right.freq)
            merged.left = left
            merged.right = right

            heapq.heappush(priority_queue, merged)

        return priority_queue[0] if priority_queue else None
