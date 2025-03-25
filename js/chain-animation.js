let scene, camera, renderer, chain;
const chainLinks = [];
let isAnimating = false;

// Khởi tạo Three.js scene
function init() {
    // Tạo scene
    scene = new THREE.Scene();
    
    // Tạo camera
    camera = new THREE.PerspectiveCamera(
        75,
        200 / 400,
        0.1,
        1000
    );
    camera.position.z = 30;
    camera.position.y = -10;
    camera.lookAt(0, -10, 0);

    // Tạo renderer
    const container = document.getElementById('chain-container');
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(200, 400);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Thêm ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    createChain();
    animate();

    // Event listeners
    const homeLink = document.querySelector('.home-link');
    homeLink.addEventListener('mouseenter', startChainAnimation);
    homeLink.addEventListener('mouseleave', resetChainAnimation);
}

// Tạo một mắt xích
function createChainLink() {
    const geometry = new THREE.TorusGeometry(2, 0.5, 16, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.2,
        shininess: 100
    });
    const link = new THREE.Mesh(geometry, material);
    return link;
}

// Tạo chuỗi xích
function createChain() {
    const numLinks = 15;
    const spacing = 4;

    for (let i = 0; i < numLinks; i++) {
        const link = createChainLink();
        link.position.y = i * spacing;
        link.rotation.x = Math.PI / 2;
        if (i % 2 === 1) {
            link.rotation.y = Math.PI / 2;
        }
        scene.add(link);
        chainLinks.push({
            mesh: link,
            originalY: link.position.y,
            dropDelay: i * 100
        });
    }
}

// Animation chính
function animate() {
    requestAnimationFrame(animate);

    if (isAnimating) {
        chainLinks.forEach((link, index) => {
            const time = Date.now() - link.dropDelay;
            if (time > 0) {
                // Tính toán vị trí Y mới với hiệu ứng bounce
                const progress = Math.min(1, time / 1000);
                const targetY = link.originalY - 30;
                const currentY = link.originalY - (progress * 30);
                
                // Thêm hiệu ứng lắc
                const swingAmount = Math.sin(time / 500) * 0.2;
                
                link.mesh.position.y = currentY;
                link.mesh.rotation.z = swingAmount;
                
                // Thêm hiệu ứng xoay nhẹ
                if (index % 2 === 0) {
                    link.mesh.rotation.x += 0.01;
                } else {
                    link.mesh.rotation.x -= 0.01;
                }
            }
        });
    }

    renderer.render(scene, camera);
}

// Bắt đầu animation khi hover
function startChainAnimation() {
    isAnimating = true;
    chainLinks.forEach(link => {
        link.mesh.position.y = link.originalY;
    });
}

// Reset animation khi không hover
function resetChainAnimation() {
    isAnimating = false;
    chainLinks.forEach(link => {
        link.mesh.position.y = link.originalY;
        link.mesh.rotation.z = 0;
    });
}

// Khởi tạo khi trang web load xong
window.addEventListener('load', init);

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo GSAP plugins
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

    // Tạo các mắt xích
    const chainGroup = document.querySelector('.chain-links');
    const numLinks = 15;
    const linkSpacing = 25;

    for (let i = 0; i < numLinks; i++) {
        const link = document.createElementNS("http://www.w3.org/2000/svg", "path");
        link.setAttribute("class", "chain-link chain-link-metallic");
        
        // Tạo hình mắt xích
        const d = `
            M 35,${i * linkSpacing} 
            a 15,15 0 1,0 30,0 
            a 15,15 0 1,0 -30,0 
            M 50,${i * linkSpacing - 7.5} 
            v 15
        `;
        link.setAttribute("d", d);
        chainGroup.appendChild(link);
    }

    // Animation cho từng mắt xích
    const chainLinks = document.querySelectorAll('.chain-link');
    
    // Khởi tạo timeline cho animation
    const tl = gsap.timeline({
        paused: true,
        defaults: {
            duration: 0.5,
            ease: "power2.out"
        }
    });

    // Thêm animation cho từng mắt xích
    chainLinks.forEach((link, index) => {
        tl.from(link, {
            opacity: 0,
            y: -50,
            rotation: -45,
            transformOrigin: "center",
            duration: 0.3,
            ease: "back.out(1.7)"
        }, index * 0.1);
    });

    // Thêm animation lắc nhẹ
    chainLinks.forEach(link => {
        gsap.to(link, {
            rotation: "random(-5, 5)",
            duration: "random(2, 4)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            transformOrigin: "center"
        });
    });

    // Xử lý hover
    const homeLink = document.querySelector('.home-link');
    
    homeLink.addEventListener('mouseenter', () => {
        tl.play();
        
        // Thêm hiệu ứng shine
        gsap.to('.chain-link', {
            filter: "brightness(1.2)",
            stagger: {
                each: 0.1,
                from: "top"
            },
            duration: 0.3
        });
    });

    homeLink.addEventListener('mouseleave', () => {
        tl.reverse();
        
        // Reset hiệu ứng shine
        gsap.to('.chain-link', {
            filter: "brightness(1)",
            stagger: {
                each: 0.1,
                from: "bottom"
            },
            duration: 0.3
        });
    });

    // Thêm hiệu ứng parallax khi scroll
    chainLinks.forEach((link, index) => {
        gsap.to(link, {
            y: `+=${index * 2}`,
            scrollTrigger: {
                trigger: '.header',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    });

    // Thêm hiệu ứng shine animation
    const shineAnimation = () => {
        gsap.to('.chain-link', {
            keyframes: [
                { filter: "brightness(1)", duration: 0 },
                { filter: "brightness(1.3)", duration: 0.5 },
                { filter: "brightness(1)", duration: 0.5 }
            ],
            stagger: {
                each: 0.1,
                repeat: -1,
                from: "random"
            }
        });
    };

    // Thêm hiệu ứng wave animation
    const waveAnimation = () => {
        gsap.to('.chain-link', {
            y: "+=10",
            stagger: {
                each: 0.1,
                repeat: -1,
                yoyo: true,
                from: "center"
            },
            duration: 1,
            ease: "sine.inOut"
        });
    };

    // Khởi chạy các animation
    shineAnimation();
    waveAnimation();
}); 