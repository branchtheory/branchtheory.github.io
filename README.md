This ain't a readme.

# Roadmap
## Auto-fill and colour grid
### Set up
* Need proper push and pull functions for grid.
* Will also need a standard pairs object. 
### Method
* Trigger: If a) all three small cells of a grid element hae some data in, b) One of the cells is selected, and c) THEN that cell is clicked out of (so that the input for none of the 3 cells is selected any more)
* Action: Check whether the grid item is currently paired with any other grid item. If it is paired, check whether that pairing still obtains. If the pairing obtains, do nothing; if not, uncolour both this cell and its pair. If the cell is not paired (either because it's been unpaired, or was not paired to begin with), check whether the data in the small cells makes this grid item pair up with any other unpaired grid item. If so: 1) auto-fill the small cells of the other grid item, 2) colour both grid items. 
- Nice quick one to start with: Grid auto influences crunched numbers (selected, rejected). Updates to the grid reflect too.
## - Proper push and pull functions for the grid, strip and crunched
Push and pull from crunched only activates after it's created.
## Auto-fill of strip if there's only one option
## Better handling of strip being incorrect. Currently just says 'no solution for this puzzle'

# Bugs
* Small cells are editable in the solved state

# What the buttons should do
## Solve
* Saves the current states of the grid, line and crunched - not implemented
* Solves the puzzle
* Makes everything uneditable - implemented, but defect with the small cells in the grid
## Unsolve
* Restores the saved states of the grid, line and crunched from solved
## Clear all
* Clears everything


# Test puzzles

[48,11,12,30,24,13,14,27,26,15,16,28,36,22,23,49]
[null,null,null,2,3,3,null,6,7,null,9,null,null,null,null,null]

[380,36,308,96,48,350,33,279,252,78,270,57,81,296,39,260]
[3,4,null,6,7,null,null,null,20,null,null,null,50,74,null,null]

[490,32,220,77,61,240,49,168,150,46,255,31,88,228,53,492]
[2,3,4,null,null,12,null,15,null,null,null,null,null,57,null,null]



# UI

- Tap on an option in the crunched factors to select it. Tap a second time to reject it. Tap again to reset to ‘unused’. If selected:
    - Highlight it, and its pair
    - Add its numbers (if possible) to the line
    - Add its numbers to the grid
    - Highlight the grid and the line accordingly items
- Button above crunched numbers to push those selections to the grid.
- Stuff populated in the grid gets pushed to the crunched numbers by default (though it can be overridden?? Think it can't be overridden — that probably creates confusion. Options that would cause the crunched to contradict the grid would stop being clickable. So you have a button that lets you push new stuff into the grid, but you can't contradict it.)
- Button to order grid numerically
- Working number line — all numbers from all in rejected pairs
- Take a picture of the puzzle and automatic optical conversion
    - Kind of data heavy. May need to warn, or to only download that bit of the page once someone tries to use the feature
- Get hints
- ‘known but unplaced’ line numbers
- [x]  Mobile: The numbers in the crunched area can be too wide for the screen. See the default!
- [x]  Mobile: 2- and 3-digit numbers are too big for the line boxes
- [x]  On mobile we should force numbering rather than numbers? Is that possible?

# Logic

- The 0s should be nulls?
- Bake in testing
- Singles can be called independently

## Deduction logic

- Function that checks which of the various bits of logic (brute force, etc.) can been applied, and returns the new version with some description of what's happened
- If an operand appears the exact number of times in the number line as in the pairs, then pair.
- If an operand cannot possibly appear in the line, remove the pairs
    - Too big
    - Too small
    - No gap
- If an operand appears in all of a grid item’s potential pairs, then it can only be that
- If an operation appears in of a grid’s potential items, then it can only be that
- When placing a 1 in the line, always place it to the furthest left.
