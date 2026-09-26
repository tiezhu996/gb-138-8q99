import { useState } from 'react';
import { Link } from 'react-router-dom';

const getInitialWishes = () => {
  try {
    const saved = localStorage.getItem('wishList');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const WishList = () => {
  const [wishes, setWishes] = useState(getInitialWishes);
  const [newWish, setNewWish] = useState('');
  const [filter, setFilter] = useState('all');

  const saveWishes = (newWishes) => {
    setWishes(newWishes);
    localStorage.setItem('wishList', JSON.stringify(newWishes));
  };

  const addWish = () => {
    if (newWish.trim()) {
      const updated = [
        ...wishes,
        {
          id: Date.now(),
          text: newWish.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
          completedAt: null
        }
      ];
      saveWishes(updated);
      setNewWish('');
    }
  };

  const toggleWish = (id) => {
    const updated = wishes.map(wish =>
      wish.id === id
        ? {
            ...wish,
            completed: !wish.completed,
            completedAt: !wish.completed ? new Date().toISOString() : null
          }
        : wish
    );
    saveWishes(updated);
  };

  const deleteWish = (id) => {
    const updated = wishes.filter(wish => wish.id !== id);
    saveWishes(updated);
  };

  const clearCompleted = () => {
    if (confirm('确定要清除所有已完成的心愿吗？')) {
      const updated = wishes.filter(wish => !wish.completed);
      saveWishes(updated);
    }
  };

  const filteredWishes = wishes.filter(wish => {
    if (filter === 'active') return !wish.completed;
    if (filter === 'completed') return wish.completed;
    return true;
  });

  const completedCount = wishes.filter(w => w.completed).length;
  const activeCount = wishes.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-fuchsia-200/30 rounded-full blur-3xl" />
      </div>

      <header className="relative bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-white/50">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 hover:bg-warm-100 rounded-full transition-colors group"
            >
              <svg className="w-6 h-6 text-warm-600 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-warm-800">心愿清单</h1>
              <p className="text-xs text-warm-500">记录每一个温暖的心愿</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-2xl mb-6">
            <span className="text-6xl">✨</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm text-rose-600 font-medium mb-6 shadow-sm border border-rose-100">
            <span>💝</span>
            <span>心愿 · 温暖 · 实现</span>
          </div>
          <h2 className="text-4xl font-bold text-warm-900 mb-4">
            心愿清单
          </h2>
          <p className="text-lg text-warm-600 max-w-xl mx-auto leading-relaxed">
            记录每一个想完成的心愿，让家人帮助您逐一实现。
            每一个心愿都值得被认真对待，每一份温暖都值得被珍藏。
          </p>
        </div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10 border border-white/60">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
          </div>
          <div className="relative flex gap-4">
            <input
              type="text"
              value={newWish}
              onChange={(e) => setNewWish(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addWish()}
              placeholder="写下一个心愿..."
              className="flex-1 px-5 py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all outline-none text-lg bg-white/50"
            />
            <button
              onClick={addWish}
              disabled={!newWish.trim()}
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              添加
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: 'all', label: '全部', count: wishes.length, icon: '📋' },
            { id: 'active', label: '待完成', count: activeCount, icon: '⏳' },
            { id: 'completed', label: '已完成', count: completedCount, icon: '✅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-warm-600 hover:bg-rose-50 shadow-md border border-white/60'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`text-sm ${filter === tab.id ? 'text-white/80' : 'text-warm-400'}`}>({tab.count})</span>
            </button>
          ))}
        </div>

        {wishes.length > 0 && (
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-sm border border-white/50">
              <span className="text-warm-500">进度</span>
              <div className="w-32 h-2 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${wishes.length > 0 ? (completedCount / wishes.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-warm-600 font-semibold">
                {completedCount} / {wishes.length}
              </span>
            </div>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-sm text-warm-500 hover:text-red-500 font-medium transition-colors flex items-center gap-1"
              >
                <span>🗑️</span>
                <span>清除已完成</span>
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {filteredWishes.length === 0 ? (
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/60 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-rose-400 to-pink-500" />
              </div>
              <div className="relative">
                <div className="text-7xl mb-6">
                  {filter === 'all' ? '📝' : filter === 'active' ? '🎉' : '💪'}
                </div>
                <h3 className="text-2xl font-bold text-warm-800 mb-3">
                  {filter === 'all' ? '还没有心愿' : filter === 'active' ? '太棒了！所有心愿都已完成' : '还没有完成的心愿'}
                </h3>
                <p className="text-warm-500 text-lg">
                  {filter === 'all' ? '在上方输入框写下第一个心愿吧' : '继续保持这份温暖和力量'}
                </p>
              </div>
            </div>
          ) : (
            filteredWishes.map((wish) => (
              <div
                key={wish.id}
                className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:shadow-xl border border-white/60 overflow-hidden ${
                  wish.completed ? 'bg-gradient-to-r from-green-50/80 to-emerald-50/80' : ''
                }`}
              >
                <button
                  onClick={() => toggleWish(wish.id)}
                  className={`w-10 h-10 rounded-full border-3 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    wish.completed
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-transparent text-white shadow-lg scale-110'
                      : 'border-warm-300 hover:border-rose-400 hover:bg-rose-50'
                  }`}
                >
                  {wish.completed && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-xl ${wish.completed ? 'text-warm-400 line-through' : 'text-warm-800 font-medium'}`}>
                    {wish.text}
                  </p>
                  <p className="text-sm text-warm-400 mt-1 flex items-center gap-1">
                    <span>{wish.completed ? '✅' : '📅'}</span>
                    <span>
                      {wish.completed
                        ? `完成于 ${new Date(wish.completedAt).toLocaleDateString('zh-CN')}`
                        : `创建于 ${new Date(wish.createdAt).toLocaleDateString('zh-CN')}`}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => deleteWish(wish.id)}
                  className="p-3 text-warm-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {wishes.length > 0 && (
          <div className="relative mt-12 bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-3xl p-10 text-center shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <p className="relative text-xl text-white leading-relaxed">
              💝 每一个心愿都是对生活的热爱，每一次完成都是爱的见证。
              <br />
              愿所有美好的心愿都能如愿以偿。
            </p>
          </div>
        )}
      </main>

      <footer className="relative bg-gradient-to-r from-rose-800 to-pink-900 text-white/80 py-10 mt-20">
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

export default WishList;
