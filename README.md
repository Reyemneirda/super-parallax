# 🎨 SuperParallax

A lightweight JavaScript library for creating complex multi-layer parallax effects that respond to both scroll and mouse movement. Inspired by classic 2D video games, SuperParallax creates stunning depth effects in your web projects.

**Two versions available:**

- **SuperParallax** (2D): Zero dependencies, pure vanilla JavaScript
- **SuperParallax3D**: True 3D effects with Three.js and WebGL

## ✨ Features

### SuperParallax (2D)

- 🎯 **Multi-layer parallax**: Support for unlimited parallax layers
- 🖱️ **Mouse tracking**: Follows mouse movement for interactive depth
- 📜 **Scroll effects**: Smooth parallax on scroll
- 🎮 **Game-like depth**: Configurable layer speeds like 2D video games
- ⚡ **Performant**: Uses `requestAnimationFrame` and `translate3d` for smooth 60fps animations
- 🪶 **Lightweight**: Zero dependencies, pure vanilla JavaScript (~6KB)
- 🎛️ **Customizable**: Extensive options for fine-tuning effects
- 📱 **Responsive**: Automatically adapts to window resizing

### SuperParallax3D (3D)

- 🌐 **WebGL rendering**: True 3D positioning with Three.js
- 📷 **Camera movement**: Camera rotates based on mouse position
- 🔄 **Layer rotation**: Adds depth through subtle 3D rotation
- 🎨 **GPU accelerated**: Hardware-accelerated rendering
- 💫 **Enhanced depth**: More immersive than 2D transforms
- ⚙️ **Requires Three.js**: Include from CDN to keep it simple

## 📦 Installation

### From GitHub (npm)

```bash
npm install github:Reyemneirda/super-parallax
```

### Direct Download

Download `super-parallax.js` and include it in your HTML:

```html
<script src="path/to/super-parallax.js"></script>
```

## 🚀 Quick Start

### 1. Set up your HTML

```html
<div class="parallax-container">
  <!-- Background layer (moves slowly) -->
  <div data-parallax-layer data-parallax-depth="0.3">
    <img src="background.png" alt="Background" />
  </div>

  <!-- Middle layer -->
  <div data-parallax-layer data-parallax-depth="0.6">
    <img src="midground.png" alt="Midground" />
  </div>

  <!-- Foreground layer (moves quickly) -->
  <div data-parallax-layer data-parallax-depth="1.2">
    <img src="foreground.png" alt="Foreground" />
  </div>

  <!-- Static content (no parallax) -->
  <div class="content">
    <h1>Your Content Here</h1>
  </div>
</div>
```

### 2. Initialize SuperParallax

```javascript
const parallax = new SuperParallax(".parallax-container", {
  scrollMultiplier: 1,
  mouseMultiplier: 0.5,
  smoothing: 0.1,
});
```

### 3. Style your container (important!)

```css
.parallax-container {
  position: relative;
  overflow: hidden;
  height: 100vh; /* or any height you want */
}

[data-parallax-layer] {
  position: absolute;
  width: 100%;
  height: 100%;
}
```

That's it! 🎉

## 📖 API Reference

### Constructor

```javascript
new SuperParallax(container, options);
```

**Parameters:**

- `container` (string | HTMLElement): CSS selector or DOM element
- `options` (object): Configuration options (see below)

### Options

| Option              | Type    | Default | Description                                 |
| ------------------- | ------- | ------- | ------------------------------------------- |
| `scrollMultiplier`  | number  | `1`     | Overall scroll effect intensity             |
| `mouseMultiplier`   | number  | `0.5`   | Overall mouse effect intensity              |
| `smoothing`         | number  | `0.1`   | Smoothing factor (0-1, lower = smoother)    |
| `centerMouse`       | boolean | `true`  | Center mouse coordinates (-1 to 1)          |
| `resetOnMouseLeave` | boolean | `true`  | Reset mouse position when leaving container |

### HTML Attributes

| Attribute              | Type   | Default  | Description                              |
| ---------------------- | ------ | -------- | ---------------------------------------- |
| `data-parallax-layer`  | -      | required | Marks element as a parallax layer        |
| `data-parallax-depth`  | number | `1`      | Layer depth (lower = slower)             |
| `data-parallax-scroll` | number | `depth`  | Custom scroll speed                      |
| `data-parallax-mouse`  | number | `depth`  | Custom mouse speed                       |
| `data-parallax-axis`   | string | `'both'` | Movement axis: `'x'`, `'y'`, or `'both'` |

### Methods

#### `start()`

Start the parallax animation.

```javascript
parallax.start();
```

#### `stop()`

Stop the parallax animation.

```javascript
parallax.stop();
```

#### `destroy()`

Stop animation, remove event listeners, and reset transforms.

```javascript
parallax.destroy();
```

#### `addLayer(element, depth, scrollSpeed, mouseSpeed)`

Dynamically add a new parallax layer.

```javascript
const layer = parallax.addLayer(element, 0.5, 0.5, 0.7);
```

#### `removeLayer(element)`

Remove a parallax layer.

```javascript
parallax.removeLayer(element);
```

#### `setOptions(options)`

Update options on the fly.

```javascript
parallax.setOptions({
  smoothing: 0.2,
  mouseMultiplier: 0.8,
});
```

#### `updateBounds()`

Manually update container boundaries (called automatically on resize).

```javascript
parallax.updateBounds();
```

## 💡 Examples

### Different Speeds for Scroll and Mouse

```html
<div data-parallax-layer data-parallax-scroll="0.3" data-parallax-mouse="0.8">
  Moves slowly on scroll, quickly with mouse
</div>
```

### Horizontal-Only Movement

```html
<div data-parallax-layer data-parallax-depth="0.5" data-parallax-axis="x">
  Only moves horizontally
</div>
```

### Advanced Configuration

```javascript
const parallax = new SuperParallax(".hero", {
  scrollMultiplier: 1.5, // More intense scroll
  mouseMultiplier: 0.3, // Subtle mouse movement
  smoothing: 0.05, // Very smooth
  centerMouse: true, // Centered coordinates
  resetOnMouseLeave: false, // Keep position on mouse leave
});
```

### Dynamic Layer Management

```javascript
// Add a new layer programmatically
const newElement = document.createElement("div");
newElement.innerHTML = '<img src="star.png">';
document.querySelector(".parallax-container").appendChild(newElement);

parallax.addLayer(newElement, 1.5); // depth of 1.5

// Remove it later
parallax.removeLayer(newElement);
```

## 🎯 Best Practices

1. **Layer Depth**: Use values between 0.2 (far background) and 1.5 (close foreground)
2. **Performance**: Limit to 5-10 layers for best performance
3. **Container**: Always set `overflow: hidden` on the container
4. **Positioning**: Use `position: absolute` on parallax layers
5. **Images**: Preload images to prevent layout shifts
6. **Mobile**: Consider reducing or disabling on mobile for better performance

## 🎮 Creating Game-Like Effects

To achieve a classic 2D game parallax:

```html
<!-- Sky (slowest) -->
<div data-parallax-layer data-parallax-depth="0.1">...</div>

<!-- Far mountains -->
<div data-parallax-layer data-parallax-depth="0.3">...</div>

<!-- Near mountains -->
<div data-parallax-layer data-parallax-depth="0.5">...</div>

<!-- Trees -->
<div data-parallax-layer data-parallax-depth="0.8">...</div>

<!-- Ground (fastest) -->
<div data-parallax-layer data-parallax-depth="1.2">...</div>
```

## 🔧 Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- IE11: ⚠️ (requires polyfills)

## 📝 License

MIT License - feel free to use in personal and commercial projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Demos

- **demo.html**: 2D parallax with CSS transforms
- **demo-3d.html**: 3D parallax with Three.js and WebGL

## 🌐 SuperParallax3D (3D Version)

For true 3D depth with WebGL, use SuperParallax3D:

### Installation

Include Three.js from CDN (to keep it simple with minimal dependencies):

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="path/to/super-parallax-3d.js"></script>
```

### Usage

```javascript
const parallax3d = new SuperParallax3D(".parallax-container", {
  scrollMultiplier: 0.5,
  mouseMultiplier: 2,
  smoothing: 0.08,
  fov: 75,
  cameraZ: 5,
});
```

### 3D Options

| Option             | Type   | Default | Description                |
| ------------------ | ------ | ------- | -------------------------- |
| `scrollMultiplier` | number | `0.5`   | Scroll effect intensity    |
| `mouseMultiplier`  | number | `2`     | Camera movement intensity  |
| `smoothing`        | number | `0.08`  | Animation smoothness (0-1) |
| `fov`              | number | `75`    | Camera field of view       |
| `cameraZ`          | number | `5`     | Camera distance from scene |

### When to Use 3D vs 2D

**Use 2D (SuperParallax)** when:

- You want zero dependencies
- File size matters
- You need maximum browser compatibility
- Simple depth effects are sufficient
- **Recommended for 95% of use cases**

**Use 3D (SuperParallax3D)** when:

- You want true 3D camera movement
- WebGL effects enhance your design
- You're already using Three.js
- You need layer rotation effects
- Modern browser support is guaranteed

## ⚡ Performance Tips

- Use `transform: translateZ(0)` or `will-change: transform` on layers for GPU acceleration
- Keep layer count reasonable (5-10 layers)
- Optimize images (use WebP, compress, lazy load)
- Consider using `IntersectionObserver` to only run parallax when visible
- Use the `stop()` method when parallax is not needed

## 🌟 Inspiration

Inspired by classic games like:

- Sonic the Hedgehog
- Super Mario Bros
- Rayman
- Street Fighter

---

Made with ❤️ for creating depth on the web
