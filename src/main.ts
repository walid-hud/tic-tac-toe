import { confetti } from "@tsparticles/confetti";
import { gsap } from "gsap";
function fire_confetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

let cross = document
  .querySelector<SVGElement>(".ttt-cross")!
  .cloneNode(true) as SVGAElement;
let circle = document
  .querySelector<SVGElement>(".ttt-circle")!
  .cloneNode(true) as SVGAElement;
cross.style.position = "absolute";
circle.style.position = "absolute";
cross.style.top = "-10px";
circle.style.top = "-10px";
const game_menu = document.querySelector<HTMLElement>(".game-menu")!;
const start_btn = document.querySelector<HTMLButtonElement>(".start-button")!;
const continue_btn =
  document.querySelector<HTMLButtonElement>(".continue-btn")!;
const reset_btn = document.querySelector<HTMLButtonElement>(".reset-btn")!;

const game_container = document.querySelector<HTMLElement>(".game")!;
game_container.style.display = "none";
const player_1 = document.querySelector<HTMLElement>(".player-1")!;
const player_1_score = document.querySelector<HTMLElement>(".player-1-score")!;
const player_2 = document.querySelector<HTMLElement>(".player-2")!;
const player_2_score = document.querySelector<HTMLElement>(".player-2-score")!;
const cells = document.querySelectorAll<HTMLElement>(".cell")!;

const result_modal = document.querySelector<HTMLElement>(".result-modal")!;
gsap.set(result_modal, { opacity: 0, scale: 0 });

function show_result(winner: string, score: number) {
  fire_confetti();
  gsap.to(result_modal, {
    scale: 1,
    opacity: 1,
    ease: "power4.in",
    onComplete: () => {
      result_modal.style.backdropFilter = " brightness(0.3)";
    },
  });
}
const winning_combinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let player_1_score_value = 0;
let player_2_score_value = 0;
start_btn.addEventListener("click", start_game);
let player_1_path: number[] = [];
let player_2_path: number[] = [];
let current_player: "O" | "X";
function start_game() {
  game_menu.style.display = "none";
  game_container.style.display = "grid";
  current_player = get_starting_player();
  if (current_player === "O") {
    player_2.style.opacity = "0.7";
  } else {
    player_1.style.opacity = "0.7";
  }
  cells.forEach((cell, index) => {
    cell.addEventListener("click", function handle_click() {
      if (cell.dataset.mark) {
        return;
      }
      mark_cell(cell, current_player);
    });
  });

  reset_btn.addEventListener("click", reset_game);

  continue_btn.addEventListener("click", continue_game);
}

function reset_game() {
  cells.forEach((cell) => {
    cell.dataset.mark = "";
    cell.style.cursor = "pointer";
  });
  player_1_path = [];
  player_2_path = [];
  player_1_score_value = 0;
  player_2_score_value = 0;
  player_1_score.textContent = "0";
  player_2_score.textContent = "0";
  result_modal.style.backdropFilter = " none";
  gsap.to(result_modal, {
    scale: 0,
    opacity: 0,
    ease: "power4.out",
  });
  start_game();
}
function continue_game() {
  cells.forEach((cell) => {
    cell.removeEventListener("click", () => {});
    cell.setAttribute("cellIndex", "");
    cell.dataset.mark = "";
    cell.style.cursor = "pointer";
  });
  player_1_path = [];
  player_2_path = [];
  player_1_score.textContent = "0";
  player_2_score.textContent = "0";
  result_modal.style.backdropFilter = " none";
  gsap.to(result_modal, {
    scale: 0,
    opacity: 0,
    ease: "power4.out",
  });
  start_game();
}
function get_starting_player() {
  return Math.random() < 0.5 ? "X" : "O";
}
function mark_cell(cell: HTMLElement, player: string) {
  cell.style.cursor = "not-allowed";
  if (player === "O") {
    player_1.style.opacity = "0.7";
    player_2.style.opacity = "1";
    cell.dataset.mark = "O";
    const cell_index = parseInt(cell.getAttribute("cellIndex")!);
    player_1_path.push(cell_index);
    current_player = "X";
    check_winner("O", player_1_path, player_1_score, player_1_score_value);
  }
  if (player === "X") {
    player_2.style.opacity = "0.7";
    player_1.style.opacity = "1";
    cell.dataset.mark = "X";
    const cell_index = parseInt(cell.getAttribute("cellIndex")!);
    player_2_path.push(cell_index);
    current_player = "O";
    check_winner("X", player_2_path, player_2_score, player_2_score_value);
  }
}

function check_winner(
  player: "O" | "X",
  path: number[],
  score_element: HTMLElement,
  current_score: number
) {
  const has_combination = winning_combinations.some((combo) =>
    combo.every((num) => path.includes(num))
  );
  if (has_combination) {
    current_score += 1;
    score_element.textContent = current_score.toString();
    show_result(player, current_score);
  } else if (player_1_path.length + player_2_path.length === 9) {
    show_result("draw", 0);
  }
  return;
}
