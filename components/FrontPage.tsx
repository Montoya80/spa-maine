
import React from 'react';
import { Service, Promotion, BusinessConfig } from '../types';
import { Calendar, Clock, MapPin, Phone, Mail, ArrowRight, Star, Instagram, Facebook, ShieldCheck, User, Sparkles, Image as ImageIcon, Video, ChevronRight } from 'lucide-react';
import Logo from './Logo';

interface FrontPageProps {
  services: Service[];
  promotions: Promotion[];
  businessConfig: BusinessConfig;
  onNavigateLogin: (type: 'client' | 'employee') => void;
  onNavigateBooking: () => void;
}

const FrontPage: React.FC<FrontPageProps> = ({ 
  services, 
  promotions, 
  businessConfig, 
  onNavigateLogin, 
  onNavigateBooking 
}) => {
  const activeServices = services.filter(s => s.active);
  const activePromos = promotions.filter(p => p.active);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-28 items-center">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.scrollTo(0,0)}>
              <Logo className="h-16 md:h-20" />
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('servicios')} className="text-slate-600 hover:text-teal-600 font-bold text-sm uppercase tracking-wide transition-colors">Tratamientos</button>
              <button onClick={() => scrollToSection('promociones')} className="text-slate-600 hover:text-teal-600 font-bold text-sm uppercase tracking-wide transition-colors">Promociones</button>
              <button onClick={() => scrollToSection('ubicacion')} className="text-slate-600 hover:text-teal-600 font-bold text-sm uppercase tracking-wide transition-colors">Ubicación</button>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigateLogin('client')}
                className="hidden md:flex items-center gap-2 text-slate-600 hover:text-teal-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors"
              >
                <User size={18} /> INICIAR SESIÓN
              </button>
              <button 
                onClick={onNavigateBooking}
                className="bg-teal-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm md:text-base"
              >
                <Calendar size={18} /> RESERVAR
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Spa Atmosphere" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl px-4 animate-fade-in flex flex-col items-center">
          <div className="mb-12 hover:scale-105 transition-transform duration-700 drop-shadow-2xl">
               <Logo className="h-40 md:h-56" variant="white" layout="vertical" slogan={false} />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl tracking-tight">
            TU CUERPO <span className="text-teal-400">HABLA POR TI</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-100 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-light">
            Descubre tratamientos personalizados diseñados para revitalizar tu piel y calmar tu mente en un ambiente de serenidad absoluta.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
             <button 
                onClick={onNavigateBooking}
                className="bg-teal-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-teal-600 transition-all shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 w-full sm:w-auto hover:-translate-y-1"
             >
                Agendar mi Cita <ArrowRight size={20} />
             </button>
             <button 
                onClick={() => onNavigateLogin('client')}
                className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
             >
                <User size={20} /> Mi Cuenta
             </button>
          </div>
        </div>
      </div>

      {/* Promotions Section */}
      {activePromos.length > 0 && (
        <section id="promociones" className="py-24 bg-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">PROMOCIONES ESPECIALES</h2>
                 <div className="w-24 h-2 bg-teal-500 mx-auto rounded-full"></div>
                 <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">Aprovecha nuestras ofertas exclusivas por tiempo limitado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activePromos.map(promo => (
                      <div key={promo.id} className={`group relative rounded-[2rem] p-8 overflow-hidden text-white shadow-2xl transition-transform hover:-translate-y-2 duration-300 ${promo.color.replace('bg-', 'bg-gradient-to-br from-').replace('500', '500') + ' to-slate-900'}`}>
                          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                              <Star size={140} />
                          </div>
                          <div className="relative z-10 flex flex-col h-full justify-between">
                              <div>
                                  <span className="inline-block bg-white text-slate-900 px-4 py-1.5 rounded-full text-sm font-black mb-6 shadow-md border-2 border-white/50">
                                      {promo.discountText}
                                  </span>
                                  <h3 className="text-3xl font-black mb-4 tracking-tight drop-shadow-md leading-tight">{promo.title}</h3>
                                  <p className="text-white/95 leading-relaxed text-lg font-medium mb-8">
                                      {promo.description}
                                  </p>
                              </div>
                              <div className="flex items-center justify-between border-t border-white/20 pt-6 mt-auto">
                                  {promo.validUntil && (
                                      <div className="flex items-center gap-1 text-sm font-bold opacity-90 bg-black/20 px-3 py-1 rounded-lg">
                                          <Calendar size={16} /> Válido: {promo.validUntil}
                                      </div>
                                  )}
                                  <button onClick={onNavigateBooking} className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-base font-bold hover:bg-slate-100 transition-colors shadow-lg">
                                      Reservar
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
        </section>
      )}

      {/* Services Section */}
      <section id="servicios" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">CATÁLOGO DE SERVICIOS</h2>
                <div className="w-24 h-2 bg-teal-500 mx-auto rounded-full"></div>
                <p className="text-slate-500 mt-4 text-lg">Tratamientos diseñados para cada necesidad de tu piel.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeServices.map(service => (
                    <div key={service.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group border border-slate-100 hover:border-teal-200 flex flex-col h-full">
                        {/* Image Header */}
                        <div className="relative h-64 overflow-hidden bg-slate-200">
                             {service.imageUrl ? (
                                 <img 
                                     src={service.imageUrl} 
                                     alt={service.name} 
                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                 />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-400">
                                     <ImageIcon size={48} className="opacity-30" />
                                 </div>
                             )}
                             <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-5 py-2 rounded-xl text-teal-800 font-black text-xl shadow-lg border border-teal-100">
                                 ${service.price}
                             </div>
                        </div>

                        <div className="p-8 flex-1 flex flex-col">
                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors leading-tight mb-2">{service.name}</h3>
                                <div className="w-12 h-1 bg-teal-100 rounded-full"></div>
                            </div>
                            
                            <p className="text-slate-600 text-base mb-6 leading-relaxed flex-1">
                                {service.description || "Un tratamiento exclusivo diseñado para tu bienestar."}
                            </p>

                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider border-t border-slate-50 pt-4">
                                <span className="flex items-center gap-1.5"><Clock size={16} className="text-teal-500" /> {service.duration} MINUTOS</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded">PREMIUM</span>
                            </div>

                            <button 
                                onClick={onNavigateBooking}
                                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-teal-200 mt-auto"
                            >
                                Reservar Cita <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Footer / Location */}
      <footer id="ubicacion" className="bg-slate-900 text-white pt-20 pb-12 border-t-8 border-teal-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                  {/* Brand Column */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Logo variant="white" className="h-16" layout="horizontal" slogan={true} />
                      </div>
                      <p className="text-slate-400 leading-relaxed text-lg">
                          Tu destino premium para el cuidado de la piel y relajación. Expertos en dermatología estética y bienestar.
                      </p>
                      <div className="flex gap-4 pt-4">
                          {businessConfig.contact.facebookUrl && (
                            <a href={businessConfig.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-full hover:bg-teal-500 hover:text-white transition-all transform hover:scale-110 text-slate-400 border border-slate-700 hover:border-teal-400">
                                <Facebook size={32} />
                            </a>
                          )}
                          {businessConfig.contact.instagramUrl && (
                            <a href={businessConfig.contact.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-full hover:bg-teal-500 hover:text-white transition-all transform hover:scale-110 text-slate-400 border border-slate-700 hover:border-teal-400">
                                <Instagram size={32} />
                            </a>
                          )}
                          {businessConfig.contact.tiktokUrl && (
                             <a href={businessConfig.contact.tiktokUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-4 rounded-full hover:bg-teal-500 hover:text-white transition-all transform hover:scale-110 text-slate-400 border border-slate-700 hover:border-teal-400">
                                <Video size={32} />
                            </a>
                          )}
                      </div>
                  </div>

                  {/* Quick Links Column */}
                  <div>
                      <h4 className="font-bold text-lg mb-8 border-b-2 border-teal-500 pb-2 inline-block text-teal-400 tracking-wider">EXPLORA</h4>
                      <ul className="space-y-4">
                          <li>
                              <button onClick={() => scrollToSection('servicios')} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 text-lg font-medium group">
                                  <ChevronRight size={18} className="text-teal-500 group-hover:text-teal-300" /> Catálogo
                              </button>
                          </li>
                          <li>
                              <button onClick={() => scrollToSection('promociones')} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 text-lg font-medium group">
                                  <ChevronRight size={18} className="text-teal-500 group-hover:text-teal-300" /> Promociones
                              </button>
                          </li>
                           <li>
                              <button onClick={onNavigateBooking} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 text-lg font-medium group">
                                  <ChevronRight size={18} className="text-teal-500 group-hover:text-teal-300" /> Agendar Cita
                              </button>
                          </li>
                           <li>
                              <button onClick={() => onNavigateLogin('client')} className="text-slate-300 hover:text-white hover:translate-x-2 transition-all flex items-center gap-2 text-lg font-medium group">
                                  <ChevronRight size={18} className="text-teal-500 group-hover:text-teal-300" /> Acceso Cliente
                              </button>
                          </li>
                      </ul>
                  </div>

                  {/* Contact Column */}
                  <div>
                      <h4 className="font-bold text-lg mb-8 border-b-2 border-teal-500 pb-2 inline-block text-teal-400 tracking-wider">CONTACTO</h4>
                      <ul className="space-y-6 text-slate-300">
                          <li className="flex items-start gap-4 group cursor-pointer">
                              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-teal-500 transition-colors">
                                <MapPin size={24} className="text-teal-500 group-hover:text-white" />
                              </div>
                              <span className="text-lg leading-relaxed group-hover:text-white transition-colors">{businessConfig.contact.address}</span>
                          </li>
                          <li className="flex items-center gap-4 group cursor-pointer">
                              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-teal-500 transition-colors">
                                <Phone size={24} className="text-teal-500 group-hover:text-white" />
                              </div>
                              <span className="text-lg font-medium group-hover:text-white transition-colors">{businessConfig.contact.phone}</span>
                          </li>
                          <li className="flex items-center gap-4 group cursor-pointer">
                              <div className="bg-slate-800 p-2 rounded-lg group-hover:bg-teal-500 transition-colors">
                                <Mail size={24} className="text-teal-500 group-hover:text-white" />
                              </div>
                              <span className="text-lg group-hover:text-white transition-colors">{businessConfig.contact.email}</span>
                          </li>
                      </ul>
                  </div>

                  {/* Map Column */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      <h4 className="font-bold text-lg mb-8 border-b-2 border-teal-500 pb-2 inline-block text-teal-400 tracking-wider">UBICACIÓN</h4>
                      <div className="h-64 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 grayscale hover:grayscale-0 transition-all duration-700 relative group">
                          {businessConfig.contact.mapUrl && (
                                <iframe 
                                    src={businessConfig.contact.mapUrl}
                                    width="100%" 
                                    height="100%" 
                                    style={{ border: 0 }} 
                                    allowFullScreen 
                                    loading="lazy" 
                                    title="Mapa"
                                ></iframe>
                          )}
                          <div className="absolute inset-0 border-4 border-teal-500/0 group-hover:border-teal-500/50 transition-all pointer-events-none rounded-2xl"></div>
                      </div>
                  </div>
              </div>

              <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                  <p className="text-slate-500 text-sm font-medium">© {new Date().getFullYear()} Maine SPA Center. Todos los derechos reservados.</p>
                  
                  <div className="flex items-center gap-6">
                      <button onClick={() => onNavigateLogin('client')} className="text-sm text-slate-400 hover:text-white transition-colors font-medium">Portal Clientes</button>
                      
                      {/* Discrete Staff Access */}
                      <button 
                        onClick={() => onNavigateLogin('employee')}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-400 transition-colors px-4 py-2 rounded-full border border-slate-800 hover:border-teal-900 bg-slate-900 hover:bg-slate-800"
                      >
                          <ShieldCheck size={14} /> Acceso Colaboradores
                      </button>
                  </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default FrontPage;
