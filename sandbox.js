window.addEventListener('message', async (e) => {
  if (e.data.action === 'load') {
    const blobUrl = URL.createObjectURL(new Blob([e.data.buffer]));
    const ext = e.data.name.split('.').pop().toLowerCase();
    
    const sysMap = { 
      nes: 'fceumm', sfc: 'snes9x', md: 'genesis_plus_gx', gen: 'genesis_plus_gx', 
      gba: 'mgba', gb: 'gambatte', gbc: 'gambatte', sms: 'genesis_plus_gx', gg: 'genesis_plus_gx',
      pbp: 'pcsx_rearmed', chd: 'pcsx_rearmed', iso: 'pcsx_rearmed', cue: 'pcsx_rearmed', bin: 'pcsx_rearmed'
    };

    window.EJS_player = '#game-container';
    window.EJS_gameUrl = blobUrl;
    window.EJS_core = sysMap[ext] || 'nes';
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_volume = e.data.volume;
    window.EJS_gameID = e.data.name; 
    
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    document.body.appendChild(script);
  }

  if (e.data.action === 'volume' && window.EJS_emulator) {
    try { window.EJS_emulator.setVolume(e.data.volume); } catch(err){}
  }
});
