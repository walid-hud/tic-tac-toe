# Code Cleanup and Simplification Plan

## Overview

This document outlines a plan to clean up and simplify the tic-tac-toe game code by fixing bugs, removing duplication, improving type safety, and better organizing the code structure.

## Issues Identified

### Critical Bugs

1. **Duplicate event listeners** (lines 123-125)
   - `cell.addEventListener("click", handle_click)` is called three times
   - This causes cells to fire events multiple times when clicked
   - **Fix**: Remove duplicate calls, keep only one event listener

2. **Unused SVG cloning** (lines 9-18)
   - Cross and circle SVGs are cloned but never used
   - CSS handles display via `data-mark` attributes, so cloning is unnecessary
   - **Fix**: Remove unused SVG cloning code

### Code Quality Issues

1. **Type Safety**
   - `cell_click_handlers` uses `any[]` instead of proper type
   - **Fix**: Use proper TypeScript type: `((this: HTMLElement, ev: MouseEvent) => void)[]`

2. **Code Duplication**
   - Sound effect playing repeated 5 times with same pattern
   - Player opacity updates duplicated in `mark_cell`
   - Score update logic duplicated in `check_winner`
   - Cell reset logic duplicated in `reset_game` and `continue_game`

3. **Logic Simplification**
   - `mark_cell` uses two separate `if` statements instead of `if-else`
   - `check_winner` has redundant variable assignments (`winning_row`, `has_combination`)
   - `disable_all_cells` sets `dataset.mark = "disabled"` but this works correctly due to truthy check

4. **Code Organization**
   - Empty lines (91-92) that serve no purpose
   - Constants and state variables scattered throughout file
   - Could benefit from better grouping

## Refactoring Approach

### 1. Fix Critical Bugs

- Remove duplicate `addEventListener` calls (keep only one at line 123)
- Remove unused SVG cloning code (lines 9-18)

### 2. Extract Helper Functions

Create reusable helper functions to reduce duplication:

#### `playSound(audio: HTMLAudioElement)`
```typescript
function playSound(audio: HTMLAudioElement) {
  audio.currentTime = 0;
  audio.play();
}
```
- Replaces 5 instances of sound effect playing code
- Usage: `playSound(click_sfx)`, `playSound(win_sfx)`, `playSound(draw_sfx)`

#### `updatePlayerOpacity(player: "O" | "X")`
```typescript
function updatePlayerOpacity(player: "O" | "X") {
  if (player === "O") {
    player_1.style.opacity = "0.7";
    player_2.style.opacity = "1";
  } else {
    player_2.style.opacity = "0.7";
    player_1.style.opacity = "1";
  }
}
```
- Centralizes player opacity logic from `mark_cell`
- Updates both players' opacity based on current player

#### `updateScore(player: "O" | "X")`
```typescript
function updateScore(player: "O" | "X") {
  if (player === "O") {
    player_1_score_value++;
    player_1_score.textContent = player_1_score_value.toString();
    show_result(player, player_1_score_value);
  } else {
    player_2_score_value++;
    player_2_score.textContent = player_2_score_value.toString();
    show_result(player, player_2_score_value);
  }
}
```
- Handles score increments and display updates
- Reduces duplication in `check_winner`

#### `resetGameBoard()`
```typescript
function resetGameBoard() {
  cells.forEach((cell) => {
    cell.dataset.mark = "";
    cell.style.cursor = "pointer";
  });
  player_1_path = [];
  player_2_path = [];
}
```
- Shared cell reset logic between `reset_game` and `continue_game`
- Can be called by both functions with different score handling

### 3. Improve Type Safety

- Replace `any[]` with proper type for `cell_click_handlers`
- Use TypeScript types throughout for better type checking

### 4. Simplify Logic

#### `mark_cell` Simplification
- Convert two separate `if` statements to `if-else`
- Use helper functions for opacity and score updates

#### `check_winner` Simplification
- Remove redundant `winning_row` variable
- Remove redundant `has_combination` boolean (use `winning_combo` directly)
- Use helper function for score updates

Before:
```typescript
let winning_row: number[] = [];
const winning_combo = winning_combinations.find(...);
if (winning_combo) {
  winning_row = winning_combo;
}
const has_combination = Boolean(winning_combo);
```

After:
```typescript
const winning_combo = winning_combinations.find(...);
if (winning_combo) {
  await highlight_win(winning_combo);
  // ...
}
```

### 5. Code Organization

- Group related constants at the top:
  - Sound effects
  - DOM elements
  - Game state variables
- Add brief section comments for clarity
- Keep function order logical:
  1. Initialization helpers
  2. Game logic functions
  3. UI helpers
  4. Animation/effect helpers

## Implementation Checklist

- [x] Fix duplicate event listeners (remove lines 124-125)
- [ ] Remove unused SVG cloning code (lines 9-18)
- [ ] Create `playSound()` helper function
- [ ] Create `updatePlayerOpacity()` helper function
- [ ] Create `updateScore()` helper function
- [ ] Create `resetGameBoard()` helper function
- [ ] Fix type safety: replace `any[]` with proper type
- [ ] Simplify `mark_cell` (convert to if-else, use helpers)
- [ ] Simplify `check_winner` (remove redundant variables)
- [ ] Reorganize code structure with better grouping
- [ ] Remove empty lines (91-92)
- [ ] Test all functionality to ensure refactoring didn't break anything

## Files to Modify

- `src/main.ts` - Main refactoring target

## Testing

After refactoring, verify:
- [ ] Game starts correctly
- [ ] Cells can be clicked (only once per cell)
- [ ] Player turns switch correctly
- [ ] Win detection works for all combinations
- [ ] Draw detection works when board is full
- [ ] Score increments correctly
- [ ] Reset button resets scores and board
- [ ] Continue button preserves scores but resets board
- [ ] Sound effects play correctly
- [ ] Win animation plays correctly
- [ ] Modal displays correctly for wins and draws

## Expected Benefits

1. **Reduced code size**: ~30-40 lines of code removed through deduplication
2. **Better maintainability**: Changes to sound effects, scoring, or board reset only need to be made in one place
3. **Improved type safety**: Better TypeScript support and fewer runtime errors
4. **Cleaner logic**: Simplified conditionals and removed redundant code
5. **Fixed bugs**: Eliminated duplicate event listeners that caused multiple triggers

