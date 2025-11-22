import React, { useState } from 'react';
import { Star } from 'lucide-react';
import HeroBanner from '../components/HeroBanner'; // 이제 파일이 존재하므로 에러가 사라집니다.

const StarRating = ({ rating, count }) => (
  <div className="flex items-center space-x-1 text-xs font-bold text-yellow-600">
    <span className="mr-1">{rating}</span>
    <div className="flex text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
      ))}
    </div>
    <span className="text-gray-400 font-normal">({count})</span>
  </div>
);

export default function Catalog({ data, onSelect }) {
  const [filter, setFilter] = useState('ALL');
  const categories = ['ALL', '펜싱', '양궁', '골프', '배드민턴'];
  const filteredData = filter === 'ALL' ? (data || []) : (data || []).filter(item => item.category === filter);

  return (
    <div className="pb-20">
      <HeroBanner />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4 border-b border-gray-200 mb-6">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`pb-2 text-sm font-bold whitespace-nowrap ${filter === cat ? 'text-slate-900 border-b-2 border-slate-900' : 'text-gray-500'}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.length > 0 ? filteredData.map(item => (
              <div key={item.equip_id} onClick={() => onSelect(item)} className="group cursor-pointer flex flex-col bg-transparent">
                <div className="relative aspect-video bg-gray-100 border border-gray-200 overflow-hidden mb-2">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">{item.image_url || "📦"}</div>
                  {item.badge && <span className="absolute top-2 left-2 px-2 py-1 text-xs font-bold text-white bg-yellow-600 uppercase shadow-sm">{item.badge}</span>}
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-base text-slate-900 leading-snug mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{item.instructor ? item.instructor.name : '관리자'}</p>
                  <div className="mb-1"><StarRating rating={item.rating || 0} count={item.review_count || 0} /></div>
                  <div className="mt-auto pt-1 flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-900">무료 대여</div>
                    <span className={`text-xs font-bold ${item.available_qty > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.available_qty > 0 ? `잔여 ${item.available_qty}개` : '일시품절'}</span>
                  </div>
                </div>
              </div>
            )) : <div className="col-span-full text-center text-gray-500">등록된 장비가 없습니다.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}