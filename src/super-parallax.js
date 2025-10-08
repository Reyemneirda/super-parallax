/**
 * SuperParallax - A complex multi-layer parallax effect component
 * Follows both scroll and mouse movement to create depth
 */
class SuperParallax {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error('Container element not found');
    }

    // Default options
    this.options = {
      scrollMultiplier: 1,        // Overall scroll effect intensity
      mouseMultiplier: 0.5,       // Overall mouse effect intensity
      smoothing: 0.1,             // Smoothing factor (0-1, lower = smoother)
      centerMouse: true,          // Center mouse coordinates
      resetOnMouseLeave: true,    // Reset mouse position when leaving container
      ...options
    };

    // State
    this.layers = [];
    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.scroll = 0;
    this.targetScroll = 0;
    this.bounds = null;
    this.animationFrameId = null;
    this.isActive = false;

    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.animate = this.animate.bind(this);
    this.updateBounds = this.updateBounds.bind(this);

    this.init();
  }

  init() {
    // Find all layers
    this.layers = Array.from(
      this.container.querySelectorAll('[data-parallax-layer]')
    ).map(element => {
      const depth = parseFloat(element.getAttribute('data-parallax-depth')) || 1;
      const scrollSpeed = parseFloat(element.getAttribute('data-parallax-scroll')) || depth;
      const mouseSpeed = parseFloat(element.getAttribute('data-parallax-mouse')) || depth;
      const axis = element.getAttribute('data-parallax-axis') || 'both'; // 'x', 'y', or 'both'

      return {
        element,
        depth,
        scrollSpeed,
        mouseSpeed,
        axis,
        initialTransform: this.getInitialTransform(element)
      };
    });

    if (this.layers.length === 0) {
      console.warn('No parallax layers found. Add data-parallax-layer attribute to elements.');
    }

    // Set up container
    this.container.style.position = this.container.style.position || 'relative';
    this.container.style.overflow = this.container.style.overflow || 'hidden';

    this.updateBounds();
    this.addEventListeners();
    this.start();
  }

  getInitialTransform(element) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;

    if (transform && transform !== 'none') {
      return transform;
    }

    return '';
  }

  addEventListeners() {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.container.addEventListener('mousemove', this.handleMouseMove, { passive: true });

    if (this.options.resetOnMouseLeave) {
      this.container.addEventListener('mouseleave', this.handleMouseLeave);
    }

    window.addEventListener('resize', this.updateBounds);
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.handleScroll);
    this.container.removeEventListener('mousemove', this.handleMouseMove);
    this.container.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.updateBounds);
  }

  updateBounds() {
    this.bounds = this.container.getBoundingClientRect();
  }

  handleScroll() {
    this.targetScroll = window.pageYOffset || document.documentElement.scrollTop;
  }

  handleMouseMove(event) {
    if (!this.bounds) this.updateBounds();

    if (this.options.centerMouse) {
      // Center coordinates (-1 to 1)
      this.targetMouse.x = ((event.clientX - this.bounds.left) / this.bounds.width - 0.5) * 2;
      this.targetMouse.y = ((event.clientY - this.bounds.top) / this.bounds.height - 0.5) * 2;
    } else {
      // Absolute coordinates
      this.targetMouse.x = event.clientX - this.bounds.left;
      this.targetMouse.y = event.clientY - this.bounds.top;
    }
  }

  handleMouseLeave() {
    this.targetMouse.x = 0;
    this.targetMouse.y = 0;
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

    // Update each layer
    this.layers.forEach(layer => {
      const scrollOffset = this.scroll * layer.scrollSpeed * this.options.scrollMultiplier * 0.5;
      const mouseOffsetX = this.mouse.x * layer.mouseSpeed * this.options.mouseMultiplier * 50;
      const mouseOffsetY = this.mouse.y * layer.mouseSpeed * this.options.mouseMultiplier * 50;

      let translateX = 0;
      let translateY = 0;

      if (layer.axis === 'both' || layer.axis === 'x') {
        translateX = mouseOffsetX;
      }

      if (layer.axis === 'both' || layer.axis === 'y') {
        translateY = -scrollOffset + mouseOffsetY;
      } else if (layer.axis === 'x') {
        translateY = -scrollOffset;
      }

      const transform = `translate3d(${translateX}px, ${translateY}px, 0)`;

      if (layer.initialTransform) {
        layer.element.style.transform = `${layer.initialTransform} ${transform}`;
      } else {
        layer.element.style.transform = transform;
      }
    });

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

    // Reset layer transforms
    this.layers.forEach(layer => {
      if (layer.initialTransform) {
        layer.element.style.transform = layer.initialTransform;
      } else {
        layer.element.style.transform = '';
      }
    });

    this.layers = [];
  }

  // Public API for dynamic layer management
  addLayer(element, depth = 1, scrollSpeed = depth, mouseSpeed = depth) {
    const layer = {
      element,
      depth,
      scrollSpeed,
      mouseSpeed,
      axis: 'both',
      initialTransform: this.getInitialTransform(element)
    };

    this.layers.push(layer);
    return layer;
  }

  removeLayer(element) {
    const index = this.layers.findIndex(layer => layer.element === element);
    if (index !== -1) {
      this.layers.splice(index, 1);
    }
  }

  // Update options on the fly
  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SuperParallax;
}

if (typeof window !== 'undefined') {
  window.SuperParallax = SuperParallax;
}
