//THREE.js
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

//OrbitControls
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';



// Ensure canvas
let canvas = document.querySelector('canvas.webgl')
if (!canvas) {
  canvas = document.createElement('canvas')
  canvas.className = 'webgl'
  document.body.appendChild(canvas)
}

// Sizes
const sizes = { width: window.innerWidth, height: window.innerHeight }

// SCENES (ROOMS)
const room1 = new THREE.Scene();
const room2 = new THREE.Scene();

room1.background = new THREE.Color(0x000000);

//which room is currently visible
let currentScene = room1;


// Skybox/textures (adjust paths if needed)
const loader = new THREE.TextureLoader()
const texture_ft = loader.load('treemoss.png')
const texture_bk = loader.load('treemoss.png')
const texture_up = loader.load('treemoss.png')
const texture_dn = loader.load('treemoss.png')
const texture_rt = loader.load('treemoss.png')
const texture_lf = loader.load('treemoss.png')

const materialArray = [
  new THREE.MeshBasicMaterial({ map: texture_ft }),
  new THREE.MeshBasicMaterial({ map: texture_bk }),
  new THREE.MeshBasicMaterial({ map: texture_up }),
  new THREE.MeshBasicMaterial({ map: texture_dn }),
  new THREE.MeshBasicMaterial({ map: texture_rt }),
  new THREE.MeshBasicMaterial({ map: texture_lf })
]
for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide

const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000)
const skybox = new THREE.Mesh(skyboxGeo, materialArray)
room2.add(skybox)

// Camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 30000)
camera.position.set(0, 1.6, 2);
camera.lookAt(0, 1.6, 0);
room1.add(camera);
room2.add(camera);



let hoveringButton = false;

// LIGHTS (REQUIRED for MeshStandardMaterial)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
room1.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
room1.add(dirLight);


// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener('change', () => renderer.render(currentScene, camera))
controls.minDistance = 1
controls.maxDistance = 20


// Resize handling
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
})

// SPHERE BUTTON (ROOM 1)
const sphereGeo = new THREE.SphereGeometry(0.6, 32, 32);
const sphereMat = new THREE.MeshStandardMaterial({
  color: 0xff4444,
  roughness: 0.3,
  metalness: 0.1
});

const buttonSphere = new THREE.Mesh(sphereGeo, sphereMat);
buttonSphere.position.set(0, 1.6, -1);
room1.add(buttonSphere);

// BUTTON TEXT
const textCanvas = document.createElement("canvas");
textCanvas.width = 512;
textCanvas.height = 256;

const ctx = textCanvas.getContext("2d");

// background with slight transparency
ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

// text
ctx.fillStyle = "white";
ctx.font = "bold 48px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText(
  "WARNING:",
  textCanvas.width / 2,
  textCanvas.height / 2 - 40
);

ctx.font = "32px Arial";
ctx.fillText(
  "infohazard ahead",
  textCanvas.width / 2,
  textCanvas.height / 2 + 30
);

const textTexture = new THREE.CanvasTexture(textCanvas);
const textMat = new THREE.MeshBasicMaterial({
  map: textTexture,
  transparent: true
});

const textPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2.5, 1.5),
  textMat
);

textPlane.position.set(0, 1.6, 0.2);
room1.add(textPlane);

// ROOM 2 TEXT (follows mouse)
const textCanvas2 = document.createElement("canvas");
textCanvas2.width = 512;
textCanvas2.height = 256;

const ctx2 = textCanvas2.getContext("2d");
ctx2.clearRect(0, 0, textCanvas2.width, textCanvas2.height);

ctx2.font = "bold 80px Arial";
ctx2.textAlign = "center";
ctx2.textBaseline = "middle";

// Black outline
ctx2.strokeStyle = "black";
ctx2.lineWidth = 6;
ctx2.strokeText(
  "more true",
  textCanvas2.width / 2,
  textCanvas2.height / 2
);

// White fill
ctx2.fillStyle = "white";
ctx2.fillText(
  "more true",
  textCanvas2.width / 2,
  textCanvas2.height / 2
);

const textTexture2 = new THREE.CanvasTexture(textCanvas2);
const textMat2 = new THREE.MeshBasicMaterial({
  map: textTexture2,
  transparent: true
});

const textPlane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(3, 1.5),
  textMat2
);

room2.add(textPlane2);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const fadeDiv = document.getElementById("fade");

function startFadeTransition() {
  fadeDiv.classList.add("active");

  setTimeout(() => {
    currentScene = room2;

    // optional: reposition camera for room 2
    camera.position.set(0, 0, 0);

    setTimeout(() => {
      fadeDiv.classList.remove("active");
    }, 500);
  }, 1000);
}

window.addEventListener("click", () => {
  if (hoveringButton) {
    startFadeTransition();
  }
});

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects([buttonSphere]);

  hoveringButton = hits.length > 0;
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (hoveringButton && buttonSphere) {
    buttonSphere.scale.set(1.1, 1.1, 1.1);
  } else if (buttonSphere) {
    buttonSphere.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
  }

  // Update room2 text position to follow mouse
  if (currentScene === room2) {
    textPlane2.position.x = mouse.x * 8;
    textPlane2.position.y = mouse.y * 8;
    textPlane2.position.z = -5;
  }

  renderer.render(currentScene, camera);
}

animate();


