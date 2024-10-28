import unittest
from engine import possible_moves
from utils import printb


import unittest


class TestPossibleMovesFunction(unittest.TestCase):

    def test_possible_moves_left_edge(self):
        white_board = 0b0000000000000000000000000000000000000000000000000000000010000000
        after_shift = 0b0000000000000000000000000000000000000000000000000100000000000000
        modified = possible_moves(white_board, is_king=False)
        self.assertEqual(modified, after_shift,
                         "Failed: Non-king piece on the left edge didn't shift correctly.")

    def test_possible_moves_right_edge(self):
        white_board = 0b0000000000000000000000000000000000000000000000000000000100000000
        after_shift = 0b0000000000000000000000000000000000000000000000100000000000000000
        modified = possible_moves(white_board, is_king=False)
        self.assertEqual(modified, after_shift,
                         "Failed: Non-king piece on the right edge didn't shift correctly.")

    def test_possible_moves_center(self):
        white_board = 0b0000000000000000000000000000000000000000000010000000000000000000
        after_shift = (0b0000000000000000000000000000000000010000000000000000000000000000 |
                       0b0000000000000000000000000000000000000100000000000000000000000000)
        modified = possible_moves(white_board, is_king=False)
        printb(white_board)
        printb(after_shift)
        printb(modified)
        self.assertEqual(modified, after_shift,
                         "Failed: Non-king piece in the center didn't shift correctly.")

    def test_possible_moves_left_edge_king(self):
        white_board = 0b0000000000000000000000000000000000000000000000000000000100000000
        after_shift = (0b0000000000000000000000000000000000000000000000100000000000000000 |
                       0b0000000000000000000000000000000000000000000000000000000000000010)
        modified = possible_moves(white_board, is_king=True)
        self.assertEqual(modified, after_shift,
                         "Failed: King piece on the left edge didn't shift correctly.")

    def test_possible_moves_right_edge_king(self):
        white_board = 0b0000000000000000000000000000000000000000000000001000000000000000
        after_shift = (0b0000000000000000000000000000000000000000010000000000000000000000 |
                       0b0000000000000000000000000000000000000000000000000000000001000000)
        modified = possible_moves(white_board, is_king=True)
        self.assertEqual(modified, after_shift,
                         "Failed: King piece on the right edge didn't shift correctly.")

    def test_possible_moves_center_king(self):
        white_board = 0b0000000000000000000000000000000000000000000010000000000000000000
        after_shift = (0b0000000000000000000000000000000000010000000000000000000000000000 |
                       0b0000000000000000000000000000000000000100000000000000000000000000 |
                       0b0000000000000000000000000000000000000000000000000001000000000000 |
                       0b0000000000000000000000000000000000000000000000000000010000000000)
        modified = possible_moves(white_board, is_king=True)
        self.assertEqual(modified, after_shift,
                         "Failed: King piece in the center didn't shift correctly.")


# Run the tests
if __name__ == "__main__":
    unittest.main()
