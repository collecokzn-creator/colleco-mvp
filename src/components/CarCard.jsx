import React from 'react';

export default function CarCard({ car, onSelect }){
  if(!car) return null;
  return (
    <div className="border rounded shadow-sm overflow-hidden flex flex-col md:flex-row">
      <img src={car.image || '/assets/icons/car.svg'} alt={`${car.make} ${car.model}`} className="w-full md:w-40 h-40 object-cover" />
      <div className="p-3 flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold">{car.make} {car.model}</h3>
          <div className="text-lg font-bold">{car.pricePerDay} ZAR/day</div>
        </div>
  <p className="text-sm text-gray-600">{car.vehicleType} • {car.transmission ? `${car.transmission} • ` : ''}{car.seats} seats • {car.location}</p>
        <p className="mt-2 text-sm text-gray-700">{car.description}</p>
        <div className="mt-3">
          <button onClick={()=>onSelect && onSelect(car)} className="px-3 py-1 bg-blue-600 text-white rounded">Select</button>
        </div>
      </div>
    </div>
  );
}
