var c = document.getElementById("playWindow");
var ctx = c.getContext("2d");

const WIDTH = 160;
const HEIGHT = 120;
const PIXEL_SIZE = 5;
const GAME_SPEED = 1;
const SENSIBLILITY = 0.8;
const MAX_VERTICAL_LOOK = 20;

class Game {
	constructor(c, ctx, level) {
		this.ctx = ctx;
		this.c = c;
		this.mouseOffset = { x: 0, y: 0 };
		this.FOV = 50;

		// Creating the player
		this.P = {
			x: 70, //
			y: -110, // Player XYZ Position
			z: 20, //

			a: 0, // Rotation
			l: 0, // Look rotation
		};

		// Generating the this.level
		this.level = this.Generatelevel(level);

		this.keypress = {}; // Define event listener functions separately
		// Add event listeners

		const handleMouseMove = this.handleMouseMove.bind(this);
		const handleWheel = this.handleWheel.bind(this);
		const handleKeyDown = this.handleKeyDown.bind(this);
		const handleKeyUp = this.handleKeyUp.bind(this);
		document.addEventListener("pointerlockchange", (e) => {
			if (document.pointerLockElement === c) {
				document.addEventListener("mousemove", handleMouseMove, false);
				document.addEventListener("wheel", handleWheel, false);
				document.addEventListener("keydown", handleKeyDown);
				document.addEventListener("keyup", handleKeyUp);
			} else {
				document.removeEventListener("mousemove", handleMouseMove, false);
				document.removeEventListener("wheel", handleWheel, false);
				document.removeEventListener("keydown", handleKeyDown);
				document.removeEventListener("keyup", handleKeyUp);
			}
		});
		c.addEventListener("click", async () => {await c.requestPointerLock();});

		let old_d = 0;
		let delta = 0;
		setInterval(() => {
			old_d = Date.now();
			this.GetScreenGrid();
			this.Simulate(this.keypress, delta);
			let p = {};
			p.x = Math.round(this.P.x);
			p.y = Math.round(this.P.y);
			p.z = Math.round(this.P.z);
			p.a = Math.round(this.P.a);
			p.l = Math.round(this.P.l);
			this.Draw3D(this.P);
			this.DrawScreen();
			delta = Date.now() - old_d;
			if ((delta = Infinity)) {
				delta = 1;
			}
		}, 1);
	}

	Simulate(keys, delta) {
		if (this.FOV < 50) {
			this.FOV = 50;
		} else if (this.FOV > 300) {
			this.FOV = 300;
		}
		if (keys["j"] || this.mouseOffset.x < 0) {
			this.P.a -=
				0.3 * delta * GAME_SPEED * Math.abs(this.mouseOffset.x) * SENSIBLILITY;
			if (this.P.a < 0) {
				this.P.a += 360;
			}
		}
		if (keys["l"] || this.mouseOffset.x > 0) {
			this.P.a +=
				0.3 * delta * GAME_SPEED * Math.abs(this.mouseOffset.x) * SENSIBLILITY;
			if (this.P.a > 359) {
				this.P.a -= 360;
			}
		}
		var dx = Math.sin((this.P.a / 180) * Math.PI) * delta * GAME_SPEED;
		var dy = Math.cos((this.P.a / 180) * Math.PI) * delta * GAME_SPEED;

		if (keys["z"]) {
			this.P.x += dx;
			this.P.y += dy;
		}
		if (keys["s"]) {
			this.P.x -= dx;
			this.P.y -= dy;
		}

		if (keys["d"]) {
			this.P.x += dy;
			this.P.y -= dx;
		}
		if (keys["q"]) {
			this.P.x -= dy;
			this.P.y += dx;
		}

		if (keys["k"] || this.mouseOffset.y > 0) {
			this.P.l -=
				0.2 * delta * GAME_SPEED * Math.abs(this.mouseOffset.y) * SENSIBLILITY;
		}
		if (keys["i"] || this.mouseOffset.y < 0) {
			this.P.l +=
				0.2 * delta * GAME_SPEED * Math.abs(this.mouseOffset.y) * SENSIBLILITY;
		}
		if (keys["a"]) {
			this.P.z -= 2 * delta * GAME_SPEED;
		}
		if (keys["e"]) {
			this.P.z += 2 * delta * GAME_SPEED;
		}

		if (this.P.l > MAX_VERTICAL_LOOK) {
			this.P.l = MAX_VERTICAL_LOOK;
		} else if (this.P.l < -MAX_VERTICAL_LOOK) {
			this.P.l = -MAX_VERTICAL_LOOK;
		}
		this.mouseOffset = { x: 0, y: 0 };
	}
	Draw3D(P) {
		let wx = [];
		let wy = [];
		let wz = [];

		let CS = Math.cos((P.a / 180) * Math.PI);
		let SN = Math.sin((P.a / 180) * Math.PI);


		// Short the wall from the farest to the nearest
		for (let s = 0; s < this.level.length - 1; s++) {
			for (let w = 0; w < this.level.length - s - 1; w++) {
				if (this.level[w].d < this.level[w + 1].d) {
					let st = this.level[w];
					this.level[w] = this.level[w + 1];
					this.level[w + 1] = st;
				}
			}
		}

		// draw sectors
		for (let s = 0; s < this.level.length; s++) {
			this.level[s].d = 0;
			this.level[s].surf = [];
			if (P.z < this.level[s].z1) {
				this.level[s].surface = 1;
			} else if (P.z > this.level[s].z2) {
				this.level[s].surface = 2;
			} else {
				this.level[s].surface = 0;
			}

			for (let loop = 0; loop < 2; loop++) {
				for (let w = 0; w < this.level[s].walls.length; w++) {
					// offset bottom 2 points by player
					let x1 = this.level[s].walls[w].x1 - P.x;
					let y1 = this.level[s].walls[w].y1 - P.y;
					let x2 = this.level[s].walls[w].x2 - P.x;
					let y2 = this.level[s].walls[w].y2 - P.y;

					// Invert the orientation of the wall if loop==0
					if (loop == 0) {
						let swp = x1;
						x1 = x2;
						x2 = swp;
						swp = y1;
						y1 = y2;
						y2 = swp;
					}

					// world X position
					wx[0] = Math.round(x1 * CS - y1 * SN);
					wx[1] = Math.round(x2 * CS - y2 * SN);

					wx[2] = wx[0];
					wx[3] = wx[1];

					// world Y position (depth)
					wy[0] = y1 * CS + x1 * SN;
					wy[1] = y2 * CS + x2 * SN;

					wy[2] = wy[0];
					wy[3] = wy[1];

					this.level[s].d += this.dist(
						0,
						0,
						(wx[0] + wx[1]) / 2,
						(wy[0], wy[1]) / 2
					); // store the wall distance

					// world Z height
					wz[0] = Math.round(this.level[s].z1 - P.z + (P.l * wy[0]) / 32);
					wz[1] = Math.round(this.level[s].z1 - P.z + (P.l * wy[1]) / 32);

					wz[2] = Math.round(this.level[s].z2 - P.z + (P.l * wy[0]) / 32);
					wz[3] = Math.round(this.level[s].z2 - P.z + (P.l * wy[1]) / 32);

					// dont draw if behind player
					if (wy[0] < 1 && wy[1] < 1) {
						continue;
					}

					// point 1 behind player, clip
					if (wy[0] < 1) {
						let temp1 = this.ClipBehindPlayer(
							wx[0],
							wy[0],
							wz[0],
							wx[1],
							wy[1],
							wz[1]
						);
						wx[0] = temp1.x1;
						wy[0] = temp1.y1;
						wz[0] = temp1.z1;
						temp1 = this.ClipBehindPlayer(
							wx[2],
							wy[2],
							wz[2],
							wx[3],
							wy[3],
							wz[3]
						);
						wx[2] = temp1.x1;
						wy[2] = temp1.y1;
						wz[2] = temp1.z1;
					}

					// point 2 behind player, clip
					if (wy[1] < 1) {
						let temp2 = this.ClipBehindPlayer(
							wx[1],
							wy[1],
							wz[1],
							wx[0],
							wy[0],
							wz[0]
						);
						wx[1] = temp2.x1;
						wy[1] = temp2.y1;
						wz[1] = temp2.z1;
						temp2 = this.ClipBehindPlayer(
							wx[3],
							wy[3],
							wz[3],
							wx[2],
							wy[2],
							wz[2]
						);
						wx[3] = temp2.x1;
						wy[3] = temp2.y1;
						wz[3] = temp2.z1;
					}

					// screen X, screen Y position
					wx[0] = Math.round((wx[0] * this.FOV) / wy[0] + WIDTH / 2);
					wy[0] = Math.round((wz[0] * this.FOV) / wy[0] + HEIGHT / 2);
					wx[1] = Math.round((wx[1] * this.FOV) / wy[1] + WIDTH / 2);
					wy[1] = Math.round((wz[1] * this.FOV) / wy[1] + HEIGHT / 2);

					wx[2] = Math.round((wx[2] * this.FOV) / wy[2] + WIDTH / 2);
					wy[2] = Math.round((wz[2] * this.FOV) / wy[2] + HEIGHT / 2);
					wx[3] = Math.round((wx[3] * this.FOV) / wy[3] + WIDTH / 2);
					wy[3] = Math.round((wz[3] * this.FOV) / wy[3] + HEIGHT / 2);

					// draw points
					//if (wx[0] > 0 && wx[0] < WIDTH && wy[0] > 0 && wy[0] < HEIGHT) {this.DrawPixel(wx[0],wy[0],{})}
					//if (wx[1] > 0 && wx[1] < WIDTH && wy[1] > 0 && wy[1] < HEIGHT) {this.DrawPixel(wx[1],wy[1],{})}

					this.DrawWall(
						wx[0],
						wx[1],
						wy[0],
						wy[1],
						wy[2],
						wy[3],
						this.level[s].walls[w].c,
						s
					);
				}
				this.level[s].d /= this.level[s].walls.length;
				this.level[s].surface *= -1;
			}
		}
	}
	DrawWall(x1, x2, b1, b2, t1, t2, c, s) {
		// Hold difference in distance
		let dyb = b2 - b1; // Y distance of bottom line
		let dyt = t2 - t1; // Y distance of top    line
		let dx = x2 - x1;
		if (dx == 0) {
			dx = 1;
		} // X distance
		let xs = x1; // Hold initial x1 starting position

		// CLIP X
		if (x1 < 0) {
			x1 = 0;
		} // clip left
		if (x2 < 0) {
			x2 = 0;
		} // clip left
		if (x1 > WIDTH) {
			x1 = WIDTH;
		} // clip right
		if (x2 > WIDTH) {
			x2 = WIDTH;
		} // clip right

		for (let x = x1; x < x2; x++) {
			// The Y start and end point
			let y1 = Math.round((dyb * (x - xs + 0.5)) / dx + b1); // y bottom point
			let y2 = Math.round((dyt * (x - xs + 0.5)) / dx + t1); // y top    point
			
			//this.DrawPixel(x, y1, {}); // bottom
			//this.DrawPixel(x, y2, {}); // top
			//this.DrawPixel(x2, y1, {r:255,g:255,b:255});
			//this.DrawPixel(x1, y1, {r:255,g:255,b:255});


			// CLIP Y
			if (y1 < 0) {
				y1 = 0;
			} // clip y
			if (y2 < 0) {
				y2 = 0;
			} // clip y
			if (y1 > HEIGHT) {
				y1 = HEIGHT;
			} // clip y
			if (y2 > HEIGHT) {
				y2 = HEIGHT;
			} // clip y

			// surface
			x = Math.round(x);
			if (this.level[s].surface == 1) {
				this.level[s].surf[x] = y1;
				continue;
			} // save bottom points
			if (this.level[s].surface == 2) {
				this.level[s].surf[x] = y2;
				continue;
			} // save top points
			if (this.level[s].surface == -1) {
				for (let y = this.level[s].surf[x]; y < y1; y++) {
					this.DrawPixel(x, y, this.level[s].bc);
				}
			} // bottom
			if (this.level[s].surface == -2) {
				for (let y = y2; y < this.level[s].surf[x]; y++) {
					this.DrawPixel(x, y, this.level[s].tc);
				}
			} // top
			for (let y = y1; y < y2; y++) {
				this.DrawPixel(x, y, c);
			} // normal wall
		}
	}
	ClipBehindPlayer(x1, y1, z1, x2, y2, z2) {
		let da = y1; // distance plane -> point a
		let db = y2; // distance plane -> point b
		let d = da - db;
		if (d == 0) {
			d = 1;
		}
		let s = da / (da - db); // intersection factor (between 0 and 1)
		x1 = Math.round(x1 + s * (x2 - x1));
		y1 = Math.round(y1 + s * (y2 - y1));
		if (y1 == 0) {
			y1 = 1;
		} // prevent divide by 0
		z1 = Math.round(z1 + s * (z2 - z1));
		return { x1, y1, z1 };
	}

	GetScreenGrid() {
		this.imageData = this.ctx.createImageData(this.c.width, this.c.height); // Create an image with the size of the canvas
	}
	DrawPixel(x, y, color) {
		x = Math.round(x);
		y = Math.round(y);
		if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
			this.imageData.data[0 + y * this.c.width * 4 + x * 4] = color.r || 0; // Red
			this.imageData.data[1 + y * this.c.width * 4 + x * 4] = color.g || 0; // Green
			this.imageData.data[2 + y * this.c.width * 4 + x * 4] = color.b || 0; // Blue
			this.imageData.data[3 + y * this.c.width * 4 + x * 4] = 255; // Alpha
		}
	}
	DrawScreen() {
		this.ctx.putImageData(this.imageData, 0, 0); // Draw the created image
	}
	Generatelevel(level) {
		let lvl = [];
		level.split("\n\n").forEach((e) => {
			let sect = { walls: [] };
			e.split("\n").forEach((f, i) => {
				if (i === 0) {
					let sectinf = f.split("_");
					sect["z1"] = parseInt(sectinf[0]);
					sect["z2"] = parseInt(sectinf[1]);
					let color = sectinf[2].split("/");
					sect["bc"] = {
						r: parseInt(color[0]),
						g: parseInt(color[1]),
						b: parseInt(color[2]),
					};
					color = sectinf[3].split("/");
					sect["tc"] = {
						r: parseInt(color[0]),
						g: parseInt(color[1]),
						b: parseInt(color[2]),
					};
				} else {
					let sectwalls = f.split("_");
					let w = {};
					w["x1"] = parseInt(sectwalls[0]);
					w["y1"] = parseInt(sectwalls[1]);
					w["x2"] = parseInt(sectwalls[2]);
					w["y2"] = parseInt(sectwalls[3]);
					let color = sectwalls[4].split("/");
					w["c"] = {
						r: parseInt(color[0]),
						g: parseInt(color[1]),
						b: parseInt(color[2]),
					};
					sect.walls[i - 1] = w;
				}
			});
			lvl.push(sect);
		});
		return lvl;
	}
	dist(x1, y1, x2, y2) {
		return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
	}

	handleMouseMove(e) {
		this.mouseOffset = { x: e.movementX, y: e.movementY };
	}
	handleWheel(e) {
		this.FOV -= e.deltaY / 20;
	}
	handleKeyDown(e) {
		this.keypress[e.key] = true;
	}
	handleKeyUp(e) {
		this.keypress[e.key] = false;
	}
}

let level_format = `z1_z2_bc_tc
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c

z1_z2_bc_tc
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c

z1_z2_bc_tc
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c
x1_y1_x2_y2_c`;

let level = `20_40_128/255/128_160/255/0
0_0_32_0_128/255/0
32_0_32_32_128/128/0
32_32_0_32_128/255/0
0_32_0_0_128/128/0

0_20_255/255/128_255/160/0
64_0_96_0_255/128/0
96_0_96_32_255/255/0
96_32_64_32_255/128/0
64_32_64_0_255/255/0

0_40_128/255/255_160/255/255
64_64_96_64_0/255/128
96_64_96_96_0/255/255
96_96_64_96_0/255/128
64_96_64_64_0/255/255

0_40_255/128/255_255/160/255
0_64_32_64_128/0/255
32_64_32_96_255/0/255
32_96_0_96_128/0/255
0_96_0_64_255/0/255`;

c.width = WIDTH;
c.height = HEIGHT;
c.style.width = c.width * PIXEL_SIZE + "px";
c.style.height = c.height * PIXEL_SIZE + "px";
c.style.backgroundColor = "rgb(59, 59, 110)";
let t = new Game(c, ctx, level);
