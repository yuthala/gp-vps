export default function ProductsLoading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 rounded-2xl border border-sky-200/50 shadow-inner">
      
      {/* НЕБО И ОБЛАКА */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Солнце */}
        <div className="absolute top-12 right-16 w-20 h-20 bg-amber-400 rounded-full animate-sun flex items-center justify-center">
          <div className="w-16 h-16 bg-yellow-300 rounded-full blur-[2px]" />
        </div>

        {/* Облако 1 (Большое и медленное) */}
        <div className="absolute top-16 left-[15%] w-40 h-12 bg-white/80 rounded-full blur-[1px] animate-float-slow before:content-[''] before:absolute before:bottom-3 before:left-6 before:w-16 before:h-16 before:bg-white/80 before:rounded-full after:content-[''] after:absolute after:bottom-3 after:right-8 after:w-20 after:h-20 after:bg-white/80 after:rounded-full" />

        {/* Облако 2 (Маленькое и побыстрее) */}
        <div className="absolute top-32 right-[25%] w-24 h-8 bg-white/70 rounded-full blur-[1px] animate-float-fast before:content-[''] before:absolute before:bottom-2 before:left-4 before:w-10 before:h-10 before:bg-white/70 before:rounded-full after:content-[''] after:absolute after:bottom-2 after:right-5 after:w-12 after:h-12 after:bg-white/70 after:rounded-full" />
      </div>

      {/* ТЕКСТ И ИНДИКАТОР ЗАГРУЗКИ */}
      <div className="z-10 text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-sky-200 text-sky-800 text-sm font-medium shadow-sm animate-pulse">
          <svg className="animate-spin h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Собираем свежий урожай...
        </div>
        <h3 className="text-xl font-bold text-slate-700">Загружаем каталог товаров</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
          Это займет всего секунду, мы уже связываемся с базой данных.
        </p>
      </div>

      {/* ЛУГ И ТРАВА (НИЖНЯЯ ЧАСТЬ) */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-emerald-600 to-emerald-500 flex items-end justify-center gap-4 px-8 overflow-hidden">
        
        {/* Стилизованные травинки разной высоты и наклона */}
        <div className="w-3 h-16 bg-emerald-400/90 rounded-t-full origin-bottom animate-sway" />
        <div className="w-2.5 h-12 bg-emerald-300/80 rounded-t-full origin-bottom animate-sway-slow delay-100" />
        <div className="w-4 h-20 bg-emerald-400 rounded-t-full origin-bottom animate-sway delay-300" />
        <div className="w-2 h-14 bg-emerald-300/90 rounded-t-full origin-bottom animate-sway-slow delay-700" />
        <div className="w-3.5 h-18 bg-emerald-400/80 rounded-t-full origin-bottom animate-sway delay-200" />
        
        {/* Декоративный цветок на лугу */}
        <div className="absolute bottom-6 left-1/3 flex flex-col items-center origin-bottom animate-sway-slow delay-500">
          {/* Лепестки */}
          <div className="w-4 h-4 bg-amber-400 rounded-full relative flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-yellow-100 rounded-full" />
            <div className="absolute -top-1 w-2 h-2 bg-white rounded-full" />
            <div className="absolute -bottom-1 w-2 h-2 bg-white rounded-full" />
            <div className="absolute -left-1 w-2 h-2 bg-white rounded-full" />
            <div className="absolute -right-1 w-2 h-2 bg-white rounded-full" />
          </div>
          {/* Стебелек */}
          <div className="w-0.5 h-8 bg-emerald-700" />
        </div>

        {/* Еще немного травы справа */}
        <div className="w-3 h-14 bg-emerald-400 rounded-t-full origin-bottom animate-sway-slow delay-1000" />
        <div className="w-2.5 h-18 bg-emerald-300/90 rounded-t-full origin-bottom animate-sway delay-150" />
        <div className="w-4 h-12 bg-emerald-400/80 rounded-t-full origin-bottom animate-sway-slow delay-400" />
      </div>
    </div>
  );
}

