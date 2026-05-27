import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import ItemCard from '../components/ItemCard';
import { listItems, reportStatus, type ApiItem } from '../lib/api';

// Fix Leaflet default icon issue in React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

interface BrowseItemsProps {
  onClaimItem: (item: { id: string; name: string; suburb: string }) => void;
}

const BrowseItems: React.FC<BrowseItemsProps> = ({ onClaimItem }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [itemStatuses, setItemStatuses] = useState<
    Record<string, { status: string; icon: string; time: string; color: string }>
  >({});
  const [openReportIndex, setOpenReportIndex] = useState<number | null>(null);
  const [filterSuburb, setFilterSuburb] = useState('');

  // load items from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listItems(filterSuburb || undefined)
      .then((data) => {
        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('listItems error', e);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filterSuburb]);

  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const scrollToCard = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleStatusReport = async (
    index: number,
    itemId: string,
    status: string,
    icon: string,
    color: string,
  ) => {
    try {
      await reportStatus(itemId, status);
    } catch (e) {
      console.warn('reportStatus failed (continuing UI update)', e);
    }
    setItemStatuses((prev) => ({
      ...prev,
      [itemId]: { status, icon, time: 'just now', color },
    }));
    setOpenReportIndex(null);
  };

  const toggleReportPanel = (index: number) => {
    setOpenReportIndex(openReportIndex === index ? null : index);
  };

  const itemsWithCoords = items.filter(
    (i) => typeof i.lat === 'number' && typeof i.lng === 'number',
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full bg-white border-b-2 border-furni-green py-3 px-4 relative">
        <button
          onClick={() => navigate('/role')}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-furni-green hover:text-green-700"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-furni-green text-center">FurniLoop</h2>
      </div>

      <div className="flex-1 py-8 px-4">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-furni-green text-center mb-8">Items Near You</h1>

          {/* Map Section */}
          <div className="mb-6">
            <p className="text-furni-green font-bold text-lg mb-1">📍 Furniture Near You</p>
            <p className="text-sm text-gray-500 italic mb-2">
              Tap a pin to preview the item, then tap Navigate for directions.
            </p>
            <div className="rounded-lg overflow-hidden shadow-md">
              <MapContainer
                center={[-37.8136, 144.9631]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '220px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {itemsWithCoords.map((it, index) => (
                  <Marker
                    key={it.id}
                    position={[it.lat as number, it.lng as number]}
                    eventHandlers={{
                      click: () => {
                        setSelectedItemIndex(index);
                        scrollToCard(index);
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-semibold">{it.name}</p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded mt-1 ${
                            it.condition === 'Good'
                              ? 'bg-green-100 text-green-800'
                              : it.condition === 'Fair'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {it.condition}
                        </span>
                        <button
                          onClick={() => openDirections(it.lat as number, it.lng as number)}
                          className="mt-2 w-full px-3 py-1 bg-furni-green text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          🧭 Navigate
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Suburb Filter */}
          <div className="mb-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Filter by suburb..."
              value={filterSuburb}
              onChange={(e) => setFilterSuburb(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-furni-green"
            />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-furni-green text-center font-medium">
              🏘️ {items.length} {items.length === 1 ? 'item' : 'items'} live from the database — updated by your neighbours
            </p>
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading items…</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No items yet. Be the first to post — go to Give Furniture!
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((it, index) => {
                const status = itemStatuses[it.id] || {
                  status: 'Unconfirmed',
                  icon: '⚠️',
                  time: 'no recent reports',
                  color: 'text-orange-600',
                };
                return (
                  <div
                    key={it.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    className={`transition-all ${
                      selectedItemIndex === index ? 'ring-4 ring-furni-green rounded-lg' : ''
                    }`}
                  >
                    <ItemCard
                      name={it.name}
                      condition={it.condition}
                      suburb={it.suburb}
                      description={it.remarks || 'No description provided.'}
                      onClaim={() => onClaimItem({ id: it.id, name: it.name, suburb: it.suburb })}
                      lat={it.lat ?? undefined}
                      lng={it.lng ?? undefined}
                      isHighlighted={selectedItemIndex === index}
                      communityStatus={status}
                      isReportPanelOpen={openReportIndex === index}
                      onToggleReportPanel={() => toggleReportPanel(index)}
                      onReportStatus={(s, ic, c) => handleStatusReport(index, it.id, s, ic, c)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate('/post')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-furni-green text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 flex items-center justify-center text-xl"
        title="Spot furniture? Report it!"
      >
        📍 +
      </button>
    </div>
  );
};

export default BrowseItems;
