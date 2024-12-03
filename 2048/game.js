class Game2048 {
  constructor() {
    this.gameBoard = document.querySelector("#game-board");
    this.scoreDisplay = document.querySelector("#score");
    this.restartBtn = document.querySelector("#restart");
    this.resultDisplay = document.querySelector(".result");
    this.scoreDisplayFinal = document.querySelector("#score-final");
    this.restartBtnFinal = document.querySelector("#restart-final");
    this.initGame();
    this.setUpEventListeners();
  }

  initGame() {
    this.tiles = Array(16).fill(null);
    this.score = 0;
    this.addRandomTile();
    this.addRandomTile();
    this.renderBoard();
    this.resultDisplay.classList.remove("result-active");
  }

  setUpEventListeners() {
    this.restartBtn.addEventListener("click", () => this.initGame());
    this.restartBtnFinal.addEventListener("click", () => this.initGame());
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    let startX, startY, endX, endY;
    document.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    document.addEventListener("touchend", (e) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      this.handleSwipe(startX, startY, endX, endY);
    });
  }

  handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Đặt ngưỡng vuốt tối thiểu (ví dụ: 30px)
    const threshold = 30;

    // Kiểm tra xem có vuốt ngang hay vuốt dọc không
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      // Vuốt ngang
      if (deltaX > 0) {
        this.movetiles("right"); // Vuốt sang phải
      } else {
        this.movetiles("left"); // Vuốt sang trái
      }
    } else if (Math.abs(deltaY) > threshold) {
      // Vuốt dọc
      if (deltaY > 0) {
        this.movetiles("down"); // Vuốt xuống
      } else {
        this.movetiles("up"); // Vuốt lên
      }
    }
  }

  handleKeyDown(e) {
    switch (e.key) {
      case "ArrowUp":
        this.movetiles("up");
        break;
      case "ArrowDown":
        this.movetiles("down");
        break;
      case "ArrowRight":
        this.movetiles("right");
        break;
      case "ArrowLeft":
        this.movetiles("left");
        break;
    }
  }

  movetiles(direction) {
    let moved = false;

    const moveTile = (from, to) => {
      if (this.tiles[to] === null) {
        this.tiles[to] = this.tiles[from];
        this.tiles[from] = null;
        moved = true;
      } else if (
        this.tiles[to] === this.tiles[from] &&
        !this.merged[to] &&
        !this.merged[from]
      ) {
        this.tiles[to] = this.tiles[to] + this.tiles[from]; // Cộng giá trị
        this.score += this.tiles[to];
        this.tiles[from] = null;
        this.merged[to] = true; // Đánh dấu đã gộp
        moved = true;
      }
    };

    const traverse = (order) => {
      order.forEach((index) => {
        if (this.tiles[index] !== null) {
          let newIndex = index;
          while (true) {
            const nextIndex = this.getNextIndex(newIndex, direction);
            if (nextIndex === null) break;
            if (this.tiles[nextIndex] === null) {
              moveTile(newIndex, nextIndex);
            } else if (this.tiles[nextIndex] === this.tiles[newIndex]) {
              moveTile(newIndex, nextIndex);
              break; // Chỉ gộp một lần, sau đó dừng
            } else {
              break; // Dừng nếu gặp ô khác giá trị
            }
            newIndex = nextIndex;
          }
        }
      });
    };

    this.merged = Array(16).fill(false); // Reset trạng thái merged
    const order = this.createOrder(direction);
    traverse(order);

    if (moved) {
      this.addRandomTile();
      this.renderBoard();
    }

    if (this.isGameOver()) {
      this.resultDisplay.classList.add("result-active");
    }
  }

  createOrder(direction) {
    const order = [];
    if (direction === "up" || direction === "down") {
      for (let col = 0; col < 4; col++) {
        const colIndices = [];
        for (let row = 0; row < 4; row++) {
          const index = row * 4 + col;
          colIndices.push(index);
        }
        if (direction === "down") colIndices.reverse();
        order.push(...colIndices);
      }
    } else {
      for (let row = 0; row < 4; row++) {
        const rowIndices = [];
        for (let col = 0; col < 4; col++) {
          const index = row * 4 + col;
          rowIndices.push(index);
        }
        if (direction === "right") rowIndices.reverse();
        order.push(...rowIndices);
      }
    }
    return order;
  }

  getNextIndex(index, direction) {
    const row = Math.floor(index / 4);
    const col = index % 4;
    switch (direction) {
      case "up":
        return row > 0 ? index - 4 : null;
      case "down":
        return row < 3 ? index + 4 : null;
      case "left":
        return col > 0 ? index - 1 : null;
      case "right":
        return col < 3 ? index + 1 : null;
    }
  }

  renderBoard() {
    this.gameBoard.innerHTML = "";
    this.tiles.forEach((tile, index) => {
      const tileElement = document.createElement("div");
      tileElement.classList.add("tile");
      if (tile !== null) {
        tileElement.classList.add(`tile-${tile}`);
        tileElement.textContent = tile;
      }
      this.gameBoard.appendChild(tileElement);
    });
    this.scoreDisplay.textContent = `Score: ${this.score}`;
    this.scoreDisplayFinal.textContent = `Score: ${this.score}`;
  }

  addRandomTile() {
    const emptyTiles = this.tiles
      .map((tile, index) => (tile === null ? index : null))
      .filter((index) => index !== null);

    if (emptyTiles.length === 0) return;

    const randomIndex =
      emptyTiles[Math.floor(Math.random() * emptyTiles.length)];

    this.tiles[randomIndex] = Math.random() < 0.9 ? 2 : 4;
  }

  isGameOver() {
    if (this.tiles.includes(null)) return false;

    for (let i = 0; i < 16; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      if (
        (row > 0 && this.tiles[i] === this.tiles[i - 4]) || // up
        (row < 3 && this.tiles[i] === this.tiles[i + 4]) || // down
        (col > 0 && this.tiles[i] === this.tiles[i - 1]) || // left
        (col < 3 && this.tiles[i] === this.tiles[i + 1]) // right
      ) {
        return false;
      }
    }
    return true;
  }
}

document.addEventListener("DOMContentLoaded", () => new Game2048());
