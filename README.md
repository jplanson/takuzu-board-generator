# takuzu-board-generator

This is a Typescript implementation of a takuzu board solver and generator developed for the backend of www.puzzle-hub.com.
The generateBoard() function uses RNG to start populating the board, but ensures that placed values follow the constraints
of a valid takuzu board. Once a valid board has been generated, the carve() function is called to remove a percentage of the
values on the board. Each time the carving function removes a new tile, canSolve() is called on the updated board to ensure
the it can still be solved without guessing. Instead of using recursion to solve the board via brute-force, the solver 
completes the board as a human would. It attempts to use simple rules such as wrapTwos() or breakThrees() as often as possible,
until it has no options left and must call eliminateImpossibilities(). This function is more computationally intensive, but 
it permutes all possible combinations of 1s or 0s in the empty spaces of a given row or column, and looks for a common feature
in each of the permutations that does not cause the board to break the rules of takuzu.
