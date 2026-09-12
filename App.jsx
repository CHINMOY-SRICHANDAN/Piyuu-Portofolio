const { useState, useEffect, useRef, useCallback } = React;

// --- UTILITIES & HOOKS ---

function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

const CustomCursor = () => {
  const cursorRef = useRef(null);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };
    
    const onMouseOver = (e) => {
      if (e.target.closest('button, a, input, textarea, .interactive')) {
        cursorRef.current.classList.add('hovering');
      } else {
        cursorRef.current.classList.remove('hovering');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor hidden md:block"></div>;
};

// --- COMPONENTS ---

const SectionHeading = ({ title }) => {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div ref={ref} className={`mb-12 flex items-center space-x-6 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
      <div className="h-px bg-gold w-16"></div>
      <h2 className="font-mono text-sm tracking-widest text-gold uppercase">{title}</h2>
    </div>
  );
};

const FileUploadZone = ({ onUpload, multiple = false, accept = "image/*,video/*", label = "Drag & drop or click to upload" }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    processFiles(e.target.files);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    
    setTimeout(() => {
      const processed = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      }));
      onUpload(multiple ? processed : processed[0]);
      setIsUploading(false);
    }, 800); // Simulate upload delay for progress ring
  };

  return (
    <div 
      className={`relative w-full border-2 border-dashed border-slate/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 interactive cursor-pointer hover:border-gold hover:bg-gold/5 ${isDragActive ? 'drop-zone-active' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={handleDrop}
    >
      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" multiple={multiple} accept={accept} onChange={handleChange} />
      
      {isUploading ? (
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-gold mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-mono text-xs text-gold">Uploading...</p>
        </div>
      ) : (
        <>
          <svg className="w-8 h-8 text-slate mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p className="font-body text-sm text-slate">{label}</p>
        </>
      )}
    </div>
  );
};


// --- SECTIONS ---

const Hero = () => {
  const titles = ["Beauty", "Tech", "Lifestyle", "Food"];
  const [titleIdx, setTitleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIdx(prev => (prev + 1) % titles.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-slate/10 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none"></div>
      
      <div className="z-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[110px] leading-tight font-medium mb-4 tracking-tight">
          Elena <span className="italic text-gold/90">Vance</span>
        </h1>
        <p className="font-mono text-sm md:text-base text-slate tracking-widest uppercase mb-8 h-6">
          UGC Creator · <span className="text-ivory transition-all duration-500">{titles[titleIdx]}</span> · Content Strategist
        </p>
        <a href="#work" className="inline-block border border-slate/40 px-8 py-4 rounded-full font-body text-sm tracking-wide transition-all duration-300 hover:border-gold hover:bg-gold hover:text-obsidian interactive">
          View My Work
        </a>
      </div>

      <div className="absolute bottom-12 animate-bounce text-slate/50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
      </div>
    </section>
  );
};

const About = () => {
  const [ref, isVisible] = useScrollReveal();
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800');
  const [bio, setBio] = useState("I create authentic, high-converting content that seamlessly bridges the gap between brands and their audiences. With a background in digital marketing and a passion for visual storytelling, I don't just make ads—I craft experiences.");

  return (
    <section id="about" className="py-32 px-6 max-w-7xl mx-auto">
      <SectionHeading title="About Me" />
      
      <div ref={ref} className={`grid grid-cols-1 md:grid-cols-12 gap-16 items-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="md:col-span-5 relative group">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate/10">
            <img src={profilePic} alt="Creator" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent"></div>
            
            {/* Hidden upload overlay for creator */}
            <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
              <FileUploadZone onUpload={(f) => setProfilePic(f.url)} label="Change Photo" />
            </div>
          </div>
        </div>
        
        <div className="md:col-span-7 space-y-10">
          <textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-transparent font-display text-2xl md:text-4xl leading-snug text-ivory/90 resize-none focus:outline-none focus:ring-1 focus:ring-gold/30 rounded-lg p-2 transition-all"
            rows="4"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-slate/20">
            <div>
              <p className="font-display text-4xl md:text-5xl text-gold mb-2">142</p>
              <p className="font-mono text-xs text-slate uppercase tracking-wider">Brand Deals</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl text-gold mb-2">3.2M</p>
              <p className="font-mono text-xs text-slate uppercase tracking-wider">Views Generated</p>
            </div>
            <div>
              <p className="font-display text-4xl md:text-5xl text-gold mb-2">6</p>
              <p className="font-mono text-xs text-slate uppercase tracking-wider">Platforms</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BrandDeals = () => {
  const initialBrands = ['Sephora', 'Dyson', 'Casetify', 'Olipop', 'Glossier', 'Fenty Beauty'];
  const [deals, setDeals] = useState([
    { id: 1, brand: 'Sephora', type: 'UGC Ad', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800', desc: 'Summer Sale Campaign. 2.1M views, 4.5% CTR.' },
    { id: 2, brand: 'Dyson', type: 'Review', img: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800', desc: 'Airwrap tutorial and honest review.' },
    { id: 3, brand: 'Olipop', type: 'Reel', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800', desc: 'Lifestyle integration for new flavor launch.' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [ref, isVisible] = useScrollReveal();

  const handleAddDeal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newDeal = {
      id: Date.now(),
      brand: formData.get('brand'),
      type: formData.get('type'),
      desc: formData.get('desc'),
      img: formData.get('imgUrl') || 'https://images.unsplash.com/photo-1616166336592-3bc344cb89d7?auto=format&fit=crop&q=80&w=800'
    };
    setDeals([newDeal, ...deals]);
    setShowModal(false);
  };

  return (
    <section id="work" className="py-32 overflow-hidden border-t border-slate/10 bg-obsidian relative">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex justify-between items-end">
          <SectionHeading title="Selected Brand Deals" />
          <button onClick={() => setShowModal(true)} className="text-sm font-mono text-gold hover:text-ivory transition-colors mb-12 flex items-center interactive">
            <span className="mr-2">+</span> Add Deal
          </button>
        </div>

        {/* Marquee */}
        <div className="marquee-container w-full overflow-hidden whitespace-nowrap mb-20 relative glass-panel py-6 rounded-2xl">
          <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-obsidian to-transparent z-10 top-0 pointer-events-none"></div>
          <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-obsidian to-transparent z-10 top-0 pointer-events-none"></div>
          
          <div className="marquee-scroll flex space-x-24 px-12 items-center opacity-70">
            {[...initialBrands, ...initialBrands].map((brand, i) => (
              <span key={i} className="font-display text-3xl text-slate">{brand}</span>
            ))}
          </div>
        </div>

        {/* Masonry Grid */}
        <div ref={ref} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {deals.map((deal) => (
            <div key={deal.id} className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate/10 cursor-pointer interactive">
              <img src={deal.img} alt={deal.brand} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute top-4 left-4 z-20 flex space-x-2">
                <span className="glass-panel px-3 py-1 rounded-full text-xs font-mono text-ivory">{deal.brand}</span>
                <span className="glass-panel px-3 py-1 rounded-full text-xs font-mono text-gold">{deal.type}</span>
              </div>
              
              <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="font-body text-ivory/90 text-sm leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {deal.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#111] border border-slate/20 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate hover:text-ivory interactive">✕</button>
            <h3 className="font-display text-2xl mb-6">Add Brand Deal</h3>
            <form onSubmit={handleAddDeal} className="space-y-4">
              <input name="brand" placeholder="Brand Name" required className="w-full bg-transparent border border-slate/30 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors" />
              <select name="type" className="w-full bg-transparent border border-slate/30 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors text-slate">
                <option value="UGC Ad">UGC Ad</option>
                <option value="Reel">Reel</option>
                <option value="Review">Review</option>
                <option value="Story">Story</option>
              </select>
              <textarea name="desc" placeholder="Metrics & Description" required className="w-full bg-transparent border border-slate/30 rounded-lg px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors h-24 resize-none" />
              
              <div className="mt-2">
                <label className="text-xs font-mono text-slate mb-2 block">Cover Media</label>
                <FileUploadZone onUpload={(f) => {
                  const input = document.createElement('input');
                  input.type = 'hidden'; input.name = 'imgUrl'; input.value = f.url;
                  document.forms[0].appendChild(input);
                }} />
              </div>
              
              <button type="submit" className="w-full bg-ivory text-obsidian font-body font-medium py-3 rounded-lg mt-4 hover:bg-gold transition-colors interactive">Save Deal</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const ContentGallery = () => {
  const tabs = ['All', 'Reels', 'Photos', 'Reviews'];
  const [activeTab, setActiveTab] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  
  const [items, setItems] = useState([
    { id: 1, type: 'Reels', url: 'https://images.unsplash.com/photo-1512496015851-a11fb3e223aa?auto=format&fit=crop&q=80&w=800' },
    { id: 2, type: 'Photos', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800' },
    { id: 3, type: 'Reviews', url: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&q=80&w=800' },
    { id: 4, type: 'Photos', url: 'https://images.unsplash.com/photo-1616166336592-3bc344cb89d7?auto=format&fit=crop&q=80&w=800' },
    { id: 5, type: 'Reels', url: 'https://images.unsplash.com/photo-1515347619362-7105a5a1f26a?auto=format&fit=crop&q=80&w=800' },
  ]);

  const filteredItems = activeTab === 'All' ? items : items.filter(i => i.type === activeTab);

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-slate/10">
      <SectionHeading title="Portfolio" />
      
      {/* Tabs */}
      <div className="flex space-x-8 border-b border-slate/20 mb-12">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 font-mono text-sm tracking-wide transition-colors relative interactive ${activeTab === tab ? 'text-ivory' : 'text-slate hover:text-ivory/70'}`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-gold animate-fade-in"></span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {filteredItems.map((item, i) => (
          <div 
            key={item.id} 
            className="break-inside-avoid rounded-xl overflow-hidden relative group cursor-pointer interactive animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
            onClick={() => setLightbox(item)}
          >
            <img src={item.url} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Portfolio" />
            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/40 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono text-gold border border-gold/50 px-4 py-2 rounded-full backdrop-blur-sm">View</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Upload Zone (For Creator) */}
      <div className="mt-16">
        <h4 className="font-mono text-sm text-slate mb-4">Add to Portfolio (Bulk Upload)</h4>
        <FileUploadZone 
          multiple={true} 
          onUpload={(files) => setItems([...files.map(f => ({ id: Math.random(), type: 'Photos', url: f.url })), ...items])} 
        />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <button className="absolute top-8 right-8 text-white text-2xl interactive">✕</button>
          <img src={lightbox.url} className="max-h-[90vh] max-w-full object-contain shadow-2xl rounded-sm" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
};

const PhotosSection = () => {
  const chips = ['Lifestyle', 'Products', 'Behind the Scenes', 'Flat Lays'];
  const [activeChip, setActiveChip] = useState('Lifestyle');
  const [lightbox, setLightbox] = useState(null);
  
  const [photos, setPhotos] = useState([
    { id: 1, category: 'Lifestyle', url: 'https://images.unsplash.com/photo-1512496015851-a11fb3e223aa?auto=format&fit=crop&q=80&w=800' },
    { id: 2, category: 'Products', url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800' },
    { id: 3, category: 'Lifestyle', url: 'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?auto=format&fit=crop&q=80&w=800' },
    { id: 4, category: 'Behind the Scenes', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800' },
  ]);

  const filteredPhotos = photos.filter(p => p.category === activeChip);

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-slate/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-6 md:space-y-0">
        <SectionHeading title="Photography" />
        
        {/* Chips */}
        <div className="flex flex-wrap gap-3">
          {chips.map(chip => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-5 py-2 rounded-full font-body text-sm transition-all duration-300 interactive ${
                activeChip === chip 
                  ? 'bg-gold text-obsidian shadow-[0_0_15px_rgba(201,169,110,0.3)]' 
                  : 'bg-slate/10 text-slate hover:bg-slate/20 hover:text-ivory'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {filteredPhotos.map((photo, i) => (
          <div 
            key={photo.id} 
            className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer interactive animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
            onClick={() => setLightbox(photo)}
          >
            <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={photo.category} />
            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/30 transition-colors duration-300"></div>
          </div>
        ))}
      </div>

      {/* Upload */}
      <div className="max-w-md">
        <FileUploadZone 
          multiple={true} 
          accept="image/*"
          label="Upload to Photos Gallery"
          onUpload={(files) => setPhotos([...files.map(f => ({ id: Math.random(), category: activeChip, url: f.url })), ...photos])} 
        />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)}>
          <button className="absolute top-8 right-8 text-white text-2xl interactive">✕</button>
          <img src={lightbox.url} className="max-h-[90vh] max-w-full object-contain shadow-2xl rounded-sm" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  );
};

const Packages = () => {
  const [ref, isVisible] = useScrollReveal();
  
  const pkgs = [
    { name: "Starter", price: "$450", desc: "Perfect for testing content styles.", features: ["1 UGC Video (15-30s)", "3 High-Res Photos", "Raw footage included", "1 Revision"] },
    { name: "Creator", price: "$1,200", desc: "Most popular for ad campaigns.", features: ["3 UGC Videos (15-60s)", "10 High-Res Photos", "Usage rights (3 months)", "2 Hooks / 1 CTA variation"] },
    { name: "Premium", price: "$2,500", desc: "Complete content scaling solution.", features: ["8 UGC Videos", "20 High-Res Photos", "Whitelisting rights", "Full script writing"] }
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-obsidian to-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading title="Packages & Rates" />
        
        <div ref={ref} className={`grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          {pkgs.map((pkg, i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl relative group hover:-translate-y-2 transition-transform duration-500 flex flex-col interactive">
              <div className="absolute inset-0 bg-gradient-to-b from-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
              
              <h3 className="font-display text-3xl mb-2">{pkg.name}</h3>
              <p className="font-mono text-gold text-xl mb-6">{pkg.price}</p>
              <p className="text-slate text-sm mb-8 pb-8 border-b border-slate/10">{pkg.desc}</p>
              
              <ul className="space-y-4 mb-12 flex-grow">
                {pkg.features.map((feat, j) => (
                  <li key={j} className="flex items-start text-sm text-ivory/80">
                    <svg className="w-5 h-5 text-gold mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
                    {feat}
                  </li>
                ))}
              </ul>
              
              <a href="#contact" className="w-full text-center border border-slate/30 py-3 rounded-lg font-body text-sm hover:border-gold hover:text-gold transition-colors">
                Get a Quote
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const quotes = [
    { text: "Elena completely transformed our Q3 ad creatives. Her hook retention was 40% above our baseline.", brand: "Glossier", name: "Sarah J.", role: "Growth Lead" },
    { text: "Professional, fast, and incredibly intuitive with our brand voice. The ROAS speaks for itself.", brand: "Olipop", name: "Mark D.", role: "Marketing Dir." },
    { text: "Her aesthetic perfectly matched our new product line. The assets are performing flawlessly on TikTok.", brand: "Sephora", name: "Amanda K.", role: "Social Manager" }
  ];

  return (
    <section className="py-32 border-t border-slate/10 overflow-hidden relative">
      <SectionHeading title="Client Love" />
      <div className="flex space-x-8 px-6 animate-marquee mt-16 w-max">
        {/* Simple duplication for manual infinite scroll feel */}
        {[...quotes, ...quotes].map((q, i) => (
          <div key={i} className="w-[400px] glass-panel p-10 rounded-2xl shrink-0">
            <svg className="w-8 h-8 text-gold/40 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
            <p className="font-display text-xl leading-relaxed text-ivory/90 mb-8">"{q.text}"</p>
            <div>
              <p className="font-mono text-sm text-gold uppercase">{q.brand}</p>
              <p className="text-xs text-slate mt-1">{q.name} · {q.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const Contact = () => {
  const [ref, isVisible] = useScrollReveal();
  const [status, setStatus] = useState('idle');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1500);
  };

  return (
    <section id="contact" className="py-32 px-6 max-w-4xl mx-auto">
      <div ref={ref} className={`glass-panel p-8 md:p-16 rounded-3xl ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <h2 className="font-display text-4xl md:text-5xl mb-4 text-center">Let's Create Together</h2>
        <p className="text-slate text-center mb-12 font-body text-sm md:text-base">Fill out the form below or email me directly at hello@elenavance.com</p>
        
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="font-display text-2xl mb-2">Message Sent</h3>
            <p className="text-slate">I'll get back to you within 24 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-8 text-gold font-mono text-sm uppercase interactive">Send another</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required type="text" placeholder="Your Name" className="w-full bg-obsidian/50 border border-slate/20 rounded-xl px-5 py-4 focus:border-gold focus:outline-none transition-colors interactive" />
              <input required type="email" placeholder="Email Address" className="w-full bg-obsidian/50 border border-slate/20 rounded-xl px-5 py-4 focus:border-gold focus:outline-none transition-colors interactive" />
            </div>
            <input required type="text" placeholder="Brand / Agency Name" className="w-full bg-obsidian/50 border border-slate/20 rounded-xl px-5 py-4 focus:border-gold focus:outline-none transition-colors interactive" />
            <select required className="w-full bg-obsidian/50 border border-slate/20 rounded-xl px-5 py-4 focus:border-gold focus:outline-none transition-colors text-slate interactive">
              <option value="" disabled selected>Select Project Type</option>
              <option value="ugc">UGC Ad Creatives</option>
              <option value="organic">Organic TikTok / Reels</option>
              <option value="photo">Product Photography</option>
              <option value="other">Other Collaboration</option>
            </select>
            <textarea required placeholder="Project Details & Budget" rows="5" className="w-full bg-obsidian/50 border border-slate/20 rounded-xl px-5 py-4 focus:border-gold focus:outline-none transition-colors resize-none interactive"></textarea>
            
            <button disabled={status === 'loading'} type="submit" className="w-full bg-ivory text-obsidian font-medium py-4 rounded-xl hover:bg-gold transition-colors interactive flex justify-center items-center">
              {status === 'loading' ? (
                <svg className="animate-spin h-5 w-5 text-obsidian" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Send Inquiry"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="border-t border-slate/10 py-12 text-center text-slate">
    <h3 className="font-display text-2xl text-ivory mb-2">Elena Vance</h3>
    <p className="font-mono text-xs uppercase tracking-widest mb-8">UGC Creator & Strategist</p>
    <div className="flex justify-center space-x-6 mb-8">
      {['Instagram', 'TikTok', 'YouTube', 'LinkedIn'].map(social => (
        <a key={social} href="#" className="hover:text-gold transition-colors text-sm font-body interactive">{social}</a>
      ))}
    </div>
    <p className="text-xs opacity-50">&copy; {new Date().getFullYear()} Elena Vance. All rights reserved.</p>
  </footer>
);

const App = () => {
  return (
    <div className="relative min-h-screen bg-obsidian text-ivory selection:bg-gold selection:text-obsidian font-body overflow-x-hidden">
      <CustomCursor />
      <div className="bg-noise"></div>
      
      <main className="relative z-10">
        <Hero />
        <About />
        <BrandDeals />
        <ContentGallery />
        <PhotosSection />
        <Packages />
        <Testimonials />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
};

// Render the application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
