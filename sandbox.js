window.EJS_pathtodata = 'https://dataman252.github.io/doom-corner-engine/emulatorjs/data/';
let emulatorInstance = null;
let activeBinds = {};

window.addEventListener('message', async (e) => {
  if (e.data.action === 'updateBinds') {
    activeBinds = e.data.bindings || {};
    return;
  }

  if (e.data.action === 'load') {
    if (emulatorInstance) {
      try { emulatorInstance.destroy(); } catch(err){}
      document.getElementById('game-container').innerHTML = '';
    }

    activeBinds = e.data.bindings || {}; 
    // NEW: We receive the raw ArrayBuffer directly from the extension now
    const blobUrl = URL.createObjectURL(new Blob([e.data.buffer]));

    const ext = e.data.name.split('.').pop().toLowerCase();
    
    const sysMap = { 
      nes: 'fceumm', sfc: 'snes9x', md: 'genesis_plus_gx', gen: 'genesis_plus_gx', 
      gba: 'mgba', gb: 'gambatte', gbc: 'gambatte', sms: 'genesis_plus_gx', gg: 'genesis_plus_gx',
      pbp: 'pcsx_rearmed', chd: 'pcsx_rearmed', iso: 'pcsx_rearmed', cue: 'pcsx_rearmed', bin: 'pcsx_rearmed'
    };

    emulatorInstance = new EmulatorJS('#game-container', {
      gameName: e.data.name,
      gameUrl: blobUrl,
      system: sysMap[ext] || 'auto',
      dataPath: window.EJS_pathtodata,
      startOnLoad: true
    });

    emulatorInstance.on('ready', () => {
      if (emulatorInstance.setVolume) emulatorInstance.setVolume(e.data.volume);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    });
  }

  if (e.data.action === 'volume' && emulatorInstance?.setVolume) {
    emulatorInstance.setVolume(e.data.volume);
  }

  if (e.data.action === 'kill' && emulatorInstance) {
    try { 
      if (emulatorInstance.setVolume) emulatorInstance.setVolume(0);
      emulatorInstance.destroy(); 
    } catch(err){}
    emulatorInstance = null;
    document.getElementById('game-container').innerHTML = '';
  }
});

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

  // Allow System/Browser Keys to bypass the firewall so you can still use the web browser normally
  if (e.code === 'Escape' || (e.code.startsWith('F') && e.code !== 'F1' && e.code !== 'F2' && e.code !== 'F4')) return;

  // The Firewall: Prevents any key from causing ghost inputs in the emulator
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.preventDefault();

  // Only dispatch the key if it is explicitly listed in your UI Index
  if (activeBinds[e.code]) {
    const targetCode = activeBinds[e.code];
    const numericCode = keyCodeMap[targetCode] || 0;

    const newEvent = new KeyboardEvent(e.type, {
      code: targetCode,
      key: targetCode,
      bubbles: true,
      cancelable: true
    });

    Object.defineProperty(newEvent, 'keyCode', { get: () => numericCode });
    Object.defineProperty(newEvent, 'which', { get: () => numericCode });

    newEvent.__remapped = true;
    e.target.dispatchEvent(newEvent);
  }
}

window.addEventListener('keydown', handleKey, true); 
window.addEventListener('keyup', handleKey, true);
