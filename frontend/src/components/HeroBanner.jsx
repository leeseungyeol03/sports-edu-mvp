import React from 'react';

export default function HeroBanner() {
  return (
    <div className="bg-slate-50 border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
            학교 체육의 한계를 <br/>
            <span className="text-purple-600">장비 공유</span>로 넘어서세요.
          </h1>
          <p className="text-lg text-gray-600">
            고가의 체육 장비, 이제 구매하지 말고 필요한 기간만큼 학교 간 공유하세요. 
            전문가의 코칭 영상과 함께 체육 수업의 질을 높여드립니다.
          </p>
          <div className="flex gap-3">
            <button className="bg-slate-900 text-white px-6 py-3 font-bold text-base hover:bg-slate-800 shadow-lg">
              지금 시작하기
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md h-64 bg-white shadow-2xl border border-gray-200 flex items-center justify-center text-8xl rounded-lg transform rotate-2 hover:rotate-0 transition-transform duration-500">
            🤺
          </div>
        </div>
      </div>
    </div>
  );
}