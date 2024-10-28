def printb(board, message=""):
    board = bin(board)[2:].zfill(64)
    board = board.replace("1", "ø").replace("0", ".")
    if message:
        print(message)
    print("\n   ----------------------")
    for c, i in enumerate(range(0, 64, 8)):
        print(f'{c+1}  {"  ".join(board[i:i+8])}')
    print("   ----------------------")
    print("   a  b  c  d  e  f  g  h\n")


def printbb(white, black, message=""):
    board = white | black
    board = bin(board)[2:].zfill(64)
    board = (board & white).replace("1", "o").replace("0", ".")
    board = board = (board & black).replace("1", "ø").replace("0", ".")
    if message:
        print(message)
    print("\n   ----------------------")
    for c, i in enumerate(range(0, 64, 8)):
        print(f'{c+1}  {"  ".join(board[i:i+8])}')
    print("   ----------------------")
    print("   a  b  c  d  e  f  g  h\n")
