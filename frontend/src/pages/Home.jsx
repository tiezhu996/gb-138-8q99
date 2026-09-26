import { Link } from 'react-router-dom';

const Home = () => {
  const menuItems = [
    {
      id: 'symptoms',
      title: '症状管理',
      icon: '💊',
      gradient: 'from-sky-400 to-blue-600',
      bgColor: 'bg-sky-50',
      description: '了解常见症状的护理方法，缓解患者不适',
      path: '/symptoms'
    },
    {
      id: 'family',
      title: '家属指南',
      icon: '👨‍👩‍👧',
      gradient: 'from-emerald-400 to-green-600',
      bgColor: 'bg-emerald-50',
      description: '学习沟通技巧，了解临终阶段的身体变化',
      path: '/family'
    },
    {
      id: 'psychological',
      title: '心理支持',
      icon: '🧠',
      gradient: 'from-violet-400 to-purple-600',
      bgColor: 'bg-violet-50',
      description: '冥想音频引导、心理自测量表和援助热线',
      path: '/psychological'
    },
    {
      id: 'resources',
      title: '资源对接',
      icon: '🏥',
      gradient: 'from-amber-400 to-orange-600',
      bgColor: 'bg-amber-50',
      description: '全国安宁疗护机构查询，按地区筛选',
      path: '/resources'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform">
                🕊️
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                  安宁疗护信息指南
                </h1>
                <p className="text-xs text-warm-500">让爱温暖每一段旅程</p>
              </div>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-full hover:from-rose-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium"
            >
              <span>📋</span>
              <span>心愿清单</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-rose-600 font-medium mb-6 shadow-sm border border-rose-100">
            <span>💝</span>
            <span>专业 · 温暖 · 陪伴</span>
          </div>
          <h2 className="text-5xl font-bold text-warm-900 mb-6 leading-tight">
            让爱温暖
            <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
              每一段旅程
            </span>
          </h2>
          <p className="text-xl text-warm-600 max-w-2xl mx-auto leading-relaxed">
            我们致力于为临终患者及其家属提供专业、温暖的照护信息和资源支持，
            帮助您在困难时刻获得所需的知识和力量。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="group relative block overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/60"
            >
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${item.gradient}`} />
              </div>
              <div className="relative p-8">
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-4xl shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-warm-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-rose-500 group-hover:to-orange-500 group-hover:bg-clip-text transition-all">
                      {item.title}
                    </h3>
                    <p className="text-warm-500 leading-relaxed text-base">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center text-warm-400 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-orange-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 rounded-[2rem] p-10 md:p-14 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
              <span className="text-3xl">🆘</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold mb-5">
              需要紧急帮助？
            </h3>
            <p className="text-white/90 text-lg mb-8 leading-relaxed">
              如果您或您的家人正处于困难时刻，请不要犹豫，立即寻求专业帮助。
              我们的心理援助热线24小时为您服务。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:400-161-9995"
                className="group flex items-center gap-3 px-8 py-4 bg-white text-rose-600 rounded-full font-bold text-lg hover:bg-warm-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                <span>400-161-9995</span>
              </a>
              <Link
                to="/psychological"
                className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-semibold hover:bg-white/30 transition-all border border-white/40"
              >
                <span>💚</span>
                <span>了解更多心理支持</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative bg-gradient-to-r from-warm-800 to-warm-900 text-white/80 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🕊️</span>
            <span className="text-lg font-semibold text-white">安宁疗护信息指南</span>
          </div>
          <p className="text-sm text-white/50 max-w-xl mx-auto">
            本平台仅供信息参考，具体诊疗请遵医嘱。如有紧急情况，请立即就医。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
