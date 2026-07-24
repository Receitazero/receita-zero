// vc-photos.js — Motor de fotos reais para sites Vitrine Certa
// Recebe fotos via query params (?img1=...&img2=...&img3=...) e postMessage
// Usado por todos os nichos site-dfy/{nicho}/index.html

(function(){
  // Fotos padrão de exemplo por nicho (fallback quando não há fotos reais)
  const DEFAULT_PHOTOS = {
    pet: ['assets/hero.jpg','assets/banho.jpg','assets/tosa.jpg'],
    padaria: ['assets/banner.jpg','assets/b1.jpg','assets/b2.jpg'],
    pizzaria: ['assets/banner.jpg','assets/p1.jpg','assets/p2.jpg'],
    oficina: ['assets/banner.jpg','assets/o1.jpg','assets/o2.jpg'],
    salão: ['assets/banner.jpg','assets/s1.jpg','assets/s2.jpg'],
    clínica: ['assets/banner.jpg','assets/c1.jpg','assets/c2.jpg'],
    lavanderia: ['assets/banner.jpg','assets/l1.jpg','assets/l2.jpg'],
    imobiliária: ['assets/banner.jpg','assets/i1.jpg','assets/i2.jpg']
  };

  // Detecta o nicho da URL
  function getNicho(){
    const parts = location.pathname.split('/');
    const idx = parts.indexOf('site-dfy');
    if(idx >= 0 && parts[idx+1]) return parts[idx+1];
    return 'pet';
  }

  const nicho = getNicho();
  const defaults = DEFAULT_PHOTOS[nicho] || DEFAULT_PHOTOS.pet;

  // Estado de fotos
  let photos = [...defaults];
  let nome = '';
  let cidade = '';

  // Lê query params
  function readQueryParams(){
    const p = new URLSearchParams(location.search);
    nome = p.get('nome') || '';
    cidade = p.get('cidade') || '';
    const imgs = [];
    for(let i=1;i<=3;i++){
      const img = p.get('img'+i);
      if(img) imgs.push(decodeURIComponent(img));
    }
    if(imgs.length > 0) photos = imgs;
  }

  // Aplica nome/cidade no HTML
  function applyNameCity(){
    if(!nome && !cidade) return;
    const full = nome ? (cidade ? nome+' em '+cidade : nome) : (cidade ? 'Serviços em '+cidade : '');
    if(!full) return;

    // Mapeia textos conhecidos para substituir
    const map = {};
    if(nome) map['PetMania'] = nome;
    if(cidade) map['São Vicente'] = cidade;

    document.querySelectorAll('title,meta[name=description],meta[property^="og"],meta[property^="twitter"],h1,h2,h3,.eyebrow,.hero p.lede,footer,.hero-text span').forEach(el=>{
      if(el.tagName === 'META'){
        const content = el.getAttribute('content') || '';
        let c = content;
        if(nome) c = c.replace(/PetMania/g, nome);
        if(cidade) c = c.replace(/São Vicente/g, cidade);
        el.setAttribute('content', c);
      } else {
        let t = el.textContent || '';
        if(nome) t = t.replace(/PetMania/g, nome);
        if(cidade) t = t.replace(/São Vicente/g, cidade);
        el.textContent = t;
      }
    });

    // H1 do hero vira o nome do lugar
    const h1 = document.querySelector('.hero h1');
    if(h1 && nome){
      const display = cidade ? nome+' em '+cidade : nome;
      const parts = display.split(' ');
      if(parts.length >= 2){
        h1.innerHTML = parts[0]+' <em>'+parts.slice(1).join(' ')+'</em>';
      } else {
        h1.textContent = display;
      }
    }

    document.title = cidade ? nome+' em '+cidade : nome;
  }

  // Aplica fotos reais nos elementos de imagem
  function applyPhotos(){
    // Hero image
    const heroImg = document.querySelector('.hero-fig img');
    if(heroImg && photos[0]){
      heroImg.src = photos[0];
      heroImg.alt = nome || 'Foto do negócio';
    }

    // Split images (seção "como cuidamos")
    const splitImgs = document.querySelectorAll('.split-img img');
    if(splitImgs.length > 0){
      splitImgs.forEach((img, i)=>{
        if(photos[i+1]){
          img.src = photos[i+1];
          img.alt = nome || 'Foto do negócio';
        }
      });
    }

    // Também tenta aplicar em outras imagens de assets
    const allImgs = document.querySelectorAll('img[src^="assets/"]');
    allImgs.forEach((img, i)=>{
      // Não sobrescreve se já foi aplicado acima
      if(!img.src.includes(photos[0]) && photos[i % photos.length]){
        // Só sobrescreve se ainda é uma imagem de exemplo
        if(img.src.includes('assets/')){
          img.src = photos[i % photos.length];
        }
      }
    });
  }

  // Recebe fotos via postMessage (fallback)
  function setupMessageListener(){
    window.addEventListener('message', function(e){
      if(!e.data || e.data.type !== 'VC_PHOTOS') return;
      if(e.data.photos && e.data.photos.length > 0){
        photos = e.data.photos;
        if(e.data.name) nome = e.data.name;
        if(e.data.city) cidade = e.data.city;
        applyNameCity();
        applyPhotos();
      }
    });
  }

  // Inicializa
  function init(){
    readQueryParams();
    applyNameCity();
    applyPhotos();
    setupMessageListener();
  }

  // Executa quando DOM estiver pronto
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exporta para uso manual se necessário
  window.VC_PHOTOS = {
    setPhotos: function(imgs){ photos = imgs; applyPhotos(); },
    setNome: function(n){ nome = n; applyNameCity(); },
    getPhotos: function(){ return photos; }
  };
})();
