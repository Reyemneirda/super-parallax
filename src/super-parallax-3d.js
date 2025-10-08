/**
 * SuperParallax3D - A Three.js-based 3D parallax effect
 * Creates true 3D depth with WebGL rendering
 *
 * NOTE: Requires Three.js to be loaded
 * Include: <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
 */
class SuperParallax3D {
  constructor(container, options = {}) {
    if (typeof THREE === 'undefined') {
      throw new Error('Three.js is required. Include it before SuperParallax3D.');
    }

    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Default options
    this.options = {
      scrollMultiplier: 0.5,
      mouseMultiplier: 2,
      smoothing: 0.08,
      fov: 75,
      cameraZ: 5,
      ...options
    };

    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.layers = [];

    // State
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.scroll = 0;
    this.targetScroll = 0;
    this.isActive = false;
    this.animationFrameId = null;

    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);

    this.init();
  }

  init() {
    // Set up Three.js scene
    this.scene = new THREE.Scene();

    // Camera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      this.options.fov,
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = this.options.cameraZ;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    // Find and convert DOM layers to 3D layers
    this.createLayers();

    // Event listeners
    this.addEventListeners();

    // Start animation
    this.start();
  }

  createLayers() {
    const domLayers = this.container.querySelectorAll('[data-parallax-layer]');

    domLayers.forEach((element, index) => {
      const depth = parseFloat(element.getAttribute('data-parallax-depth')) || 0;
      const scrollSpeed = parseFloat(element.getAttribute('data-parallax-scroll')) || depth;
      const mouseSpeed = parseFloat(element.getAttribute('data-parallax-mouse')) || depth;

      // Get element properties
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Hide original element
      element.style.visibility = 'hidden';

      // Create texture from element (for images)
      let mesh;
      const img = element.querySelector('img');

      if (img) {
        const texture = new THREE.TextureLoader().load(img.src);
        const aspectRatio = img.naturalWidth / img.naturalHeight;

        const geometry = new THREE.PlaneGeometry(aspectRatio * 2, 2);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        mesh = new THREE.Mesh(geometry, material);
      } else {
        // Create colored plane for non-image elements
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.MeshBasicMaterial({
          color: this.getRandomColor(),
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });

        mesh = new THREE.Mesh(geometry, material);
      }

      // Position based on depth
      mesh.position.z = -depth * 2;

      this.scene.add(mesh);

      this.layers.push({
        mesh,
        element,
        depth,
        scrollSpeed,
        mouseSpeed,
        initialPosition: mesh.position.clone()
      });
    });
  }

  getRandomColor() {
    const colors = [0x6B5B95, 0x88B04B, 0xF7CAC9, 0x92A8D1, 0xFFCDA3];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addEventListeners() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.container.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.handleScroll);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
  }

  handleScroll() {
    this.targetScroll = window.pageYOffset || document.documentElement.scrollTop;
  }

  handleMouseMove(event) {
    const rect = this.container.getBoundingClientRect();

    // Normalize to -1 to 1
    this.targetMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.targetMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  handleResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  animate() {
    if (!this.isActive) return;

    // Smooth interpolation
    this.scroll = this.lerp(this.scroll, this.targetScroll, this.options.smoothing);
    this.mouse.x = this.lerp(this.mouse.x, this.targetMouse.x, this.options.smoothing);
    this.mouse.y = this.lerp(this.mouse.y, this.targetMouse.y, this.options.smoothing);

    // Update camera based on mouse
    this.camera.position.x = this.mouse.x * this.options.mouseMultiplier;
    this.camera.position.y = this.mouse.y * this.options.mouseMultiplier;
    this.camera.lookAt(0, 0, 0);

    // Update layers
    this.layers.forEach(layer => {
      const scrollOffset = this.scroll * layer.scrollSpeed * this.options.scrollMultiplier * 0.01;

      layer.mesh.position.y = layer.initialPosition.y - scrollOffset;

      // Add subtle rotation based on depth for extra effect
      layer.mesh.rotation.y = this.mouse.x * 0.05 * layer.depth;
      layer.mesh.rotation.x = this.mouse.y * 0.05 * layer.depth;
    });

    // Render scene
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.targetScroll = window.pageYOffset || document.documentElement.scrollTop;
    this.scroll = this.targetScroll;
    this.animate();
  }

  stop() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    this.removeEventListeners();

    // Clean up Three.js
    this.layers.forEach(layer => {
      this.scene.remove(layer.mesh);
      layer.mesh.geometry.dispose();
      layer.mesh.material.dispose();

      // Show original element
      layer.element.style.visibility = '';
    });

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    this.layers = [];
  }

  // Update options
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    if (newOptions.fov) {
      this.camera.fov = newOptions.fov;
      this.camera.updateProjectionMatrix();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuperParallax3D;
}

if (typeof window !== 'undefined') {
  window.SuperParallax3D = SuperParallax3D;
}
