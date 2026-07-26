// import three and assets
const THREE = window.THREE;
const MTLLoader = THREE.MTLLoader;
const OBJLoader = THREE.OBJLoader;

// make scene
const scene = new THREE.Scene();

// make light
const light = new THREE.AmbientLight(0xffffff, 0.85);
scene.add(light);

// make camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// set camera position
camera.position.y = 0.65;
camera.position.z = 1;
camera.rotation.x = -0.5;

// make renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("cube").appendChild(renderer.domElement);

// update size on window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

// assign obj and texture
const loader = new OBJLoader();
const object = loader.parse(assets.objValue);
const texture = new THREE.TextureLoader().load(assets.textureValue);

// load texture and wrap model
object.traverse((child) => {
    if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.5,
            depthWrite: false
        });
    }
});

// set model size
object.scale.set(0.75, 0.75, 0.75);
scene.add(object);

// variables and functions for effects
let spinSpeed = 0.01;
let targetSpinSpeed = 0.01;
let glowStrength = 0;
let targetGlow = 0;

window.startThinking = function () {
  targetSpinSpeed = 0.08;
  targetGlow = 0.6;
};

window.stopThinking = function () {
  targetSpinSpeed = 0.01;
  targetGlow = 0;
};

// --- 60 FPS Cap Logic ---
let lastFrameTime = performance.now();
const fpsInterval = 1000 / 60; // ~16.67ms per frame

function animate(currentTime) {
  requestAnimationFrame(animate);

  const elapsed = currentTime - lastFrameTime;

  // Only render if ~16.67ms has passed since the last frame
  if (elapsed >= fpsInterval) {
    // Adjust lastFrameTime while keeping track of any extra drift time
    lastFrameTime = currentTime - (elapsed % fpsInterval);

    spinSpeed += (targetSpinSpeed - spinSpeed) * 0.05;
    object.rotation.y += spinSpeed;
    glowStrength += (targetGlow - glowStrength) * 0.05;

    object.traverse((child) => {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.5,
                depthWrite: false
            });
            child.material.emissive = new THREE.Color(0x88ccff);
            child.material.emissiveIntensity = glowStrength;
        }
    });

    renderer.render(scene, camera);
  }
}

animate(performance.now());