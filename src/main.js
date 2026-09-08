import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollSmoother from 'gsap/ScrollSmoother';

const canvas = document.querySelector('#cube-canvas');
const storySection = document.querySelector('.story-section');
const storyCanvas = document.querySelector('#story-canvas');
const assemblySection = document.querySelector('.assembly-section');
const assemblyCanvas = document.querySelector('#assembly-canvas');
const assemblyStage = document.querySelector('.assembly-stage');
const finalSection = document.querySelector('.final-section');
const finalCanvas = document.querySelector('#final-canvas');
const storyLines = gsap.utils.toArray('.story-line');
const storyCopy = document.querySelector('.story-copy');
const undoButton = document.querySelector('#undo-button');
const shuffleButton = document.querySelector('#shuffle-button');
const solveButton = document.querySelector('#solve-button');
const viewModeButton = document.querySelector('#view-mode-button');
const centerViewButton = document.querySelector('#center-view-button');
const moveCountElement = document.querySelector('#move-count');
const timerElement = document.querySelector('#timer');
const moveHistoryElement = document.querySelector('#move-history-list');
const gameStatusElement = document.querySelector('#game-status');
const currentYearElement = document.querySelector('#current-year');

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.05,
  smoothTouch: 0.15,
  effects: false,
});

storyLines.forEach((line) => {
  line.dataset.text = line.textContent;
});

if (currentYearElement) {
  currentYearElement.textContent = String(new Date().getFullYear());
}

// --- Materiais e Geometrias Compartilhadas dos Cubos 3D ---
const blackMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x080a0f,
  roughness: 0.2,
  metalness: 0.05,
  clearcoat: 0.65,
  clearcoatRoughness: 0.2,
});

const stickerMaterials = {
  red: new THREE.MeshPhysicalMaterial({ color: 0xe52828, roughness: 0.31, clearcoat: 0.22 }),
  blue: new THREE.MeshPhysicalMaterial({ color: 0x1768dd, roughness: 0.3, clearcoat: 0.2 }),
  white: new THREE.MeshPhysicalMaterial({ color: 0xf6f7f8, roughness: 0.29, clearcoat: 0.16 }),
  orange: new THREE.MeshPhysicalMaterial({ color: 0xf07b1d, roughness: 0.32, clearcoat: 0.2 }),
  green: new THREE.MeshPhysicalMaterial({ color: 0x1a9a5b, roughness: 0.31, clearcoat: 0.2 }),
  yellow: new THREE.MeshPhysicalMaterial({ color: 0xf1c93c, roughness: 0.32, clearcoat: 0.2 }),
};

const cubieGeometry = new RoundedBoxGeometry(0.94, 0.94, 0.94, 5, 0.13);
const stickerGeometry = new RoundedBoxGeometry(0.73, 0.035, 0.73, 4, 0.095);

function addSticker(parent, position, rotation, material, castShadows = true) {
  const sticker = new THREE.Mesh(stickerGeometry, material);
  sticker.position.copy(position);
  sticker.rotation.set(rotation.x, rotation.y, rotation.z);
  sticker.castShadow = castShadows;
  sticker.receiveShadow = castShadows;
  parent.add(sticker);
}

function buildRubiksCube(parentGroup, castShadows = true) {
  const list = [];
  const surface = 0.487;

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const cubie = new THREE.Group();
        cubie.position.set(x * 1.015, y * 1.015, z * 1.015);
        cubie.userData.homePosition = cubie.position.clone();
        cubie.userData.isCubie = true;

        const body = new THREE.Mesh(cubieGeometry, blackMaterial);
        body.castShadow = castShadows;
        body.receiveShadow = castShadows;
        body.userData.cubie = cubie;
        cubie.add(body);

        if (y === 1) addSticker(cubie, new THREE.Vector3(0, surface, 0), new THREE.Euler(0, 0, 0), stickerMaterials.red, castShadows);
        if (y === -1) addSticker(cubie, new THREE.Vector3(0, -surface, 0), new THREE.Euler(0, 0, 0), stickerMaterials.orange, castShadows);
        if (x === 1) addSticker(cubie, new THREE.Vector3(surface, 0, 0), new THREE.Euler(0, 0, Math.PI / 2), stickerMaterials.white, castShadows);
        if (x === -1) addSticker(cubie, new THREE.Vector3(-surface, 0, 0), new THREE.Euler(0, 0, Math.PI / 2), stickerMaterials.yellow, castShadows);
        if (z === 1) addSticker(cubie, new THREE.Vector3(0, 0, surface), new THREE.Euler(Math.PI / 2, 0, 0), stickerMaterials.blue, castShadows);
        if (z === -1) addSticker(cubie, new THREE.Vector3(0, 0, -surface), new THREE.Euler(Math.PI / 2, 0, 0), stickerMaterials.green, castShadows);

        parentGroup.add(cubie);
        list.push(cubie);
      }
    }
  }

  return list;
}

// --- Cena 1: Cubo Mágico Interativo (Hero) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const cubeRoot = new THREE.Group();
scene.add(cubeRoot);

const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ color: 0x10131a, opacity: 0.16 }),
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.y = -1.72;
shadow.receiveShadow = true;
scene.add(shadow);

scene.add(new THREE.HemisphereLight(0xffffff, 0xd9e1ef, 2.4));

const keyLight = new THREE.DirectionalLight(0xffffff, 3.7);
keyLight.position.set(5, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x9dc9ff, 1.35);
rimLight.position.set(-6, 3, -6);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
fillLight.position.set(-2, 1, 8);
scene.add(fillLight);

const cubies = buildRubiksCube(cubeRoot, true);

// --- Cena 2: Cubos 3D da Seção Editorial (Storytelling) ---
const storyScene = new THREE.Scene();
const storyCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
storyCamera.position.set(0, 0, 16);

const storyRenderer = new THREE.WebGLRenderer({
  canvas: storyCanvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
storyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
storyRenderer.setClearColor(0x000000, 0);
storyRenderer.outputColorSpace = THREE.SRGBColorSpace;
storyRenderer.toneMapping = THREE.ACESFilmicToneMapping;
storyRenderer.toneMappingExposure = 1.15;

storyScene.add(new THREE.HemisphereLight(0xffffff, 0x141824, 2.6));

const storyKeyLight = new THREE.DirectionalLight(0xffffff, 3.4);
storyKeyLight.position.set(4, 7, 10);
storyScene.add(storyKeyLight);

const storyRimLight = new THREE.DirectionalLight(0x7fb6ff, 2.2);
storyRimLight.position.set(-8, 4, -5);
storyScene.add(storyRimLight);

const storyFillLight = new THREE.DirectionalLight(0xffffff, 1.2);
storyFillLight.position.set(-2, -5, 6);
storyScene.add(storyFillLight);

// Os dois cubos mostram cantos opostos: azul/amarelo/laranja à esquerda
// e vermelho/branco/verde à direita. A orientação é feita pelo canto que
// aponta para a câmera para que as três cores corretas permaneçam visíveis.
function orientStoryCorner(group, corner, viewDirection, roll = 0) {
  const cornerDirection = corner.clone().normalize();
  const view = viewDirection.clone().normalize();
  const alignment = new THREE.Quaternion().setFromUnitVectors(cornerDirection, view);
  const rollQuaternion = new THREE.Quaternion().setFromAxisAngle(view, roll);
  group.quaternion.copy(rollQuaternion.multiply(alignment));
}

const storyCubeLeft = new THREE.Group();
const storyCubeLeftInner = new THREE.Group();
buildRubiksCube(storyCubeLeftInner, false);
orientStoryCorner(
  storyCubeLeftInner,
  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(0.49, 0, 0.87),
  -0.22,
);
storyCubeLeft.add(storyCubeLeftInner);
storyScene.add(storyCubeLeft);

const storyCubeRight = new THREE.Group();
const storyCubeRightInner = new THREE.Group();
buildRubiksCube(storyCubeRightInner, false);
orientStoryCorner(
  storyCubeRightInner,
  new THREE.Vector3(1, 1, -1),
  new THREE.Vector3(-0.49, 0, 0.87),
  -0.22,
);
storyCubeRight.add(storyCubeRightInner);
storyScene.add(storyCubeRight);

const storyLayout = {
  frustumWidth: 16,
  frustumHeight: 10,
  baseScale: 1.9,
};

const leftBasePos = { x: 0, y: 0 };
const rightBasePos = { x: 0, y: 0 };
const storyScrollProgress = { value: 0 };

function updateStoryCubes(progress, isMobile) {
  const fw = storyLayout.frustumWidth;
  const fh = storyLayout.frustumHeight;

  // Os cubos entram pelas diagonais superiores/inferiores e convergem para o centro.
  const leftStartX = isMobile ? -fw * 0.82 : -fw * 0.62;
  const leftStartY = isMobile ? fh * 0.42 : fh * 0.40;
  const leftEndX = isMobile ? -fw * 0.72 : -fw * 0.52;
  const leftEndY = 0;

  const rightStartX = isMobile ? fw * 0.82 : fw * 0.62;
  const rightStartY = isMobile ? -fh * 0.42 : -fh * 0.40;
  const rightEndX = isMobile ? fw * 0.72 : fw * 0.52;
  const rightEndY = 0;

  leftBasePos.x = leftStartX + (leftEndX - leftStartX) * progress;
  leftBasePos.y = leftStartY + (leftEndY - leftStartY) * progress;
  storyCubeLeft.position.set(leftBasePos.x, leftBasePos.y, 0);

  rightBasePos.x = rightStartX + (rightEndX - rightStartX) * progress;
  rightBasePos.y = rightStartY + (rightEndY - rightStartY) * progress;
  storyCubeRight.position.set(rightBasePos.x, rightBasePos.y, 0);

  // Inclinação mais evidente, mantendo o mesmo ângulo visual nos dois lados.
  const leftRotX = 0.12 + 0.05 * progress;
  const leftRotY = 0.12 - 0.05 * progress;
  const leftRotZ = -0.42 + 0.08 * progress;
  storyCubeLeft.rotation.set(leftRotX, leftRotY, leftRotZ, 'XYZ');

  const rightRotX = 0.12 + 0.05 * progress;
  const rightRotY = 0.12 - 0.05 * progress;
  const rightRotZ = -0.42 + 0.08 * progress;
  storyCubeRight.rotation.set(rightRotX, rightRotY, rightRotZ, 'XYZ');
}

function updateStoryDimensions() {
  if (!storyCanvas) return;
  const { width, height } = storyCanvas.getBoundingClientRect();
  if (!width || !height) return;
  storyRenderer.setSize(width, height, false);
  storyCamera.aspect = width / height;
  storyCamera.updateProjectionMatrix();

  const vFOV = THREE.MathUtils.degToRad(storyCamera.fov);
  storyLayout.frustumHeight = 2 * Math.tan(vFOV / 2) * storyCamera.position.z;
  storyLayout.frustumWidth = storyLayout.frustumHeight * storyCamera.aspect;

  const isMobile = width <= 700;
  storyLayout.baseScale = isMobile
    ? Math.max(0.85, Math.min(storyLayout.frustumWidth * 0.17, 1.15))
    : Math.max(1.45, Math.min(storyLayout.frustumWidth * 0.095, 1.85));

  storyCubeLeft.scale.setScalar(storyLayout.baseScale);
  storyCubeRight.scale.setScalar(storyLayout.baseScale);

  updateStoryCubes(storyScrollProgress.value, isMobile);
}

let isStoryVisible = false;
const storyVisibilityObserver = new IntersectionObserver(
  (entries) => {
    isStoryVisible = entries[0].isIntersecting;
  },
  { rootMargin: '120px 0px 120px 0px' },
);
if (storySection) {
  storyVisibilityObserver.observe(storySection);
}

function setupStoryMotion() {
  const media = gsap.matchMedia();

  media.add(
    {
      isDesktop: '(min-width: 701px)',
      isMobile: '(max-width: 700px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isMobile, reduceMotion } = context.conditions;
      if (reduceMotion) {
        updateStoryCubes(0.5, isMobile);
        return undefined;
      }

      gsap.fromTo(
        storyLines,
        { '--story-reveal': '100%' },
        {
          '--story-reveal': '0%',
          ease: 'none',
          stagger: isMobile ? 0.08 : 0.14,
          scrollTrigger: {
            trigger: storySection,
            start: isMobile ? 'top 72%' : 'top 70%',
            end: isMobile ? 'center 43%' : 'center 48%',
            scrub: 0.65,
          },
        },
      );

      gsap.fromTo(
        storyCopy,
        { y: isMobile ? 20 : 32, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: storySection,
            start: isMobile ? 'top 42%' : 'top 38%',
            end: isMobile ? 'center 36%' : 'center 32%',
            scrub: 0.55,
          },
        },
      );

      gsap.fromTo(
        storyScrollProgress,
        { value: 0 },
        {
          value: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: storySection,
            // O movimento começa quando 20% da seção já entrou na viewport.
            start: () => `top ${Math.round(window.innerHeight - storySection.offsetHeight * 0.2)}px`,
            // Os cubos terminam centralizados enquanto a segunda seção ainda
            // está inteira na viewport, antes da transição para a terceira.
            end: 'bottom bottom',
            scrub: 0.8,
            onUpdate: (self) => {
              storyScrollProgress.value = self.progress;
              updateStoryCubes(self.progress, isMobile);
            },
          },
        },
      );

      return undefined;
    },
  );

  ScrollTrigger.refresh();
}

// --- Cena 3: Vista explodida e montagem guiada pelo scroll ---
const assemblyScene = new THREE.Scene();
const assemblyCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
assemblyCamera.position.set(0, 0, 16);

const assemblyRenderer = new THREE.WebGLRenderer({
  canvas: assemblyCanvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
assemblyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
assemblyRenderer.setClearColor(0x000000, 0);
assemblyRenderer.outputColorSpace = THREE.SRGBColorSpace;
assemblyRenderer.toneMapping = THREE.ACESFilmicToneMapping;
assemblyRenderer.toneMappingExposure = 1.12;

assemblyScene.add(new THREE.HemisphereLight(0xffffff, 0x121722, 2.4));

const assemblyKeyLight = new THREE.DirectionalLight(0xffffff, 3.6);
assemblyKeyLight.position.set(5, 8, 10);
assemblyScene.add(assemblyKeyLight);

const assemblyRimLight = new THREE.DirectionalLight(0x6ea8ff, 2.4);
assemblyRimLight.position.set(-7, 3, -6);
assemblyScene.add(assemblyRimLight);

const assemblyCube = new THREE.Group();
const assemblyCubies = buildRubiksCube(assemblyCube, false);
assemblyCube.rotation.set(0.34, -0.5, 0.08, 'XYZ');
assemblyScene.add(assemblyCube);

const assemblyLayout = {
  frustumWidth: 16,
  frustumHeight: 10,
  baseScale: 1.3,
};
const assemblyScrollProgress = { value: 0 };

function updateAssemblyCubes(progress, isCompact) {
  const explosionDistance = isCompact ? 2.05 : 2.45;
  const maxRadius = Math.sqrt(3) * 1.015;

  assemblyCubies.forEach((cubie) => {
    const homePosition = cubie.userData.homePosition;
    const radius = homePosition.length() / maxRadius;
    const start = 0.08 + radius * 0.13;
    const end = 0.60 + radius * 0.22;
    const localProgress = THREE.MathUtils.clamp(
      (progress - start) / (end - start),
      0,
      1,
    );
    const eased = 1 - (1 - localProgress) ** 3;
    const distance = 1 + (explosionDistance - 1) * (1 - eased);

    cubie.position.copy(homePosition).multiplyScalar(distance);
  });

  assemblyCube.rotation.y = -0.5 + progress * 0.24;
  assemblyCube.rotation.x = 0.34 - progress * 0.06;
}

function updateAssemblyDimensions() {
  if (!assemblyCanvas) return;
  const { width, height } = assemblyCanvas.getBoundingClientRect();
  if (!width || !height) return;

  assemblyRenderer.setSize(width, height, false);
  assemblyCamera.aspect = width / height;
  assemblyCamera.updateProjectionMatrix();

  const vFOV = THREE.MathUtils.degToRad(assemblyCamera.fov);
  assemblyLayout.frustumHeight = 2 * Math.tan(vFOV / 2) * assemblyCamera.position.z;
  assemblyLayout.frustumWidth = assemblyLayout.frustumHeight * assemblyCamera.aspect;

  const isMobile = width <= 700;
  const isCompact = width <= 900;
  const isNarrowMobile = isMobile && width <= 340;
  const isShortLandscape = isMobile && window.innerWidth > window.innerHeight && window.innerHeight <= 420;
  assemblyLayout.baseScale = isMobile
    ? Math.max(0.68, Math.min(assemblyLayout.frustumWidth * 0.18, 0.95))
    : isCompact
      ? Math.max(0.82, Math.min(assemblyLayout.frustumWidth * 0.12, 1.05))
    : Math.max(1.05, Math.min(assemblyLayout.frustumWidth * 0.067, 1.35));

  assemblyCube.scale.setScalar(assemblyLayout.baseScale);
  assemblyCube.position.set(
    isMobile ? 0 : assemblyLayout.frustumWidth * (isCompact ? 0.27 : 0.19),
    isMobile
      ? -assemblyLayout.frustumHeight * (isShortLandscape ? 0.65 : isNarrowMobile ? 0.4 : 0.18)
      : isCompact
        ? -assemblyLayout.frustumHeight * 0.08
        : 0,
    0,
  );
  updateAssemblyCubes(assemblyScrollProgress.value, isCompact);
}

let isAssemblyVisible = false;
const assemblyVisibilityObserver = new IntersectionObserver(
  (entries) => {
    isAssemblyVisible = entries[0].isIntersecting;
  },
  { rootMargin: '120px 0px 120px 0px' },
);
if (assemblySection) {
  assemblyVisibilityObserver.observe(assemblySection);
}

function setupAssemblyMotion() {
  if (!assemblySection) return;

  const media = gsap.matchMedia();

  media.add(
    {
      isDesktop: '(min-width: 701px)',
      isMobile: '(max-width: 700px)',
      isCompact: '(max-width: 900px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const { isCompact, reduceMotion } = context.conditions;
      if (reduceMotion) {
        updateAssemblyCubes(1, isCompact);
        return undefined;
      }

      gsap.fromTo(
        assemblyScrollProgress,
        { value: 0 },
        {
          value: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: assemblySection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            pin: assemblyStage,
            pinSpacing: false,
            anticipatePin: 1,
            onUpdate: (self) => {
              assemblyScrollProgress.value = self.progress;
              updateAssemblyCubes(self.progress, isCompact);
            },
          },
        },
      );

      return undefined;
    },
  );

  ScrollTrigger.refresh();
}

// --- Cena 4: Cubo final em loop automático ---
const finalScene = new THREE.Scene();
const finalCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
finalCamera.position.set(0, 0, 16);

const finalRenderer = new THREE.WebGLRenderer({
  canvas: finalCanvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
finalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
finalRenderer.setClearColor(0x000000, 0);
finalRenderer.outputColorSpace = THREE.SRGBColorSpace;
finalRenderer.toneMapping = THREE.ACESFilmicToneMapping;
finalRenderer.toneMappingExposure = 1.05;

finalScene.add(new THREE.HemisphereLight(0xffffff, 0xc8d2e2, 2.25));

const finalKeyLight = new THREE.DirectionalLight(0xffffff, 3.45);
finalKeyLight.position.set(5, 8, 10);
finalScene.add(finalKeyLight);

const finalRimLight = new THREE.DirectionalLight(0x8fb9ff, 1.55);
finalRimLight.position.set(-7, 4, -6);
finalScene.add(finalRimLight);

const finalFillLight = new THREE.DirectionalLight(0xffffff, 0.7);
finalFillLight.position.set(-2, -4, 8);
finalScene.add(finalFillLight);

const finalCube = new THREE.Group();
const finalCubies = buildRubiksCube(finalCube, false);
finalScene.add(finalCube);

const finalLayout = {
  frustumWidth: 16,
  frustumHeight: 10,
  baseScale: 1.35,
};

const finalReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finalMaxExplosion = 1.46;

function easeFinalAssembly(value) {
  return value < 0.5
    ? 4 * value ** 3
    : 1 - ((-2 * value + 2) ** 3) / 2;
}

function updateFinalCubes(time, isCompact) {
  const cycle = finalReducedMotion.matches
    ? 0.5
    : (time * 0.00012 + 0.5) % 1;
  const assemblyProgress = 1 - Math.abs(cycle * 2 - 1);
  const explosionDistance = isCompact ? 1.3 : finalMaxExplosion;
  const maxRadius = Math.sqrt(3) * 1.015;

  finalCubies.forEach((cubie) => {
    const homePosition = cubie.userData.homePosition;
    const radius = homePosition.length() / maxRadius;
    const stagger = radius * 0.12;
    const localProgress = THREE.MathUtils.clamp(
      (assemblyProgress - stagger) / (1 - stagger),
      0,
      1,
    );
    const eased = easeFinalAssembly(localProgress);
    const distance = 1 + (explosionDistance - 1) * (1 - eased);

    cubie.position.copy(homePosition).multiplyScalar(distance);
  });

  finalCube.rotation.y = -0.5 + time * 0.00017;
  finalCube.rotation.x = 0.34 + Math.sin(time * 0.00025) * 0.04;
  finalCube.rotation.z = 0.08 + Math.sin(time * 0.00019) * 0.025;
}

function updateFinalDimensions() {
  if (!finalCanvas) return;
  const { width, height } = finalCanvas.getBoundingClientRect();
  if (!width || !height) return;

  finalRenderer.setSize(width, height, false);
  finalCamera.aspect = width / height;
  finalCamera.updateProjectionMatrix();

  const vFOV = THREE.MathUtils.degToRad(finalCamera.fov);
  finalLayout.frustumHeight = 2 * Math.tan(vFOV / 2) * finalCamera.position.z;
  finalLayout.frustumWidth = finalLayout.frustumHeight * finalCamera.aspect;

  const isMobile = width <= 700;
  const isCompact = width <= 900;
  const isCompactLandscape = isCompact && window.innerWidth > window.innerHeight;
  const isShortLandscape = isCompactLandscape && window.innerHeight <= 420;
  const isUltraNarrowPortrait = isMobile && !isCompactLandscape && window.innerWidth <= 310;
  const isCompactDesktop = !isCompact && width <= 1140;
  finalLayout.baseScale = isCompactLandscape
    ? Math.max(0.62, Math.min(finalLayout.frustumWidth * 0.11, 0.84))
    : isMobile
      ? Math.max(isUltraNarrowPortrait ? 0.68 : 0.75, Math.min(finalLayout.frustumWidth * 0.17, 1.02))
      : isCompact
        ? Math.max(0.82, Math.min(finalLayout.frustumWidth * 0.12, 1.0))
        : isCompactDesktop
          ? Math.max(0.92, Math.min(finalLayout.frustumWidth * 0.085, 0.98))
          : Math.max(1.15, Math.min(finalLayout.frustumWidth * 0.08, 1.55));

  finalCube.scale.setScalar(finalLayout.baseScale);
  finalCube.position.set(
    isMobile
      ? 0
      : finalLayout.frustumWidth * (isCompactLandscape ? 0.29 : isCompact ? 0.2 : isCompactDesktop ? 0.23 : 0.2),
    isMobile
      ? -finalLayout.frustumHeight * (isCompactLandscape ? (isShortLandscape ? 0.15 : 0.02) : isUltraNarrowPortrait ? 0.11 : 0.02)
      : isCompactLandscape
        ? -finalLayout.frustumHeight * 0.08
        : isCompact
          ? -finalLayout.frustumHeight * 0.05
          : 0.02,
    0,
  );
  updateFinalCubes(performance.now(), isCompact);
}

let isFinalVisible = false;
const finalVisibilityObserver = new IntersectionObserver(
  (entries) => {
    isFinalVisible = entries[0].isIntersecting;
  },
  { rootMargin: '120px 0px 120px 0px' },
);
if (finalSection) {
  finalVisibilityObserver.observe(finalSection);
}

const DEFAULT_VIEW = Object.freeze({
  azimuth: 0.79,
  polar: 1.02,
});

const DEFAULT_ORIENTATION = new THREE.Quaternion()
  .setFromAxisAngle(new THREE.Vector3(0, 1, 0), DEFAULT_VIEW.azimuth)
  .multiply(
    new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      DEFAULT_VIEW.polar - Math.PI / 2,
    ),
  );

const cameraState = {
  orientation: DEFAULT_ORIENTATION.clone(),
  baseRadius: 10.2,
  radius: 10.2,
};

const cameraOffset = new THREE.Vector3();
const cameraUp = new THREE.Vector3();

function updateCamera() {
  const { orientation, radius } = cameraState;
  cameraOffset.set(0, 0, radius).applyQuaternion(orientation);
  cameraUp.set(0, 1, 0).applyQuaternion(orientation);
  camera.position.copy(cameraOffset);
  camera.up.copy(cameraUp);
  camera.lookAt(0, 0, 0);
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const WORLD_AXES = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

const MOVE_LIBRARY = [
  { name: 'R', axis: 'x', layer: 1, direction: -1 },
  { name: 'L', axis: 'x', layer: -1, direction: 1 },
  { name: 'U', axis: 'y', layer: 1, direction: 1 },
  { name: 'D', axis: 'y', layer: -1, direction: -1 },
  { name: 'F', axis: 'z', layer: 1, direction: -1 },
  { name: 'B', axis: 'z', layer: -1, direction: 1 },
  { name: 'M', axis: 'x', layer: 0, direction: 1 },
  { name: 'E', axis: 'y', layer: 0, direction: -1 },
  { name: 'S', axis: 'z', layer: 0, direction: -1 },
];

const KEY_MOVES = Object.fromEntries(
  MOVE_LIBRARY.map((move) => [move.name.toLowerCase(), move]),
);

const game = {
  stateMoves: [],
  manualMoves: [],
  moveLog: [],
  moveCount: 0,
  queue: [],
  phase: 'ready',
  scrambleMovesRemaining: 0,
  solveMovesRemaining: 0,
  message: 'Pronto para embaralhar.',
};

const timer = {
  elapsed: 0,
  startedAt: null,
  running: false,
  label: '00:00',
};

function getTimerElapsed(now = performance.now()) {
  return timer.elapsed + (timer.running ? now - timer.startedAt : 0);
}

function updateTimer(now = performance.now()) {
  const label = formatTime(getTimerElapsed(now));
  if (label === timer.label) return;
  timer.label = label;
  timerElement.textContent = label;
}

function resetTimer() {
  timer.elapsed = 0;
  timer.startedAt = null;
  timer.running = false;
  timer.label = '00:00';
  timerElement.textContent = timer.label;
}

function startTimer() {
  if (timer.running) return;
  timer.startedAt = performance.now();
  timer.running = true;
}

function stopTimer() {
  if (!timer.running) return;
  timer.elapsed = getTimerElapsed();
  timer.startedAt = null;
  timer.running = false;
  updateTimer();
}

const activePointers = new Map();
let primaryPointerId = null;
let interaction = null;
let rotating = null;
let interactionMode = 'pieces';
const orbitDeltaEuler = new THREE.Euler(0, 0, 0, 'YXZ');
const orbitDeltaQuaternion = new THREE.Quaternion();

function setPointerFromEvent(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
}

function getHit(event) {
  setPointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cubeRoot.children, true)[0];
  if (!hit) return null;
  let cubie = hit.object;
  while (cubie && !cubie.userData.isCubie) cubie = cubie.parent;
  if (!cubie) return null;
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  return { cubie, normal };
}

function snapToCubeAxis(vector) {
  const components = [Math.abs(vector.x), Math.abs(vector.y), Math.abs(vector.z)];
  const index = components.indexOf(Math.max(...components));
  return WORLD_AXES[index].clone().multiplyScalar(Math.sign(vector.getComponent(index)) || 1);
}

function getScreenVector(worldVector) {
  const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  return new THREE.Vector2(
    worldVector.dot(cameraRight),
    -worldVector.dot(cameraUp),
  );
}

function choosePhysicalTurn(normal, deltaX, deltaY) {
  const drag = new THREE.Vector2(deltaX, deltaY).normalize();
  const tangents = WORLD_AXES
    .filter((axis) => Math.abs(axis.dot(normal)) < 0.1)
    .flatMap((axis) => [axis.clone(), axis.clone().negate()]);

  let bestTangent = tangents[0];
  let bestScore = -Infinity;
  tangents.forEach((tangent) => {
    const projected = getScreenVector(tangent);
    if (projected.lengthSq() < 0.0001) return;
    const score = projected.normalize().dot(drag);
    if (score > bestScore) {
      bestScore = score;
      bestTangent = tangent;
    }
  });

  const rotationVector = snapToCubeAxis(normal.clone().cross(bestTangent));
  const components = [Math.abs(rotationVector.x), Math.abs(rotationVector.y), Math.abs(rotationVector.z)];
  const axisIndex = components.indexOf(Math.max(...components));
  const axis = ['x', 'y', 'z'][axisIndex];
  return { axis, direction: Math.sign(rotationVector[axis]) || 1 };
}

function getTouchCentroid() {
  const touchPoints = [...activePointers.values()].filter((point) => point.pointerType === 'touch');
  if (touchPoints.length < 2) return null;
  return touchPoints.reduce(
    (centroid, point) => ({
      x: centroid.x + point.x / touchPoints.length,
      y: centroid.y + point.y / touchPoints.length,
    }),
    { x: 0, y: 0 },
  );
}

function startOrbit(point) {
  interaction = {
    kind: 'orbit',
    start: point,
    orientation: cameraState.orientation.clone(),
  };
  canvas.classList.add('is-dragging');
}

function setInteractionMode(mode) {
  interactionMode = mode;
  const exploring = mode === 'orbit';
  viewModeButton.textContent = exploring ? 'Mover peças' : 'Explorar cubo';
  viewModeButton.setAttribute('aria-pressed', String(exploring));
  viewModeButton.classList.toggle('is-active', exploring);
  canvas.classList.toggle('is-exploring', exploring);
  if (!isBusy()) {
    game.message = exploring
      ? 'Giro livre ativado. Arraste o cubo para explorar em 360° em qualquer direção.'
      : 'Modo de peças ativado. Arraste uma peça para movimentar a camada.';
  }
  updateInterface();
}

function centerView() {
  cameraState.orientation.copy(DEFAULT_ORIENTATION);
  if (!isBusy()) {
    game.message = 'Visão centralizada.';
    updateInterface();
  }
}

function normalizeMove(move) {
  const definition = MOVE_LIBRARY.find(
    (candidate) => candidate.axis === move.axis && candidate.layer === move.layer,
  );
  const direction = move.direction >= 0 ? 1 : -1;
  const fallbackName = `${move.axis.toUpperCase()}${move.layer}`;
  const name = definition?.name ?? fallbackName;
  const canonicalDirection = definition?.direction ?? 1;
  return {
    axis: move.axis,
    layer: move.layer,
    direction,
    name,
    notation: direction === canonicalDirection ? name : `${name}′`,
  };
}

function inverseMove(move) {
  return normalizeMove({ ...move, direction: -move.direction });
}

function sameLayer(first, second) {
  return first.axis === second.axis && first.layer === second.layer;
}

function appendStateMove(move) {
  const lastMove = game.stateMoves.at(-1);
  if (lastMove && sameLayer(lastMove, move) && lastMove.direction === -move.direction) {
    game.stateMoves.pop();
    return;
  }
  game.stateMoves.push(move);
}

function queueMove(move, source) {
  game.queue.push({ move: normalizeMove(move), source });
  processMoveQueue();
  updateInterface();
}

function processMoveQueue() {
  if (rotating || !game.queue.length) return;
  startTurn(game.queue.shift());
}

function startTurn(action) {
  const { axis, layer, direction } = action.move;

  const pivot = new THREE.Group();
  cubeRoot.add(pivot);
  const selected = cubies.filter((cubie) => Math.round(cubie.position[axis] / 1.015) === layer);
  selected.forEach((cubie) => pivot.attach(cubie));

  rotating = {
    pivot,
    selected,
    axis,
    action,
    target: direction * Math.PI / 2,
    elapsed: 0,
    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 55
      : action.source === 'solve'
        ? 320
        : action.source === 'manual' || action.source === 'undo'
          ? 245
          : 125,
  };
  canvas.classList.add('is-turning');
}

function logMove(move) {
  game.moveLog.push(move);
}

function recordCompletedTurn(action) {
  const { move, source } = action;

  if (source === 'manual') {
    appendStateMove(move);
    game.manualMoves.push(move);
    game.moveCount += 1;
    logMove(move);
    game.message = `${move.notation} registrado.`;
  }

  if (source === 'undo') {
    appendStateMove(move);
    game.moveCount += 1;
    logMove(move);
    game.message = `${move.notation} desfeito.`;
  }

  if (source === 'scramble') {
    appendStateMove(move);
    game.scrambleMovesRemaining -= 1;
    if (game.scrambleMovesRemaining === 0) {
      game.phase = 'ready';
      startTimer();
      game.message = 'Embaralhado. Seu contador começou em zero.';
    }
  }

  if (source === 'solve') {
    game.moveCount += 1;
    logMove(move);
    game.solveMovesRemaining -= 1;
    if (game.solveMovesRemaining === 0) {
      game.stateMoves = [];
      game.manualMoves = [];
      game.phase = 'completed';
      stopTimer();
      game.message = 'Cubo concluído.';
    }
  }
}

function finishTurn() {
  const { pivot, selected, action } = rotating;
  selected.forEach((cubie) => {
    cubeRoot.attach(cubie);
    cubie.position.x = Math.round(cubie.position.x / 1.015) * 1.015;
    cubie.position.y = Math.round(cubie.position.y / 1.015) * 1.015;
    cubie.position.z = Math.round(cubie.position.z / 1.015) * 1.015;
    cubie.rotation.set(
      Math.round(cubie.rotation.x / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(cubie.rotation.y / (Math.PI / 2)) * (Math.PI / 2),
      Math.round(cubie.rotation.z / (Math.PI / 2)) * (Math.PI / 2),
    );
  });
  cubeRoot.remove(pivot);
  rotating = null;
  canvas.classList.remove('is-turning');
  recordCompletedTurn(action);
  processMoveQueue();
  updateInterface();
}

function createScramble(length = 24) {
  const outerMoves = MOVE_LIBRARY.filter((move) => move.layer !== 0);
  const scramble = [];
  while (scramble.length < length) {
    const candidate = outerMoves[Math.floor(Math.random() * outerMoves.length)];
    const previous = scramble.at(-1);
    if (previous?.axis === candidate.axis) continue;
    scramble.push(normalizeMove({ ...candidate, direction: Math.random() > 0.5 ? candidate.direction : -candidate.direction }));
  }
  return scramble;
}

function resetCubeToSolved() {
  cubies.forEach((cubie) => {
    cubeRoot.attach(cubie);
    cubie.position.copy(cubie.userData.homePosition);
    cubie.rotation.set(0, 0, 0);
    cubie.quaternion.identity();
  });
}

function startScramble() {
  if (isBusy()) return;
  resetCubeToSolved();
  resetTimer();
  game.stateMoves = [];
  game.manualMoves = [];
  game.moveLog = [];
  game.moveCount = 0;
  game.phase = 'scrambling';
  game.message = 'Embaralhando…';
  const scramble = createScramble();
  game.scrambleMovesRemaining = scramble.length;
  scramble.forEach((move) => queueMove(move, 'scramble'));
  updateInterface();
}

function undoLastManualMove() {
  if (isBusy() || !game.manualMoves.length) return;
  const lastMove = game.manualMoves.pop();
  game.message = 'Desfazendo…';
  queueMove(inverseMove(lastMove), 'undo');
  updateInterface();
}

function solveCube() {
  if (isBusy()) return;
  if (!game.stateMoves.length) {
    game.phase = 'completed';
    stopTimer();
    game.message = 'O cubo já está concluído.';
    updateInterface();
    return;
  }

  const solution = game.stateMoves.slice().reverse().map(inverseMove);
  game.phase = 'solving';
  game.message = 'Concluindo…';
  game.solveMovesRemaining = solution.length;
  solution.forEach((move) => queueMove(move, 'solve'));
  updateInterface();
}

function isBusy() {
  return Boolean(rotating || game.queue.length || game.phase === 'scrambling' || game.phase === 'solving');
}

function updateInterface() {
  const busy = isBusy();
  moveCountElement.textContent = String(game.moveCount);
  gameStatusElement.textContent = game.message;
  undoButton.disabled = busy || !game.manualMoves.length;
  shuffleButton.disabled = busy;
  solveButton.disabled = busy || !game.stateMoves.length;
  viewModeButton.disabled = busy;

  moveHistoryElement.replaceChildren();
  if (!game.moveLog.length) {
    const empty = document.createElement('span');
    empty.className = 'empty-history';
    empty.textContent = '—';
    moveHistoryElement.append(empty);
    return;
  }

  game.moveLog.forEach((move) => {
    const item = document.createElement('span');
    item.className = 'move-token';
    item.textContent = move.notation;
    moveHistoryElement.append(item);
  });
  moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
}

function onPointerDown(event) {
  if (rotating) return;
  activePointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
    pointerType: event.pointerType,
  });
  canvas.setPointerCapture(event.pointerId);

  const touchCentroid = getTouchCentroid();
  if (touchCentroid) {
    primaryPointerId = null;
    startOrbit(touchCentroid);
    return;
  }

  if (primaryPointerId !== null) return;
  primaryPointerId = event.pointerId;
  const hit = getHit(event);
  if (interactionMode === 'orbit' || event.shiftKey || event.button === 2 || !hit) {
    startOrbit({ x: event.clientX, y: event.clientY });
    return;
  }

  interaction = {
    kind: 'face',
    cubie: hit.cubie,
    normal: snapToCubeAxis(hit.normal),
    start: { x: event.clientX, y: event.clientY },
    committed: false,
  };
  canvas.classList.add('is-dragging');
}

function onPointerMove(event) {
  if (!activePointers.has(event.pointerId) || !interaction) return;
  activePointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
    pointerType: event.pointerType,
  });

  if (interaction.kind === 'orbit') {
    const orbitPoint = getTouchCentroid() ?? { x: event.clientX, y: event.clientY };
    const deltaX = orbitPoint.x - interaction.start.x;
    const deltaY = orbitPoint.y - interaction.start.y;
    orbitDeltaEuler.set(-deltaY * 0.0055, -deltaX * 0.0055, 0);
    orbitDeltaQuaternion.setFromEuler(orbitDeltaEuler);
    cameraState.orientation
      .copy(interaction.orientation)
      .multiply(orbitDeltaQuaternion)
      .normalize();
    return;
  }

  if (event.pointerId !== primaryPointerId) return;
  const deltaX = event.clientX - interaction.start.x;
  const deltaY = event.clientY - interaction.start.y;
  if (!interaction.committed && Math.hypot(deltaX, deltaY) > 18) {
    const { axis, direction } = choosePhysicalTurn(interaction.normal, deltaX, deltaY);
    const layerValue = Math.round(interaction.cubie.position[axis] / 1.015);
    interaction.committed = true;
    queueMove({ axis, layer: layerValue, direction }, 'manual');
  }
}

function endPointer(event) {
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  activePointers.delete(event.pointerId);

  if (interaction?.kind === 'orbit' && getTouchCentroid()) return;
  if (event.pointerId === primaryPointerId || !activePointers.size || interaction?.kind === 'orbit') {
    primaryPointerId = null;
    interaction = null;
    canvas.classList.remove('is-dragging');
  }
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('contextmenu', (event) => event.preventDefault());

undoButton.addEventListener('click', undoLastManualMove);
shuffleButton.addEventListener('click', startScramble);
solveButton.addEventListener('click', solveCube);
viewModeButton.addEventListener('click', () => {
  setInteractionMode(interactionMode === 'orbit' ? 'pieces' : 'orbit');
});
centerViewButton.addEventListener('click', centerView);

document.addEventListener('keydown', (event) => {
  if (event.repeat || event.metaKey || event.altKey) return;
  if (event.target.closest('button, a, input, textarea, select')) return;

  const key = event.key.toLowerCase();
  if ((event.ctrlKey && key === 'z') || key === 'z') {
    event.preventDefault();
    undoLastManualMove();
    return;
  }

  if (key === 'h') {
    event.preventDefault();
    startScramble();
    return;
  }

  if (key === 'c') {
    event.preventDefault();
    solveCube();
    return;
  }

  if (key === 'v' && !isBusy()) {
    event.preventDefault();
    setInteractionMode(interactionMode === 'orbit' ? 'pieces' : 'orbit');
    return;
  }

  const template = KEY_MOVES[key];
  if (!template || isBusy()) return;
  event.preventDefault();
  queueMove({ ...template, direction: event.shiftKey ? -template.direction : template.direction }, 'manual');
});

function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  cameraState.radius = Math.max(cameraState.baseRadius, 8.5 / Math.max(camera.aspect, 0.45));
}

const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(canvas);

const storyResizeObserver = new ResizeObserver(updateStoryDimensions);
if (storyCanvas) storyResizeObserver.observe(storyCanvas);

const assemblyResizeObserver = new ResizeObserver(updateAssemblyDimensions);
if (assemblyCanvas) assemblyResizeObserver.observe(assemblyCanvas);

const finalResizeObserver = new ResizeObserver(updateFinalDimensions);
if (finalCanvas) finalResizeObserver.observe(finalCanvas);

resize();
updateStoryDimensions();
updateAssemblyDimensions();
updateFinalDimensions();
updateCamera();
updateInterface();
setupStoryMotion();
setupAssemblyMotion();

let responsiveResizeFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(responsiveResizeFrame);
  responsiveResizeFrame = requestAnimationFrame(() => {
    resize();
    updateStoryDimensions();
    updateAssemblyDimensions();
    updateFinalDimensions();
    ScrollTrigger.refresh();
  });
});

let previousTime = performance.now();
function animate(now) {
  const delta = now - previousTime;
  previousTime = now;

  if (rotating) {
    rotating.elapsed += delta;
    const progress = Math.min(rotating.elapsed / rotating.duration, 1);
    const eased = rotating.action.source === 'solve'
      ? 0.5 - Math.cos(progress * Math.PI) / 2
      : 1 - (1 - progress) ** 3;
    rotating.pivot.rotation[rotating.axis] = rotating.target * eased;
    if (progress === 1) finishTurn();
  }

  updateTimer(now);
  updateCamera();
  renderer.render(scene, camera);

  if (isStoryVisible) {
    const idle = Math.sin(now * 0.0012) * 0.05;
    storyCubeLeft.position.y = leftBasePos.y + idle;
    storyCubeRight.position.y = rightBasePos.y - idle;
    storyRenderer.render(storyScene, storyCamera);
  }

  if (isAssemblyVisible) {
    assemblyRenderer.render(assemblyScene, assemblyCamera);
  }

  if (isFinalVisible) {
    const finalWidth = finalCanvas.getBoundingClientRect().width;
    updateFinalCubes(now, finalWidth <= 900);
    finalRenderer.render(finalScene, finalCamera);
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
