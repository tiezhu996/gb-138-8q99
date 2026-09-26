import { useState } from 'react';
import { Link } from 'react-router-dom';
import { communicationTips, bodyChanges, practicalAdvice } from '../data/familyGuide';

const FamilyGuide = () => {
  const [activeTab, setActiveTab] = useState('communication');

  const tabs = [
    { id: 'communication', label: '沟通技巧', icon: '💬' },
    { id: 'body', label: '身体变化', icon: '📋' },
    { id: 'practical', label: '实用建议', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 hover:bg-warm-100 rounded-full transition-colors group"
            >
              <svg className="w-6 h-6 text-warm-600 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-warm-800">家属指南</h1>
              <p className="text-xs text-warm-500">用爱陪伴，温暖同行</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-emerald-600 font-medium mb-6 shadow-sm border border-emerald-100">
            <span>👨‍👩‍👧</span>
            <span>陪伴 · 理解 · 关爱</span>
          </div>
          <h2 className="text-4xl font-bold text-warm-900 mb-4">
            家属照护指南
          </h2>
          <p className="text-lg text-warm-600 max-w-2xl mx-auto leading-relaxed">
            作为家属，您的陪伴和支持对患者至关重要。在这里，您可以学习如何与患者沟通，
            了解临终阶段的身体变化，以及获取实用的照护建议。
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/60">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-warm-600 hover:bg-emerald-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-10 mb-10 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                    <span className="text-4xl">💝</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">如何与患者有效沟通</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    良好的沟通可以帮助患者感受到被理解和被关爱，减轻他们的恐惧和孤独感。
                    以下是一些实用的沟通技巧，希望能帮助您更好地陪伴患者。
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {communicationTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/60"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        {tip.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-warm-800 mb-2 group-hover:text-emerald-600 transition-colors">
                          {tip.title}
                        </h4>
                        <p className="text-warm-600 leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'body' && (
            <div className="space-y-8">
              <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-10 mb-10 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">临终阶段的身体变化</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    了解临终阶段可能出现的身体变化，可以帮助您更好地理解患者的状况，
                    做好心理准备，并给予适当的照护。
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {bodyChanges.map((stage) => (
                  <div
                    key={stage.id}
                    className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/60"
                  >
                    <div className="bg-gradient-to-r from-sky-500 to-blue-500 text-white px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                          {stage.stage === '早期' ? '🌅' : stage.stage === '中期' ? '🌤️' : '🌙'}
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold">{stage.stage}</h4>
                          <p className="text-white/80">{stage.title}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="mb-6">
                        <h5 className="font-bold text-warm-800 mb-4 text-lg">可能出现的症状：</h5>
                        <ul className="grid md:grid-cols-2 gap-3">
                          {stage.signs.map((sign, index) => (
                            <li key={index} className="flex items-start gap-3 text-warm-600 bg-sky-50/50 rounded-xl px-4 py-3">
                              <span className="text-sky-500 mt-1 text-lg">•</span>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
                        <h5 className="font-bold text-sky-800 mb-3 text-lg">💡 照护建议：</h5>
                        <p className="text-sky-700 leading-relaxed">{stage.care}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practical' && (
            <div className="space-y-6">
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-10 mb-10 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                    <span className="text-4xl">💡</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">实用照护建议</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    以下是一些日常照护中的实用建议，希望能帮助您更好地照顾患者，
                    同时也照顾好自己。
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {practicalAdvice.map((advice, index) => (
                  <div
                    key={advice.id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-warm-800 mb-2 group-hover:text-amber-600 transition-colors">
                          {advice.title}
                        </h4>
                        <p className="text-warm-600 leading-relaxed">
                          {advice.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="relative bg-gradient-to-r from-emerald-800 to-teal-900 text-white/80 py-10 mt-20">
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

export default FamilyGuide;
