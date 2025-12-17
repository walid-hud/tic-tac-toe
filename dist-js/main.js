import { confetti } from "@tsparticles/confetti";
import { gsap } from "gsap";
function fire_confetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
    });
}
const draw_sfx = document.querySelector("#pencil-sfx");
const win_sfx = document.querySelector("#win-sfx");
const click_sfx = document.querySelector("#click-sfx");
let cross = document
    .querySelector(".ttt-cross")
    .cloneNode(true);
let circle = document
    .querySelector(".ttt-circle")
    .cloneNode(true);
cross.style.position = "absolute";
circle.style.position = "absolute";
cross.style.top = "-10px";
circle.style.top = "-10px";
const game_menu = document.querySelector(".game-menu");
const start_btn = document.querySelector(".start-button");
const continue_btn = document.querySelector(".continue-btn");
const reset_btn = document.querySelector(".reset-btn");
const game_container = document.querySelector(".game");
game_container.style.display = "none";
const player_1 = document.querySelector(".player-1");
const player_1_score = document.querySelector(".player-1-score");
const player_2 = document.querySelector(".player-2");
const player_2_score = document.querySelector(".player-2-score");
const cells = document.querySelectorAll(".cell");
const result_modal = document.querySelector(".result-modal");
gsap.set(result_modal, { opacity: 0, scale: 0 });
const winner_label = document.querySelector(".winner-label");
const winner_icon = document.querySelector(".winner-icon");
const result_score = document.querySelector(".result-score");
const winner_label_p1 = winner_label.querySelector("p:first-child");
const winner_label_p2 = winner_label.querySelector("p:last-child");
function show_result(winner, score) {
    if (winner === "draw") {
        // Handle draw state
        winner_label_p1.textContent = "It's";
        winner_label_p2.textContent = "a draw!";
        winner_icon.style.display = "none";
        result_score.textContent = "-";
    }
    else {
        fire_confetti();
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
let player_1_path = [];
let player_2_path = [];
let current_player;
let cell_click_handlers = [];
function start_game() {
    click_sfx.currentTime = 0;
    click_sfx.play();
    game_menu.style.display = "none";
    game_container.style.display = "grid";
    current_player = get_starting_player();
    if (current_player === "O") {
        player_2.style.opacity = "0.7";
    }
    else {
        player_1.style.opacity = "0.7";
    }
    // remove old event listeners first
    cells.forEach((cell, index) => {
        if (cell_click_handlers[index]) {
            cell.removeEventListener("click", cell_click_handlers[index]);
        }
    });
    cell_click_handlers = [];
    cells.forEach((cell, index) => {
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
    click_sfx.currentTime = 0;
    click_sfx.play();
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
    click_sfx.currentTime = 0;
    click_sfx.play();
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
function mark_cell(cell, player) {
    draw_sfx.currentTime = 0;
    draw_sfx.play();
    cell.style.cursor = "not-allowed";
    if (player === "O") {
        player_1.style.opacity = "0.7";
        player_2.style.opacity = "1";
        cell.dataset.mark = "O";
        const cell_index = parseInt(cell.getAttribute("cellIndex"));
        player_1_path.push(cell_index);
        current_player = "X";
        check_winner("O", player_1_path);
    }
    if (player === "X") {
        player_2.style.opacity = "0.7";
        player_1.style.opacity = "1";
        cell.dataset.mark = "X";
        const cell_index = parseInt(cell.getAttribute("cellIndex"));
        player_2_path.push(cell_index);
        current_player = "O";
        check_winner("X", player_2_path);
    }
}
function disable_all_cells() {
    cells.forEach((cell) => {
        cell.style.cursor = "not-allowed";
        cell.dataset.mark = cell.dataset.mark || "disabled";
    });
}
async function check_winner(player, path) {
    /*
    so, we just find the winning combo,
    */
    let winning_row = [];
    const winning_combo = winning_combinations.find((combo) => combo.every((num) => path.includes(num)));
    if (winning_combo) {
        winning_row = [...winning_combo];
    }
    const has_combination = Boolean(winning_combo);
    if (has_combination) {
        await highlight_win(winning_row);
        win_sfx.currentTime = 0;
        win_sfx.play();
        disable_all_cells();
        if (player === "O") {
            player_1_score_value += 1;
            player_1_score.textContent = player_1_score_value.toString();
            show_result(player, player_1_score_value);
        }
        else {
            player_2_score_value += 1;
            player_2_score.textContent = player_2_score_value.toString();
            show_result(player, player_2_score_value);
        }
    }
    else if (player_1_path.length + player_2_path.length === 9) {
        disable_all_cells();
        show_result("draw", 0);
    }
    return;
}
function highlight_win(combination) {
    const winning_cells = combination.map(index => cells[index]);
    // I'm using a promise here so I can await the animation to finish before playing the sound effects 
    // and showing the result 
    return new Promise((res) => {
        gsap.fromTo(winning_cells, { scale: 1.2, backgroundColor: "yellow", duration: 0.3, ease: "bounce.inOut", stagger: { amount: 0.1 } }, { scale: 1, backgroundColor: "var(--secondary)", duration: 0.3, ease: "bounce.inOut", stagger: { amount: 0.1 }, onComplete: res });
    });
}
