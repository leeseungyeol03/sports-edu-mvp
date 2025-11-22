import React from 'react';
import { LogOut } from 'lucide-react';

export default function MyRentals({ rentals, onCancel, onViewClassroom }) {
  return (
    <div className="bg-slate-900 min-h-[40vh] text-white pt-12 pb-8">
       <div className="container mx-auto px-4">
           <h1 className="text-4xl font-bold mb-8">내 학습 (대여 현황)</h1>
           <div className="mt-12">
               <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">신청 내역</h2>
               {rentals.length === 0 ? (
                   <div className="text-gray-400 py-8">아직 신청한 장비가 없습니다.</div>
               ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {rentals.map(rental => (
                           <div key={rental.rental_id} className="bg-white text-slate-900 rounded-lg overflow-hidden shadow-lg border border-gray-200">
                               <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl border-b">
                                   {rental.equipment?.image_url || "📦"}
                               </div>
                               <div className="p-4">
                                   <h3 className="font-bold text-lg mb-1 truncate">{rental.equipment?.name || "장비 정보 없음"}</h3>
                                   <p className="text-xs text-gray-500 mb-4">{rental.status}</p>
                                   <div className="flex gap-2">
                                       <button 
                                        onClick={() => onViewClassroom(rental.rental_id)} 
                                        className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold hover:bg-slate-800"
                                        disabled={rental.status !== 'APPROVED'} // Disable if not approved
                                       >
                                        강의실 이동
                                       </button>
                                       <button onClick={()=>onCancel(rental.rental_id)} className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-sm"><LogOut size={16} /></button>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>
       </div>
    </div>
  );
}