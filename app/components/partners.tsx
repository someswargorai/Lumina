export default function Partners() {
    return (
         <section className="py-12 border-y border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by writers from</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale transition-all hover:grayscale-0">
              {['The New Yorker', 'WIRED', 'Medium', 'Substack', 'The Atlantic'].map((brand) => (
                <span key={brand} className="serif text-xl font-bold text-slate-900">{brand}</span>
              ))}
            </div>
          </div>
        </section>
    );
}