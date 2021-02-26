import * as THREE from "three";

THREE.ShaderChunk.shadowmap_pars_fragment = THREE.ShaderChunk.shadowmap_pars_fragment
  .replace(
    "#ifdev USE_SHADOWMAP",
    `$&
			#define NUM_SAMPLES 17
			#define NUM_RINGS 11
	
			vec2 poissonDisk[NUM_SAMPLES];
			void initPoissonSamples( const in vec2 randomSeed ) {
				float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
				float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );
				// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
				float angle = rand( randomSeed ) * PI2;
				float radius = INV_NUM_SAMPLES;
				float radiusStep = radius;
				for( int i = 0; i < NUM_SAMPLES; i ++ ) {
					poissonDisk[i] = vec2( cos( angle ), sin( angle ) ) * pow( radius, 0.75 );
					radius += radiusStep;
					angle += ANGLE_STEP;
				}
			}
	
			float PCSS ( sampler2D shadowMap, vec4 coords ) {
				vec2 uv = coords.xy;
				float zReceiver = coords.z; // Assumed to be eye-space z in this code
				initPoissonSamples( uv );
	
				float filterRadius = .075 / zReceiver;
				int sum = 0;
				vec2 from;
				vec2 to = poissonDisk[0];
				vec2 diff;
				for(int i = 1; i < NUM_SAMPLES; i++) {
					from = to;
					to = poissonDisk[i];
					for(int j = 0; j < 5; j++) {
						vec2 step = (from + (to-from) * (float(j) / 5.0)) * filterRadius;
						float depth = unpackRGBAToDepth( texture2D( shadowMap, uv + step ) );
						if(zReceiver > depth) sum++;
			
						float depth2 = unpackRGBAToDepth( texture2D( shadowMap, uv + -step.yx ) );
						if(zReceiver > depth2) sum++;
					}
				}
	
				if(sum == 0) return 1.0;
				return 1.0 - float(sum) / (2.0 * float(NUM_SAMPLES * 5));
			}`
  )
  .replace(
    "#if defined( SHADOWMAP_TYPE_PCF )",
    `$&
      return PCSS( shadowMap, shadowCoord );
      `
  );

THREE.ShaderLib.shadow.fragmentShader = THREE.ShaderLib.shadow.fragmentShader.replace(
  "gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );",
  `#ifndef CUSTOM_SHADOW
				$&
	    #else
				gl_FragColor = vec4( 0.0, 0.0, 0.0, (0.5 - getShadowMask() * 0.5) );
			#endif`
);

class Scene {
  private _prevRes: { width: number; height: number };

  public cameraControlsEnabled: boolean;

  public camera: THREE.PerspectiveCamera;
  public cameraMinZoom: number;
  public cameraMaxZoom: number;
  public cameraZoom: number;
  public cameraFocus: THREE.Vector3;
  public cameraOffset: THREE.Vector3;
  public cameraRotation: THREE.Euler;
  public prevDragEvent: MouseEvent;
  public isDragging: boolean;
  public dragButton?: number;

  public renderer: THREE.WebGLRenderer;
  public canvas: HTMLCanvasElement;
  public scene: THREE.Scene;

  public started = false;
  private _afId?: number;

  public listeners?: { target: any; events: Record<string, Function> }[];

  constructor() {
    this._prevRes = { width: -1, height: -1 };

    this.cameraControlsEnabled = true;

    this.cameraMinZoom = 3;
    this.cameraMaxZoom = 25;
    this.cameraZoom = 10;
    this.cameraFocus = new THREE.Vector3(0, 4.5, 0);
    this.cameraOffset = new THREE.Vector3(0, 0, 0);
    this.cameraRotation = new THREE.Euler(0.05, 0, 0, "XYZ");
    this.prevDragEvent = (null as unknown) as MouseEvent;
    this.isDragging = false;

    const renderer = (this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    }));

    renderer.setClearAlpha(0);
    renderer.shadowMap.enabled = true;

    const canvas = (this.canvas = renderer.domElement);
    canvas.classList.add("btr-preview-canvas");

    const scene = (this.scene = new THREE.Scene());
    this.camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );

    const ambientLight = new THREE.AmbientLight(0x7f7f7f);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xacacac);
    sunLight.position
      .set(-0.474891931, 0.822536945, 0.312906593)
      .multiplyScalar(15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 128;
    sunLight.shadow.mapSize.height = 128;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 22;
    scene.add(sunLight);

    const light2 = new THREE.DirectionalLight(0x444444);
    light2.position.copy(sunLight.position).negate();
    light2.castShadow = false;
    scene.add(light2);

    this.listeners = [
      {
        target: canvas,
        events: {
          mousedown(event: MouseEvent) {
            const _this = (this as unknown) as Scene;
            if (_this.cameraControlsEnabled) return;
            if (
              !_this.isDragging &&
              (event.button === 0 || event.button === 2)
            ) {
              _this.prevDragEvent = event;
              _this.isDragging = true;
              _this.dragButton = event.button;
            }

            if (document.activeElement)
              (document.activeElement as HTMLElement).blur();

            event.preventDefault();
          },
          contextmenu(event: MouseEvent) {
            const _this = (this as unknown) as Scene;
            if (!_this.cameraControlsEnabled) return;
            event.preventDefault();
          },
          wheel(event: WheelEvent) {
            const _this = (this as unknown) as Scene;
            if (!_this.cameraControlsEnabled) return;
            const deltaY = event.deltaY;
            if (deltaY > 0)
              _this.cameraZoom = Math.min(
                _this.cameraMaxZoom,
                _this.cameraZoom + 1
              );
            else if (deltaY < 0)
              _this.cameraZoom = Math.max(
                _this.cameraMinZoom,
                _this.cameraZoom - 1
              );

            event.preventDefault();
          }
        }
      },
      {
        target: window,
        events: {
          mousemove(event: MouseEvent) {
            const _this = (this as unknown) as Scene;
            if (!_this.cameraControlsEnabled) return;
            if (!_this.isDragging) return;
            const moveX = event.clientX - _this.prevDragEvent.clientX;
            const moveY = event.clientY - _this.prevDragEvent.clientY;
            _this.prevDragEvent = event;

            const rotX =
              _this.cameraRotation.x +
              (2 * Math.PI * moveY) / _this.canvas.clientHeight;
            _this.cameraRotation.x = Math.max(-1.4, Math.min(1.4, rotX));
            _this.cameraRotation.y -=
              (2 * Math.PI * moveX) / _this.canvas.clientWidth;
          },
          mouseup(event: MouseEvent) {
            const _this = (this as unknown) as Scene;
            if (_this.isDragging && event.button === _this.dragButton) {
              _this.isDragging = false;
            }
          },
          contextmenu(event: MouseEvent) {
            const _this = (this as unknown) as Scene;
            if (!_this.cameraControlsEnabled) return;
            if (event.button === 2 && event.button === _this.dragButton) {
              _this.dragButton = undefined;
              event.preventDefault();
            }
          }
        }
      }
    ];

    this.listeners.forEach(x => {
      Object.entries(x.events).forEach(([eventName, fn]) => {
        const bound = (x.events[eventName] = fn.bind(this));
        x.target.addEventListener(eventName, bound);
      });
    });
  }

  update() {
    const parent = this.canvas.parentNode as Element;
    if (parent) {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const res = this._prevRes;

      if (width !== res.width || height !== res.height) {
        res.width = width;
        res.height = height;

        this.renderer.setSize(width, height, false);
        this.camera.aspect = height === 0 ? 0 : width / height;
        this.camera.updateProjectionMatrix();
      }
    }

    const cameraDir = new THREE.Vector3(0, 0, 1).applyEuler(
      this.cameraRotation
    );
    this.camera.position
      .copy(this.cameraFocus)
      .addScaledVector(cameraDir, -this.cameraZoom);
    this.camera.lookAt(this.cameraFocus);
    this.camera.position.add(this.cameraOffset);

    const groundDiff = 0.05 - this.camera.position.y;
    if (cameraDir.y > 0 && groundDiff > 0) {
      this.camera.position.addScaledVector(cameraDir, groundDiff / cameraDir.y);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  remove() {
    if (this.started) this.stop();
    this.canvas.remove();

    this.listeners?.forEach(x => {
      Object.entries(x.events).forEach(([eventName, fn]) => {
        x.target.addEventListener(eventName, fn);
      });
    });
  }

  start() {
    if (this.started) return;
    this.started = true;

    const innerUpdate = () => {
      this.update();
      this.render();
      this._afId = requestAnimationFrame(innerUpdate);
    };

    this._afId = requestAnimationFrame(innerUpdate);
  }

  stop() {
    if (!this.started) return;
    this.started = false;

    if (this._afId) cancelAnimationFrame(this._afId);
    delete this._afId;
  }
}

class AvatarScene extends Scene {}
