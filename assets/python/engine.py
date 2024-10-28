

from utils import printb

# pos is just one piece


def can_take(pos, moves, my_board, enemy_board):
    colisions = moves & enemy_board
    if colisions:
         




def possible_moves(pos, is_king=False):
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


    


    


# # Initial board states
# start_b = 0b0101010110101010010101010000000000000000101010100101010110101010
# white_b = 0b0000000000000000000000000000000000000000101010100101010110101010
# black_b = 0b0101010110101010010101010000000000000000000000000000000000000000

# print("Start game")
# printb(start_b, "Initial Board:")

# # Find the possible moves for white pieces
# moves_white = possible_moves(white_b, black_b)

# print("Possible moves for white")
# check_collisions(moves_white, black_b)
