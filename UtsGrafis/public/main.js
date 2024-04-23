const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("Tidak Support WebGL");
}

alert("Silahkan Klik OK");

let jumpHeight1 = 0.0; // Ketinggian melompat untuk persegi panjang 1 (dino)
let jumpHeight2 = 0.0; // Ketinggian melompat untuk persegi panjang 2 (rintangan)
let isJumping = false;
let translationX = 0.0;
let gameSpeed = 0.005;
let score = 0;

document.addEventListener("keydown", function (event) {
  if (event.code === "Space" && !isJumping) {
    isJumping = true;
  }
});

// Membuat vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  uniform float u_jumpHeight;
  uniform float u_translationX;

  void main() {
    gl_Position = vec4(a_position.x + u_translationX, a_position.y + u_jumpHeight, 0.0, 1.0); // Posisi titik
  }
`;

// Membuat fragment shader
const fragmentShaderSource = `
  precision mediump float;  

  uniform vec4 u_color;

  void main() {
      gl_FragColor = u_color; // Warna titik
  }
`;

// Membuat program shader dan menghubungkan shader
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

// Membuat program shader
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Mendapatkan lokasi atribut posisi dari shader
const positionAttributeLocation = gl.getAttribLocation(
  shaderProgram,
  "a_position"
);
gl.enableVertexAttribArray(positionAttributeLocation);

// Mendapatkan lokasi uniform jumpHeight dari shader
const jumpHeightUniformLocation = gl.getUniformLocation(
  shaderProgram,
  "u_jumpHeight"
);

// Mendapatkan lokasi uniform translationX dari shader
const translationXUniformLocation = gl.getUniformLocation(
  shaderProgram,
  "u_translationX"
);

// Mendapatkan lokasi uniform warna dari shader
const colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");

// Menggambar objek dengan gl.TRIANGLE_STRIP (persegi panjang)
function createAndBindBuffer(data) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return buffer;
}

// Data koordinat untuk dua persegi panjang
const persegiPanjang1 = [
  -0.2,
  0.1, // titik 1
  -0.2,
  -0.1, // titik 2
  0.0,
  0.1, // titik 3
  0.0,
  -0.1, // titik 4
];

const persegiPanjang2 = [
  0.2,
  0.1, // titik 1
  0.2,
  -0.1, // titik 2
  0.4,
  0.1, // titik 3
  0.4,
  -0.1, // titik 4
];

// Membuat buffer untuk setiap persegi panjang
const positionBuffer1 = createAndBindBuffer(persegiPanjang1);
const positionBuffer2 = createAndBindBuffer(persegiPanjang2);

// Function untuk menggambar persegi panjang
function draw(buffer, jumpHeight, translationX, color) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(jumpHeightUniformLocation, jumpHeight);
  gl.uniform1f(translationXUniformLocation, translationX);
  gl.uniform4fv(colorUniformLocation, color);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Function untuk animasi
function animate() {
  // Gambar ulang scene
  gl.clearColor(0, 0, 0, 1); // Set latar belakang canvas menjadi hitam
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Bergerak rintangan
  translationX -= gameSpeed;

  // Deteksi tabrakan
  if (translationX <= -1.0) {
    translationX = 1.0;
    score++; // Tambah skor jika berhasil melewati rintangan
  }

  // Atur kecepatan berdasarkan skor
  if (score % 10 === 0 && gameSpeed < 0.01) {
    gameSpeed += 0.01;
  }

  // Gambar persegi panjang 1 (dino) dengan warna merah
  draw(positionBuffer1, jumpHeight1, 0, [1, 0, 0, 1]);

  // Gambar persegi panjang 2 (rintangan) dengan warna kuning
  draw(positionBuffer2, jumpHeight2, translationX, [1, 1, 0, 1]);

  // Logika untuk animasi melompat persegi panjang 1 saja
  if (isJumping) {
    if (jumpHeight1 < 0.8) {
      // Ubah ketinggian melompat (sesuai yang kita inginkan)
      jumpHeight1 += 0.03; // Ubah penambahan ketinggian melompat menjadi 0.03 (sesuai yang kita inginkan)
    } else {
      isJumping = false;
      jumpHeight1 = 0.0; // Setel ketinggian melompat kembali ke nol setelah melompat
    }
  }

  // Minta browser untuk menjalankan animasi kembali
  requestAnimationFrame(animate);
}

// Memulai animasi
animate();
