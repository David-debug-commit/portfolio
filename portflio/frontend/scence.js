// 3D background: a wireframe shape and particle field that react to scroll and mouse.
(function () {
    const canvas = document.getElementById('bg3d');
    if (!window.THREE || matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.remove(); return; }

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 7;

    const group = new THREE.Group();
    scene.add(group);

    const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.9, 1),
        new THREE.MeshBasicMaterial({ color: 0x1B1E4A, wireframe: true, transparent: true, opacity: 0.5 })
    );
    const knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.8, 0.22, 120, 16),
        new THREE.MeshBasicMaterial({ color: 0xD21319, wireframe: true, transparent: true, opacity: 0.45 })
    );
    group.add(shell, knot);

    const count = 700, pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = 4 + Math.random() * 8, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
        pos.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b)], i * 3);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xAFAEA2, size: 0.045, transparent: true, opacity: 0.9 }));
    scene.add(particles);

    let mx = 0, my = 0, sy = 0, cy = 0, cmx = 0, cmy = 0;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
    addEventListener('scroll', () => { sy = scrollY; }, { passive: true });

    function resize() {
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        group.userData.wide = innerWidth > 860;
    }
    addEventListener('resize', resize);
    resize();

    const clock = new THREE.Clock();
    (function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        cy += (sy - cy) * 0.06; cmx += (mx - cmx) * 0.05; cmy += (my - cmy) * 0.05;

        const wide = group.userData.wide;
        // Scroll drives rotation and drifts the shape from right to left and back
        group.rotation.y = t * 0.15 + cy * 0.0025 + cmx * 0.8;
        group.rotation.x = cy * 0.0012 + cmy * 0.6;
        group.position.x = (wide ? 2.6 : 0) * Math.cos(cy * 0.0016);
        group.position.y = Math.sin(t * 0.8) * 0.15 + (wide ? 0 : 1.6) - cy * 0.0004;
        group.scale.setScalar((wide ? 1 : 0.7) * (1 + Math.sin(cy * 0.002) * 0.12));
        knot.rotation.x = -t * 0.35; knot.rotation.y = t * 0.25;
        particles.rotation.y = t * 0.02 + cy * 0.0004;

        renderer.render(scene, camera);
    })();
})();