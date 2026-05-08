let activeBinds = {};

window.addEventListener('message', async (e) => {
  if (e.data.action === 'updateBinds') {
    activeBinds = e.data.bindings || {};
    return;
  }

  if (e.data.action === 'load') {
    activeBinds = e.data.bindings || {}; 
    const blobUrl = URL.createObjectURL(new Blob([e.data.buffer]));
    const ext = e.data.name.split('.').pop().toLowerCase();
    
    const sysMap = { 
      nes: 'fceumm', sfc: 'snes9x', md: 'genesis_plus_gx', gen: 'genesis_plus_gx', 
      gba: 'mgba', gb: 'gambatte', gbc: 'gambatte', sms: 'genesis_plus_gx', gg: 'genesis_plus_gx',
      pbp: 'pcsx_rearmed', chd: 'pcsx_rearmed', iso: 'pcsx_rearmed', cue: 'pcsx_rearmed', bin: 'pcsx_rearmed'
    };

    // Official EmulatorJS Version 4 Configuration
    window.EJS_player = '#game-container';
    window.EJS_gameUrl = blobUrl;
    window.EJS_core = sysMap[ext] || 'nes';
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_volume = e.data.volume;
    window.EJS_gameID = e.data.name; // FIX: This clears the missing ID warning!
    
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    document.body.appendChild(script);
  }

  if (e.data.action === 'volume' && window.EJS_emulator) {
    try { window.EJS_emulator.setVolume(e.data.volume); } catch(err){}
  }
});

// --- THE INPUT FIREWALL ---
const keyCodeMap = {
  'ArrowUp': 38, 'ArrowDown': 40, 'ArrowLeft': 37, 'ArrowRight': 39,
  'Enter': 13, 'ShiftRight': 16, 'ShiftLeft': 16, 'Space': 32,
  'ControlLeft': 17, 'ControlRight': 17, 'AltLeft': 18, 'AltRight': 18,
  'Tab': 9, 'Backspace': 8, 'F1': 112, 'F2': 113, 'F4': 115
};
for (let i = 65; i <= 90; i++) {
  keyCodeMap['Key' + String.fromCharCode(i)] = i;
}

function handleKey(e) {
  if (e.__remapped) return; 
  if (e.code === 'Escape' || (e.code.startsWith('F') && e.code !== 'F1' && e.code !== 'F2' && e.code !== 'F4')) return;
  
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.preventDefault();

  if (activeBinds[e.code]) {
    const targetCode = activeBinds[e.code];
    const numericCode = keyCodeMap[targetCode] || 0;

    // FIX: Translate standard 'KeyX' codes into actual lowercase letters for the engine
    let realKey = targetCode;
    if (targetCode.startsWith('Key')) realKey = targetCode.replace('Key', '').toLowerCase();
    else if (targetCode.startsWith('Shift')) realKey = 'Shift';
    else if (targetCode.startsWith('Control')) realKey = 'Control';
    else if (targetCode.startsWith('Alt')) realKey = 'Alt';
    else if (targetCode === 'Space') realKey = ' ';

    const newEvent = new KeyboardEvent(e.type, {
      code: targetCode,
      key: realKey,
      bubbles: true,
      cancelable: true,
      composed: true
    });

    Object.defineProperty(newEvent, 'keyCode', { get: () => numericCode });
    Object.defineProperty(newEvent, 'which', { get: () => numericCode });

    newEvent.__remapped = true;
    window.dispatchEvent(newEvent); // Dispatch to window so V4 catches it securely
  }
}

window.addEventListener('keydown', handleKey, true); 
window.addEventListener('keyup', handleKey, true);
