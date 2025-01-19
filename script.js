let m = 100;
let s = 0;
let w = 1;
let t = [];
let st = null;
let running = false;
let z = [];
let b = [];
let ppos = 400;
let seltow = null;
let merge = false;
let keys = {};
let lastshot = 0;
let cooldown = 250;
let gwidth = window.innerWidth;
let boundary = gwidth - 100;

let towers = {
    1: { n: "Basic I", d: 10, c: 50 },
    2: { n: "Basic II", d: 25, c: 100 },
    3: { n: "Basic III", d: 50, c: 200 },
    4: { n: "Basic IV", d: 100, c: 400 },
    5: { n: "Basic V", d: 200, c: 800 }
};

function makeSlots() {
    let area = document.getElementById('towerArea');
    for(let i = 0; i < 8; i++) {
        let box = document.createElement('div');
        box.className = 'tower-slot';
        box.addEventListener('click', () => clickTower(i));
        area.appendChild(box);
    }
}

function clickTower(pos) {
    let tower = t.find(x => x.position === pos);
    
    if(seltow && tower) {
        if(tower.level === seltow.level && tower.position !== seltow.position && tower.level < 5) {
            t = t.filter(x => x.position !== seltow.position && x.position !== pos);
            let newlvl = tower.level + 1;
            t.push({
                position: pos,
                level: newlvl,
                name: towers[newlvl].n,
                damage: towers[newlvl].d
            });
            seltow = null;
        }
    } else if(st && m >= towers[1].c) {
        if(!tower) {
            m -= towers[1].c;
            t.push({
                position: pos,
                level: 1,
                name: towers[1].n,
                damage: towers[1].d
            });
            st = null;
        }
    } else if(tower) {
        seltow = tower;
    }
    
    showTowers();
    updateStuff();
}

function updateStuff() {
    document.getElementById('money').textContent = `Money: $${m}`;
    document.getElementById('score').textContent = `Score: ${s}`;
    document.getElementById('wave').textContent = `Wave: ${w}`;
}

document.getElementById('buyTower').addEventListener('click', () => {
    if(m >= towers[1].c) {
        let empty = Array(8).fill().findIndex((_, i) => !t.find(x => x.position === i));
        if(empty !== -1) {
            m -= towers[1].c;
            t.push({
                position: empty,
                level: 1,
                name: towers[1].n,
                damage: towers[1].d
            });
            showTowers();
            updateStuff();
        }
    }
});

document.addEventListener('keydown', (e) => {
    if(e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        keys[e.key.toLowerCase()] = true;
    }
    if(e.key === ' ') {
        e.preventDefault();
        let now = Date.now();
        if(running && now - lastshot >= cooldown) {
            shoot();
            lastshot = now;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if(e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd') {
        keys[e.key.toLowerCase()] = false;
    }
});

function updatePlayerPosition() {
    const player = document.getElementById('player');
    player.style.cssText = `
        position: absolute;
        bottom: 150px;
        left: ${ppos}px;
        width: 30px;
        height: 30px;
        background: #9c6644;
        border-radius: 6px;
        transform: translateX(-50%);
        z-index: 100;
    `;
}

// Make sure player is initialized
updatePlayerPosition();

function shoot() {
    b.push({
        id: Date.now(),
        x: ppos,
        y: window.innerHeight - 150,
    });
}

function updateBullets() {
    b.forEach((bullet, index) => {
        bullet.y -= 5;
        if(bullet.y < 0) b.splice(index, 1);
    });
    renderBullets();
}

function renderBullets() {
    const bulletsContainer = document.getElementById('bullets');
    bulletsContainer.innerHTML = b.map(bullet => `
        <div style="
            position: absolute;
            left: ${bullet.x}px;
            top: ${bullet.y}px;
            width: 5px;
            height: 10px;
            background: #b08968;
            border-radius: 4px;
            transform: translateX(-50%);
        "></div>
    `).join('');
}

function spawnZombie() {
    if(!running) return;
    z.push({
        id: Date.now(),
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: 0
    });
    setTimeout(spawnZombie, 2000 / Math.sqrt(w));
}

function updateZombies() {
    z.forEach((zombie, zombieIndex) => {
        zombie.y += 1;
        
        if(checkPlayerCollision(zombie)) {
            gameOver();
            return;
        }
        
        b.forEach((bullet, bulletIndex) => {
            if(checkCollision(bullet, zombie)) {
                z.splice(zombieIndex, 1);
                b.splice(bulletIndex, 1);
                m += 10;
                s += 100;
                updateStuff();
            }
        });
    });
    renderZombies();
}

function checkPlayerCollision(zombie) {
    const playerY = window.innerHeight - 120;
    const distance = Math.hypot(zombie.x - ppos, zombie.y - playerY);
    return distance < 30;
}

function checkCollision(bullet, zombie) {
    const distance = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y);
    return distance < 25;
}

function renderZombies() {
    const zombiesContainer = document.getElementById('zombies');
    zombiesContainer.innerHTML = z.map(zombie => `
        <div style="
            position: absolute;
            left: ${zombie.x}px;
            top: ${zombie.y}px;
            width: 25px;
            height: 25px;
            background: #7f5539;
            border-radius: 50%;
            transform: translateX(-50%);
        "></div>
    `).join('');
}

function gameOver() {
    running = false;
    if(confirm(`Game Over! Score: ${s}\nPlay again?`)) {
        resetGame();
    }
    document.getElementById('homeScreen').style.display = 'flex';
}

function resetGame() {
    m = 100;
    s = 0;
    w = 1;
    t = [];
    st = null;
    running = false;
    z = [];
    b = [];
    ppos = 400;
    seltow = null;
    merge = false;
    updateStuff();
    showTowers();
}

function gameLoop() {
    if(!running) return;
    
    if(keys['a']) {
        ppos = Math.max(50, ppos - 12);
    }
    if(keys['d']) {
        ppos = Math.min(boundary, ppos + 12);
    }
    
    updatePlayerPosition();
    updateBullets();
    updateZombies();
    
    requestAnimationFrame(gameLoop);
}

document.getElementById('gameControl').addEventListener('click', () => {
    running = !running;
    document.getElementById('gameControl').textContent = running ? 'Pause' : 'Start';
    if(running) {
        spawnZombie();
        requestAnimationFrame(gameLoop);
    }
});

function showTowers() {
    const slots = document.querySelectorAll('.tower-slot');
    slots.forEach((slot, i) => {
        const tower = t.find(x => x.position === i);
        const isSelected = seltow && seltow.position === i;
        const isMergeCandidate = seltow && tower && 
                                tower.level === seltow.level && 
                                tower.position !== seltow.position;
        
        slot.className = `tower-slot ${tower ? 'has-tower' : ''} ${isSelected ? 'selected' : ''} ${isMergeCandidate ? 'merge-candidate' : ''}`;
        
        if(tower) {
            slot.innerHTML = `
                <div class="tower">
                    <div class="tower-level">${tower.level}</div>
                </div>
            `;
        } else {
            slot.innerHTML = '';
        }
    });
}

function startGame() {
    document.getElementById('homeScreen').style.display = 'none';
}

makeSlots();
updateStuff();
updatePlayerPosition();