"use client";
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiRefreshCw } from 'react-icons/fi';

// Dummy data
const hospitals = [
  { id: 1, name: "Jupiter,Baner", urgency: 5, requiredMasks: 15, location: { lon: 73.7858398, lat: 18.5661095 } },
  { id: 2, name: "Sahyadri,Yerawada", urgency: 5, requiredMasks: 15, location: { lon: 73.8971383, lat: 18.5543086 } },
  { id: 3, name: "Joglekar,Shivajinagar", urgency: 5, requiredMasks: 15, location: { lon: 73.8336359, lat: 18.5327524 } },
  { id: 4, name: "Sathe,Kothrud", urgency: 5, requiredMasks: 15, location: { lon: 73.8037337, lat: 18.5067869 } },
  { id: 5, name: "Golden Care,PCMC", urgency: 5, requiredMasks: 15, location: { lon: 73.7476511, lat: 18.6020756 } },
];

const vendors = [
  { id: 1, name: "IISER", availableMasks: 20, location: { lon: 73.8094712, lat: 18.5498538 } },
  { id: 2, name: "Phinix Elina", availableMasks: 20, location: { lon: 73.7419084, lat: 18.5565341 } },
  { id: 3, name: "Gopal Highschool", availableMasks: 30, location: { lon: 73.8515638, lat: 18.5105005 } }
];

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulating initial data fetch
    setRequests(hospitals);
  }, []);

  const handleGetVendors = () => {
    // Simulating API call to fetch vendors
    setAvailableVendors(vendors);
  };

  const handleRunAllocation = () => {
    setLoading(true);
    // Simulating API call to allocation algorithm
    setTimeout(() => {
      const result = [
        {
          'hospital_id': 1,
          'allocations': [{'vendor_id': 1, 'amount': 15, 'distance': 0.028682587896665106}],
          'total_allocated': 15,
          'status': 'fulfilled'
        },
        {
          'hospital_id': 2,
          'allocations': [
            {'vendor_id': 1, 'amount': 5, 'distance': 0.08778021226591029},
            {'vendor_id': 2, 'amount': 5, 'distance': 0.1552458524542875}
          ],
          'total_allocated': 10,
          'status': 'fulfilled'
        }
      ];
      setAllocation(result);
      setLoading(false);
    }, 1000);
  };
  


  // Helper function to calculate straight-line distance
  function calculateStraightLineDistance(start, end) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = start.lat * Math.PI / 180;
    const φ2 = end.lat * Math.PI / 180;
    const Δφ = (end.lat - start.lat) * Math.PI / 180;
    const Δλ = (end.lon - start.lon) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  const handleRefreshRequests = () => {
    // Simulating API call to fetch new requests
    setTimeout(() => {
      const newRequests = hospitals.map(hospital => ({
        ...hospital,
        requiredMasks: Math.floor(Math.random() * 20) + 10, // Random number between 10 and 29
        urgency: Math.floor(Math.random() * 5) + 1, // Random number between 1 and 5
      }));
      setRequests(newRequests);
      setLoading(false);
    }, 1000);
  };

  function updateMap(map, distribution) {
    // Clear existing layers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const vendorIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    const hospitalIcon = L.icon({
      iconUrl: 'icons8-pharmacy-ios-17-glyph\\icons8-pharmacy-30.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    hospitals.forEach(hospital => {
      L.marker([hospital.location.lat, hospital.location.lon], {icon: L.divIcon({className: 'bg-red-500 w-3 h-3 rounded-full'})})
        .addTo(map)
        .bindPopup(`Hospital ${hospital.id} <br> Urgency: ${hospital.urgency} <br> Required Masks: ${hospital.requiredMasks}`);
    });

    vendors.forEach(vendor => {
      L.marker([vendor.location.lat, vendor.location.lon], { icon: L.divIcon({className: 'bg-blue-500 w-3 h-3 rounded-full'}) })
        .addTo(map)
        .bindPopup(`Vendor ${vendor.id} <br> Available Masks: ${vendor.availableMasks}`);
    });

    distribution.forEach(d => {
      const hospital = hospitals.find(h => h.id === d.hospital_id);
      d.allocations.forEach(allocation => {
        if (allocation.amount > 0) {
          const vendor = vendors.find(v => v.id === allocation.vendor_id);
          const routeCoordinates = allocation.geometry || [
            [hospital.location.lat, hospital.location.lon],
            [vendor.location.lat, vendor.location.lon]
          ];
          L.polyline(routeCoordinates, { color: 'blue', weight: 2 })
            .addTo(map)
            .bindPopup(`Allocation: ${allocation.amount} masks<br>Distance: ${(allocation.distance * 111.32).toFixed(2)} km`);
        }
      });
    });
  }

  function MapUpdater({ allocation }) {
    const map = useMap();

    useEffect(() => {
      if (allocation?.length > 0) {
        updateMap(map, allocation);
      }
    }, [map, allocation]);

    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Pandemic Resource Allocation</h1>

      <div className="mb-8 bg-white rounded-lg shadow-md p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Hospital Requests</h2>
        <button
          className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleRefreshRequests}
          disabled={loading}
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b p-2 text-left">ID</th>
                <th className="border-b p-2 text-left">Name</th>
                <th className="border-b p-2 text-left">Urgency</th>
                <th className="border-b p-2 text-left">Required Masks</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(hospital => (
                <tr key={hospital.id} className="hover:bg-gray-50">
                  <td className="border-b p-2">{hospital.id}</td>
                  <td className="border-b p-2">{hospital.name}</td>
                  <td className="border-b p-2">{hospital.urgency}</td>
                  <td className="border-b p-2">{hospital.requiredMasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center mb-8">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleGetVendors}
        >
          Get Vendors
        </button>
      </div>

      {availableVendors.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Available Vendors</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b p-2 text-left">ID</th>
                  <th className="border-b p-2 text-left">Name</th>
                  <th className="border-b p-2 text-left">Available Masks</th>
                </tr>
              </thead>
              <tbody>
                {availableVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="border-b p-2">{vendor.id}</td>
                    <td className="border-b p-2">{vendor.name}</td>
                    <td className="border-b p-2">{vendor.availableMasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-6">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleRunAllocation}
            >
              Run Resource Allocation Engine
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center">
          <p className="text-xl font-bold text-gray-700">Calculating optimal allocation...</p>
        </div>
      )}

      {allocation && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Allocation Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocation.map(item => (
              <div key={item.hospital_id} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800">Hospital ID: {item.hospital_id}</h3>
                <p className="text-gray-600">Total Allocated: {item.total_allocated}</p>
                <p className="text-gray-600">Status: {item.status}</p>
                <h4 className="font-bold mt-2 text-gray-700">Allocations:</h4>
                <ul className="list-disc list-inside">
                  {item.allocations.map((alloc, index) => (
                    <li key={index} className="text-gray-600">
                      Vendor ID: {alloc.vendor_id}, Amount: {alloc.amount}, Distance: {alloc.distance.toFixed(4)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {allocation && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Allocation Map</h2>
          <div style={{ height: '300px' }}>
            <MapContainer center={[18.5204, 73.8567]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapUpdater allocation={allocation} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}