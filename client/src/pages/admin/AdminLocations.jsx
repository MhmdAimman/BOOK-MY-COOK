import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/common/Button';

const AdminLocations = () => {
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [cityForm, setCityForm] = useState({ name: '', district: '' });
  const [areaForm, setAreaForm] = useState({ name: '', pincode: '', city_id: '' });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getCities();
      setCities(data.cities);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (cityId) => {
    try {
      const { data } = await adminAPI.getAreas(cityId);
      setAreas(data.areas);
    } catch (err) {
      console.error('Failed to fetch areas:', err);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    fetchAreas(city.id);
  };

  const handleCreateCity = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createCity(cityForm);
      setShowCityModal(false);
      setCityForm({ name: '', district: '' });
      fetchCities();
    } catch (err) {
      console.error('Failed to create city:', err);
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('Are you sure? This will delete all areas in this city.')) return;
    try {
      await adminAPI.deleteCity(cityId);
      setSelectedCity(null);
      setAreas([]);
      fetchCities();
    } catch (err) {
      console.error('Failed to delete city:', err);
    }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createArea({ ...areaForm, city_id: selectedCity.id });
      setShowAreaModal(false);
      setAreaForm({ name: '', pincode: '', city_id: '' });
      fetchAreas(selectedCity.id);
    } catch (err) {
      console.error('Failed to create area:', err);
    }
  };

  const handleDeleteArea = async (areaId) => {
    if (!window.confirm('Are you sure you want to delete this area?')) return;
    try {
      await adminAPI.deleteArea(areaId);
      fetchAreas(selectedCity.id);
    } catch (err) {
      console.error('Failed to delete area:', err);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Location Management</h1>
            <p className="text-gray-500">Manage cities and areas</p>
          </div>
          <Button onClick={() => setShowCityModal(true)}>Add City</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Cities ({cities.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCity?.id === city.id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleCitySelect(city)}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{city.name}</p>
                      <p className="text-sm text-gray-500">{city.district}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCity(city.id);
                      }}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedCity ? `Areas in ${selectedCity.name}` : 'Select a city'}
                </h2>
                {selectedCity && (
                  <Button size="sm" onClick={() => setShowAreaModal(true)}>Add Area</Button>
                )}
              </div>

              {selectedCity ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {areas.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No areas found</p>
                  ) : (
                    areas.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{area.name}</p>
                          <p className="text-sm text-gray-500">{area.pincode}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Select a city to view areas</p>
              )}
            </div>
          </div>
        )}

        {showCityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New City</h3>
              <form onSubmit={handleCreateCity}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
                  <input
                    type="text"
                    value={cityForm.name}
                    onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  <input
                    type="text"
                    value={cityForm.district}
                    onChange={(e) => setCityForm({ ...cityForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create City</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCityModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAreaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Area</h3>
              <form onSubmit={handleCreateArea}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                  <input
                    type="text"
                    value={areaForm.name}
                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={areaForm.pincode}
                    onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Area</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAreaModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLocations;
