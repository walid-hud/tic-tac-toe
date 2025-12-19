import { confetti } from "@tsparticles/confetti";
import { gsap } from "gsap";

//sound effects
const draw_sfx = document.querySelector("#pencil-sfx")! as HTMLAudioElement;
const win_sfx = document.querySelector("#win-sfx")! as HTMLAudioElement;
const click_sfx = document.querySelector("#click-sfx")! as HTMLAudioElement;
function play_sound(audio : HTMLAudioElement){
  audio.currentTime = 0;
  audio.play()
}



// game elements
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
const winner_label = document.querySelector<HTMLElement>(".winner-label")!;
const winner_icon = document.querySelector<HTMLElement>(".winner-icon")!;
const result_score = document.querySelector<HTMLElement>(".result-score")!;
const winner_label_p1 = winner_label.querySelector<HTMLElement>("p:first-child")!;
const winner_label_p2 = winner_label.querySelector<HTMLElement>("p:last-child")!;

function show_result(winner: string, score: number) {
  if (winner === "draw") {
    winner_label_p1.textContent = "It's";
    winner_label_p2.textContent = "a draw!";
    winner_icon.style.display = "none";
    result_score.textContent = "-";
  } else {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    winner_label_p1.textContent = "player";
    winner_label_p2.textContent = "won";
    winner_icon.dataset.mark = winner;
    winner_icon.style.display = "block";
    result_score.textContent = score.toString();
  }

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
reset_btn.addEventListener("click", reset_game);
continue_btn.addEventListener("click", continue_game);
let player_1_path: number[] = [];
let player_2_path: number[] = [];



let current_player: "O" | "X";
// this stores the click event handler functions so that we can remove them later  
let cell_click_handlers :any[] = [];
function start_game() {
  play_sound(click_sfx)
  game_menu.style.display = "none";
  game_container.style.display = "grid";
  current_player = get_starting_player();
  if (current_player === "O") {
    player_2.style.opacity = "0.7";
  } else {
    player_1.style.opacity = "0.7";
  }
  // remove old event listeners, this prevents duplicate function calls
  cells.forEach((cell, index) => {
    if (cell_click_handlers[index]) {
      cell.removeEventListener("click", cell_click_handlers[index]);
    }
  });
  cell_click_handlers = [];

  cells.forEach((cell, index) => {
    cell.style.pointerEvents = "auto"
    const handle_click = function () {
      if (cell.dataset.mark) {
        return;
      }
      mark_cell(cell, current_player);
    };
    cell_click_handlers[index] = handle_click;
    cell.addEventListener("click", handle_click);
  });
}

function reset_game() {
  play_sound(click_sfx)
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
  play_sound(click_sfx)
  cells.forEach((cell) => {
    cell.dataset.mark = "";
    cell.style.cursor = "pointer";
  });
  player_1_path = [];
  player_2_path = [];
  player_1_score.textContent = player_1_score_value.toString();
  player_2_score.textContent = player_2_score_value.toString();
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
  play_sound(draw_sfx)
  cell.style.cursor = "not-allowed";
  if (player === "O") {
    player_1.style.opacity = "0.7";
    player_2.style.opacity = "1";
    cell.dataset.mark = "O";
    const cell_index = parseInt(cell.getAttribute("cellIndex")!);
    player_1_path.push(cell_index);
    current_player = "X";
    check_winner("O", player_1_path);
  }
  if (player === "X") {
    player_2.style.opacity = "0.7";
    player_1.style.opacity = "1";
    cell.dataset.mark = "X";
    const cell_index = parseInt(cell.getAttribute("cellIndex")!);
    player_2_path.push(cell_index);
    current_player = "O";
    check_winner("X", player_2_path);
  }
}

function disable_all_cells() {
  cells.forEach((cell) => {
    // cell.style.cursor = "not-allowed"; // not actually disabled 
    cell.style.pointerEvents = "none"
    cell.dataset.mark = cell.dataset.mark || "disabled";
  });
}

async function check_winner(player: "O" | "X", path: number[]) {
  let winning_row: number[] = [];
  const winning_combo = winning_combinations.find((combo) =>
    combo.every((num) => path.includes(num))
  );

  if (winning_combo) {
    winning_row = winning_combo;
  }

  const has_combination = Boolean(winning_combo);

  if (has_combination) {
    // since animations are async by default, I wrapped the highlight animation in a promise to add some delay 
    await highlight_win(winning_row);
    play_sound(win_sfx) 
    disable_all_cells();
    if (player === "O") {
      player_1_score_value += 1;
      player_1_score.textContent = player_1_score_value.toString();
      show_result(player, player_1_score_value);
    } else {
      player_2_score_value += 1;
      player_2_score.textContent = player_2_score_value.toString();
      show_result(player, player_2_score_value);
    }
  } else if (player_1_path.length + player_2_path.length === 9) {
    disable_all_cells();
    show_result("draw", 0);
  }
  return;
}

function highlight_win(combination: number[]) {
  const winning_cells = combination.map((index) => cells[index]);
  // I'm using a promise here so I can await the animation to finish before playing the sound effects
  // and showing the result
  return new Promise((res) => {
    gsap.fromTo(
      winning_cells,
      {
        scale: 1.2,
        backgroundColor: "yellow",
        duration: 1,
        ease: "bounce.inOut",
        stagger: { amount: 0.1 },
      },
      {
        scale: 1,
        backgroundColor: "var(--secondary)",
        duration:1,
        ease: "bounce.inOut",
        stagger: { amount: 0.1 },
        onComplete: res,
      }
    );
  });
}
