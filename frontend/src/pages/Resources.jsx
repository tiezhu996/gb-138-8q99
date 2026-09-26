import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { regions, institutions, serviceTypes } from '../data/resources';

const Resources = () => {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      const matchRegion = selectedRegion === 'all' || inst.region === selectedRegion;
      const matchSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchServices = selectedServices.length === 0 ||
        selectedServices.some(s => inst.services.includes(s));
      return matchRegion && matchSearch && matchServices;
    });
  }, [selectedRegion, searchQuery, selectedServices]);

  const toggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-warm-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-warm-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 hover:bg-warm-100 rounded-full transition-colors group"
            >
              <svg className="w-6 h-6 text-warm-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-warm-800">资源对接</h1>
              <p className="text-xs text-warm-500">全国安宁疗护机构查询</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-amber-600 font-medium mb-6 shadow-sm border border-amber-100">
            <span>🏥</span>
            <span>专业 · 全面 · 可信赖</span>
          </div>
          <h2 className="text-4xl font-bold text-warm-900 mb-4">
            安宁疗护机构查询
          </h2>
          <p className="text-lg text-warm-600 max-w-2xl mx-auto leading-relaxed">
            查找您所在地区的安宁疗护机构，获取专业的照护服务。
            收录全国主要城市的公立医院和社区卫生服务中心信息。
          </p>
        </div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10 border border-white/60">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
          </div>
          <div className="relative grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-3">
                选择地区
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none bg-white/50 text-lg"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-warm-700 mb-3">
                搜索机构
              </label>
              <div className="relative">
                <svg className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="输入机构名称或地址关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-5 py-4 rounded-2xl border-2 border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all outline-none bg-white/50 text-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-warm-700 mb-4">
              服务类型筛选
            </label>
            <div className="flex flex-wrap gap-3">
              {serviceTypes.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    selectedServices.includes(service)
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white/60 text-warm-600 hover:bg-amber-50 border border-warm-200'
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between px-2">
          <p className="text-warm-600 text-lg">
            共找到 <span className="font-bold text-amber-600 text-xl">{filteredInstitutions.length}</span> 家机构
          </p>
          {(selectedRegion !== 'all' || searchQuery || selectedServices.length > 0) && (
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSearchQuery('');
                setSelectedServices([]);
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              <span>🔄</span>
              <span>清除筛选</span>
            </button>
          )}
        </div>

        <div className="space-y-5">
          {filteredInstitutions.length === 0 ? (
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/60 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
              </div>
              <div className="relative">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-warm-800 mb-3">
                  未找到匹配的机构
                </h3>
                <p className="text-warm-500 text-lg">
                  请尝试调整筛选条件或搜索关键词
                </p>
              </div>
            </div>
          ) : (
            filteredInstitutions.map((inst) => (
              <div
                key={inst.id}
                className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/60 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                </div>
                <div className="relative flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-2xl font-bold text-warm-800 group-hover:text-amber-600 transition-colors">
                        {inst.name}
                      </h3>
                      <span className="px-4 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full text-sm font-semibold">
                        {inst.type}
                      </span>
                      <span className="px-4 py-1.5 bg-warm-100 text-warm-600 rounded-full text-sm font-semibold">
                        {regions.find(r => r.id === inst.region)?.name}
                      </span>
                    </div>
                    <p className="text-warm-600 mb-5 leading-relaxed">
                      {inst.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {inst.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-5 text-base text-warm-500">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span>{inst.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📞</span>
                        <a
                          href={`tel:${inst.phone}`}
                          className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                          {inst.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-3 md:min-w-[160px]">
                    <a
                      href={`tel:${inst.phone}`}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">📞</span>
                      <span>立即咨询</span>
                    </a>
                    <button
                      className="flex-1 px-6 py-4 bg-warm-100 text-warm-700 rounded-2xl font-bold hover:bg-amber-100 transition-colors text-center flex items-center justify-center gap-2 group-hover:border-2 group-hover:border-amber-200"
                    >
                      <span className="text-lg">⭐</span>
                      <span>收藏</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="relative bg-gradient-to-r from-amber-800 to-orange-900 text-white/80 py-10 mt-20">
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

export default Resources;
