from utils import printb

LETTERS = {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 3,
    'e': 4,
    'f': 5,
    'g': 6,
    'h': 7
}


class Game:

    board = 0b0101010110101010010101010000000000000000101010100101010110101010
    bottom_player = 0b0000000000000000000000000000000000000000101010100101010110101010
    top_player = 0b0101010110101010010101010000000000000000000000000000000000000000
    left_edge = 0b1111111011111110111111101111111011111110111111101111111011111110
    right_edge = 0b0111111101111111011111110111111101111111011111110111111101111111

    def possible_moves(self, pos, is_king=False):
        left_edge = 0b1000000010000000100000001000000010000000100000001000000010000000
        right_edge = 0b0000000100000001000000010000000100000001000000010000000100000001

        moves = 0
        if not is_king:
            if pos & left_edge:
                moves |= (pos << 7)
            elif pos & right_edge:
                moves |= (pos << 9)
            else:
                moves |= (pos << 7)
                moves |= (pos << 9)
            return moves

        else:
            if pos & left_edge:
                moves |= (pos << 7) | (pos >> 9)
            elif pos & right_edge:
                moves |= (pos << 9) | (pos >> 7)
            else:
                moves |= (pos << 7) | (pos >> 9)
                moves |= (pos << 9) | (pos >> 7)
        return moves

    def check_input(self, move):
        if move == "":
            return False
        letters = 'abcdefg'
        numbers = "12345678"
        if move[0] not in letters and move[2] not in letters:
            return False
        if move[1] not in numbers and move[3] not in numbers:
            return False
        # the number 9223372036854775808 is 1 with 63 zeros to be shifted 1000000000000000000...
        # from position
        if not (9223372036854775808 >> LETTERS[move[0]] >> 8 * (int(move[1]) - 1) & self.bottom_player):
            return False
        # To position
        if (9223372036854775808 >> LETTERS[move[2]] >> 8 * (int(move[3])-1) & self.board):
            return False
        return True

    def get_user_imput(self):
        printb(self.board, "Position")
        move = ""
        while not self.check_input(move):
            print("The input is not valid:")
            move = input("Enter the positions as axby: ")
        return move

    def convert_move(self, move):
        pos = 0b1000000000000000000000000000000000000000000000000000000000000000
        from_pos = pos >> LETTERS[move[0]] >> 8 * (int(move[1])-1)
        to_pos = pos >> LETTERS[move[2]] >> 8 * (int(move[3])-1)
        printb(from_pos, "from:")
        printb(to_pos, "to:")


if __name__ == "__main__":
    game = Game()
    move = game.get_user_imput()
    game.convert_move(move)
