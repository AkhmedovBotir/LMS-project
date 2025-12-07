'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';


// Andijan districts
const DISTRICTS = [
  'Andijan shahri',
  'Andijan tumani',
  'Asaka tumani',
  'Baliqchi tumani',
  'Bo\'z tumani',
  'Buloqboshi tumani',
  'Izboskan tumani',
  'Jalaquduq tumani',
  'Marhamat tumani',
  'Oltinko\'l tumani',
  'Paxtaobod tumani',
  'Qo\'rg\'ontepa tumani',
  'Shahrixon tumani',
  'Ulug\'nor tumani',
  'Xo\'jaobod tumani'
];

const statusOptions = {
  banner: [
    { value: 'qo\'yilgan', label: 'Qo\'yilgan' },
    { value: 'olib_tashlangan', label: 'Olib tashlangan' },
    { value: 'yangilangan', label: 'Yangilangan' }
  ],
  reklama: [
    { value: 'o\'rganilmoqda', label: 'O\'rganilmoqda' },
    { value: 'tayyor', label: 'Tayyor' },
    { value: 'cancelled', label: 'Bekor qilindi' }
  ],
  hamkor: [
    { value: 'o\'rganilmoqda', label: 'O\'rganilmoqda' },
    { value: 'hamkor_bo\'ldi', label: 'Hamkor bo\'ldi' },
    { value: 'cancelled', label: 'Bekor qilindi' }
  ]
};

const API_URL = 'http://localhost:5000/api/marketing';

export default function MarketingPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [districts, setDistricts] = useState(DISTRICTS);
  const [filters, setFilters] = useState({
    district: '',
    type: '',
    status: '',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    address: '',
    description: '',
    status: 'active',
    bannerName: '',
    bannerSize: { width: '', height: '' },
    reklamaMavzusi: '',
    joyNomi: '',
    hamkorNomi: '',
    image: null
  });
  const [formError, setFormError] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Map initial view state
  const initialViewState = {
    longitude: 72.3333,
    latitude: 40.7833,
    zoom: 12
  };

  // OpenStreetMap tile style for MapLibre GL
  const osmMapStyle = {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: [
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        attribution: 'В© OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  };

  useEffect(() => {
    fetchMarkers();
  }, [filters]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [72.3333, 40.7833],
        zoom: 12
      });

      map.current.on('load', () => {
        setLoading(false);
      });

      map.current.on('click', (e) => {
        setSelectedLocation({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        });
        setShowModal(true);
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Xarita yuklanmadi. Iltimos, qaytadan urinib ko\'ring.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markers.length) return;

    // Clear existing markers
    const existingMarkers = document.getElementsByClassName('maplibregl-marker');
    while (existingMarkers[0]) {
      existingMarkers[0].remove();
    }

    // Add new markers
    markers.forEach(marker => {
      // Ensure coordinates exist and are valid
      const coordinates = marker.location?.coordinates;
      if (!coordinates || coordinates.length !== 2) return;

      const lng = parseFloat(coordinates[0]);
      const lat = parseFloat(coordinates[1]);
      
      if (isNaN(lng) || isNaN(lat)) return;

      new maplibregl.Marker()
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup().setHTML(`
          <h3>${marker.title || marker.reklamaMavzusi || marker.hamkorNomi}</h3>
          <p>${marker.address}</p>
          <p>${marker.description}</p>
          <p>Holat: ${marker.status}</p>
        `))
        .addTo(map.current);
    });
  }, [markers]);

  const fetchMarkers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = Cookies.get('token');
      if (!token) {
        setError('Avtorizatsiya talab qilinadi');
        return;
      }

      let url = 'http://localhost:5000/api/marketing/markers';
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.district) params.append('district', filters.district);
      if (filters.search) params.append('search', filters.search);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Avtorizatsiya talab qilinadi');
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Server xatosi');
      }

      const data = await response.json();
      if (data.success) {
        // API returns coordinates as [longitude, latitude]
        setMarkers(data.data);
      } else {
        throw new Error(data.message || 'Server xatosi');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setSelectedLocation({ lat, lng });
    setShowModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', Andijan, Uzbekistan'
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Error searching address:', err);
    }
  };

  const handleSelectAddress = (result) => {
    setSelectedLocation({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    });
    setShowModal(true);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate required fields based on type
    if (!formData.type) {
      setError('Turi tanlang');
      return;
    }
    if (!formData.address) {
      setError('Manzil kiriting');
      return;
    }
    if (!selectedLocation) {
      setError('Xaritadan joy tanlang');
      return;
    }
    if (!formData.description) {
      setError('Tavsif kiriting');
      return;
    }
    if (!formData.status) {
      setError('Holatni tanlang');
      return;
    }

    // Type-specific validations
    if (formData.type === 'banner') {
      if (!formData.title) {
        setError('Sarlavha kiriting');
        return;
      }
      if (!formData.bannerName) {
        setError('Banner nomi kiriting');
        return;
      }
      if (!formData.bannerSize?.width || !formData.bannerSize?.height) {
        setError('Banner o\'lchamini kiriting');
        return;
      }
      if (!formData.image) {
        setError('Banner rasmini yuklang');
        return;
      }
    } else if (formData.type === 'reklama') {
      if (!formData.reklamaMavzusi) {
        setError('Reklama mavzusini kiriting');
        return;
      }
      if (!formData.joyNomi) {
        setError('Joy nomini kiriting');
        return;
      }
    } else if (formData.type === 'hamkor') {
      if (!formData.hamkorNomi) {
        setError('Hamkor nomini kiriting');
        return;
      }
      if (!formData.image) {
        setError('Logoni yuklang');
        return;
      }
    }

    try {
      setLoading(true);
      const token = Cookies.get('token');
      if (!token) {
        setError('Avtorizatsiya talab qilinadi');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('lat', selectedLocation.lat);
      formDataToSend.append('lng', selectedLocation.lng);

      if (formData.type === 'banner') {
        formDataToSend.append('title', formData.title);
        formDataToSend.append('bannerName', formData.bannerName);
        formDataToSend.append('bannerSize.width', formData.bannerSize.width);
        formDataToSend.append('bannerSize.height', formData.bannerSize.height);
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
      } else if (formData.type === 'reklama') {
        formDataToSend.append('reklamaMavzusi', formData.reklamaMavzusi);
        formDataToSend.append('joyNomi', formData.joyNomi);
      } else if (formData.type === 'hamkor') {
        formDataToSend.append('hamkorNomi', formData.hamkorNomi);
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
      }

      const response = await fetch('http://localhost:5000/api/marketing/markers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formDataToSend
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Avtorizatsiya talab qilinadi');
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Server xatosi');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Marker muvaffaqiyatli qo\'shildi');
        setShowModal(false);
        setFormData({
          type: '',
          title: '',
          address: '',
          description: '',
          status: 'active',
          bannerName: '',
          bannerSize: { width: '', height: '' },
          reklamaMavzusi: '',
          joyNomi: '',
          hamkorNomi: '',
          image: null
        });
        setSelectedLocation(null);
        setImagePreview(null);
        fetchMarkers();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(data.message || 'Server xatosi');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMarkers = markers.filter(marker => {
    return (
      (!filters.district || marker.district === filters.district) &&
      (!filters.type || marker.type === filters.type) &&
      (!filters.status || marker.status === filters.status) &&
      (!filters.search || 
        marker.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        marker.address?.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  // Snackbar close
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Get marker by ID
  const getMarkerById = async (id) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch(`http://localhost:5000/api/marketing/markers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server javobi JSON formatida emas');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiya talab qilinadi');
        } else if (response.status === 404) {
          throw new Error('Marker topilmadi');
        } else {
          throw new Error(data.message || 'Xatolik yuz berdi');
        }
      }

      return data.data;
    } catch (err) {
      console.error('Error fetching marker:', err);
      throw err;
    }
  };

  // Update marker
  const updateMarker = async (id, formData) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch(`http://localhost:5000/api/marketing/markers/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server javobi JSON formatida emas');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiya talab qilinadi');
        } else if (response.status === 404) {
          throw new Error('Marker topilmadi');
        } else {
          throw new Error(data.message || 'Xatolik yuz berdi');
        }
      }

      return data.data;
    } catch (err) {
      console.error('Error updating marker:', err);
      throw err;
    }
  };

  // Delete marker
  const deleteMarker = async (id) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch(`http://localhost:5000/api/marketing/markers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server javobi JSON formatida emas');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiya talab qilinadi');
        } else if (response.status === 404) {
          throw new Error('Marker topilmadi');
        } else {
          throw new Error(data.message || 'Xatolik yuz berdi');
        }
      }

      return data;
    } catch (err) {
      console.error('Error deleting marker:', err);
      throw err;
    }
  };

  // Get marketing statistics
  const getMarketingStats = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('Avtorizatsiya talab qilinadi');
      }

      const response = await fetch('http://localhost:5000/api/marketing/statistics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Server javobi JSON formatida emas');
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Avtorizatsiya talab qilinadi');
        } else {
          throw new Error(data.message || 'Xatolik yuz berdi');
        }
      }

      return data.data;
    } catch (err) {
      console.error('Error fetching statistics:', err);
      throw err;
    }
  };

  // Handle marker update
  const handleUpdateMarker = async (id) => {
    try {
      setFormError(null);
      const formDataToSend = new FormData();
      
      // Asosiy maydonlar
      formDataToSend.append('type', formData.type);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('lat', selectedLocation.lat);
      formDataToSend.append('lng', selectedLocation.lng);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);

      // Banner uchun qo'shimcha maydonlar
      if (formData.type === 'banner') {
        formDataToSend.append('title', formData.title);
        formDataToSend.append('bannerName', formData.bannerName);
        formDataToSend.append('bannerSize[width]', formData.bannerSize.width);
        formDataToSend.append('bannerSize[height]', formData.bannerSize.height);
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
      }

      // Reklama uchun qo'shimcha maydonlar
      if (formData.type === 'reklama') {
        formDataToSend.append('reklamaMavzusi', formData.reklamaMavzusi);
        formDataToSend.append('joyNomi', formData.joyNomi);
      }

      // Hamkor uchun qo'shimcha maydonlar
      if (formData.type === 'hamkor') {
        formDataToSend.append('hamkorNomi', formData.hamkorNomi);
        if (formData.image) {
          formDataToSend.append('image', formData.image);
        }
      }

      await updateMarker(id, formDataToSend);
      setShowModal(false);
      fetchMarkers();
    } catch (err) {
      setFormError(err.message || 'Xatolik yuz berdi');
    }
  };

  // Handle marker delete
  const handleDeleteMarker = async (id) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        setError('Avtorizatsiya talab qilinadi');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/marketing/markers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMarkers(markers.filter(marker => marker._id !== id));
        setShowDeleteModal(false);
        setShowViewModal(false);
        setSelectedMarker(null);
        setSnackbar({
          open: true,
          message: 'Marker muvaffaqiyatli o\'chirildi',
          severity: 'success'
        });
      } else {
        throw new Error('Markerni o\'chirishda xatolik yuz berdi');
      }
    } catch (error) {
      setError(error.message);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  // Handle edit marker
  const handleEditMarker = (marker) => {
    setSelectedMarker(marker);
    setFormData({
      type: marker.type,
      status: marker.status,
      address: marker.address,
      description: marker.description,
      bannerName: marker.bannerName || '',
      bannerSize: marker.bannerSize || '',
      reklamaMavzusi: marker.reklamaMavzusi || '',
      reklamaTuri: marker.reklamaTuri || '',
      hamkorNomi: marker.hamkorNomi || '',
      hamkorFaoliyati: marker.hamkorFaoliyati || '',
      image: null
    });
    setShowModal(true);
    setShowViewModal(false);
    setShowDeleteModal(false);
  };

  // Function to get marker color based on type and status
  const getMarkerColor = (type, status) => {
    // Marker turiga qarab asosiy rang
    const baseColor = type === 'banner' ? '#22c55e' : // yashil
                     type === 'reklama' ? '#eab308' : // sariq
                     '#3b82f6'; // ko'k

    // Statusga qarab opacity
    const opacity = status === 'active' || status === 'qo\'yilgan' || status === 'tayyor' || status === 'hamkor_bo\'ldi' ? '1' :
                   status === 'pending' || status === 'o\'rganilmoqda' ? '0.7' :
                   '0.4';

    return `${baseColor}${Math.round(parseFloat(opacity) * 255).toString(16).padStart(2, '0')}`;
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewDetails = (marker) => {
    setSelectedMarker(marker);
    setShowViewModal(true);
    setShowModal(false);
    setShowDeleteModal(false);
  };

  const handleMarkerClick = (marker) => {
    console.log('Marker clicked:', marker);
    // Marker ma'lumotlarini to'g'ri formatda olish
    const markerData = {
      ...marker,
      image: marker.type === 'banner' && marker.bannerImage 
        ? `http://localhost:5000/${marker.bannerImage}`
        : marker.type === 'reklama' && marker.reklamaImage
        ? `http://localhost:5000/${marker.reklamaImage}`
        : marker.type === 'hamkor' && marker.hamkorImage
        ? `http://localhost:5000/${marker.hamkorImage}`
        : null
    };
    setSelectedMarker(markerData);
    setShowViewModal(true);
  };

  const handleAddNewMarker = () => {
    setShowModal(true);
    setPopupInfo(null);
    setFormData({
      type: '',
      title: '',
      address: '',
      description: '',
      status: 'active',
      bannerName: '',
      bannerSize: { width: '', height: '' },
      reklamaMavzusi: '',
      joyNomi: '',
      hamkorNomi: '',
      image: null
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={`text-lg font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>Marketing</h1>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
            >
              <option value="">Barcha turlar</option>
              <option value="banner">Banner</option>
              <option value="reklama">Reklama</option>
              <option value="hamkor">Hamkor</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
            >
              <option value="">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="pending">Kutilmoqda</option>
              <option value="inactive">Nofaol</option>
            </select>
          </div>


        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200" style={{ height: 600 }}>
        {error ? (
          <div className="h-full flex items-center justify-center bg-red-50">
            <p className="text-red-600">{error}</p>
          </div>
        ) : loading ? (
          <div className="h-full flex items-center justify-center">
            <p className={`${isDarkMode ? 'text-white' : 'text-gray-500'}`}>Xarita yuklanmoqda...</p>
          </div>
        ) : (
          <Map
            initialViewState={initialViewState}
            style={{ width: '100%', height: '100%' }}
            mapStyle={osmMapStyle}
            onClick={e => {
              setSelectedLocation({
                lat: e.lngLat.lat,
                lng: e.lngLat.lng
              });
              setShowModal(true);
            }}
          >
            <NavigationControl position="top-right" />
            {markers.map((marker) => (
              <Marker
                key={marker._id}
                longitude={parseFloat(marker.location?.coordinates?.[0]) || 0}
                latitude={parseFloat(marker.location?.coordinates?.[1]) || 0}
                onClick={() => handleMarkerClick(marker)}
              >
                <div className="cursor-pointer">
                  <svg
                    width="24"
                    height="36"
                    viewBox="0 0 24 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 0C5.383 0 0 5.383 0 12C0 18.617 12 36 12 36C12 36 24 18.617 24 12C24 5.383 18.617 0 12 0ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z"
                      fill={getMarkerColor(marker.type, marker.status)}
                    />
                  </svg>
                </div>
              </Marker>
            ))}
            {popupInfo && (
              <Popup
                longitude={parseFloat(popupInfo.location?.coordinates?.[0]) || 0}
                latitude={parseFloat(popupInfo.location?.coordinates?.[1]) || 0}
                anchor="bottom"
                onClose={() => setPopupInfo(null)}
                className="custom-popup"
              >
                <div className={`p-4 rounded-lg shadow-lg max-w-sm ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">
                      {popupInfo.type === 'banner' ? popupInfo.bannerName : 
                       popupInfo.type === 'reklama' ? popupInfo.reklamaMavzusi :
                       popupInfo.type === 'hamkor' ? popupInfo.hamkorNomi : popupInfo.title}
                    </h3>
                    <button
                      onClick={() => setPopupInfo(null)}
                      className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      вњ•
                    </button>
                  </div>
                  {popupInfo.image && (
                    <div className="mb-3">
                      <img
                        src={popupInfo.image}
                        alt="Location"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Manzil:</span> {popupInfo.address}
                    </p>
                    {popupInfo.joyNomi && (
                      <p className="text-sm">
                        <span className="font-medium">Joy nomi:</span> {popupInfo.joyNomi}
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="font-medium">Tavsif:</span> {popupInfo.description}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Holat:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        popupInfo.status === 'active' ? 'bg-green-100 text-green-800' :
                        popupInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {statusOptions[popupInfo.status]}
                      </span>
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditMarker(popupInfo)}
                      className="flex-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleViewDetails(popupInfo)}
                      className="flex-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      Batafsil
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bu markerni o\'chirishni xohlaysizmi?')) {
                          handleDeleteMarker(popupInfo._id);
                        }
                      }}
                      className="flex-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </Popup>
            )}
            {selectedLocation && (
              <Marker
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
                color="#ef4444"
                anchor="bottom"
              />
            )}
          </Map>
        )}
      </div>

      {/* Modal */}
      {showModal && !showViewModal && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[80]">
          <div className={`p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Yangi marker</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setImagePreview(null);
                }}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                вњ•
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Turi *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                >
                  <option value="">Tanlang</option>
                  <option value="banner">Banner</option>
                  <option value="reklama">Reklama</option>
                  <option value="hamkor">Hamkor</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Manzil *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                />
              </div>

              {formData.type === 'banner' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Sarlavha *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Banner nomi *
                    </label>
                    <input
                      type="text"
                      value={formData.bannerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bannerName: e.target.value }))}
                      required
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        Kenglik *
                      </label>
                      <input
                        type="number"
                        value={formData.bannerSize.width}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bannerSize: { ...prev.bannerSize, width: e.target.value }
                        }))}
                        required
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        Balandlik *
                      </label>
                      <input
                        type="number"
                        value={formData.bannerSize.height}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          bannerSize: { ...prev.bannerSize, height: e.target.value }
                        }))}
                        required
                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Banner rasmi
                    </label>
                    {!imagePreview && !formData.bannerImage && (
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="banner-image-upload"
                        />
                        <label
                          htmlFor="banner-image-upload"
                          className="cursor-pointer block"
                        >
                          <div className="space-y-2">
                            <div className={`text-4xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>рџ“·</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Rasm yuklash uchun bosing yoki surib tashlang
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              PNG, JPG, GIF (max 10MB)
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, bannerImage: null }));
                          }}
                          className={`absolute top-2 right-2 p-1 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
                        >
                          вњ•
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {formData.type === 'reklama' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Reklama mavzusi *
                    </label>
                    <input
                      type="text"
                      value={formData.reklamaMavzusi}
                      onChange={(e) => setFormData(prev => ({ ...prev, reklamaMavzusi: e.target.value }))}
                      required
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Joy nomi *
                    </label>
                    <input
                      type="text"
                      value={formData.joyNomi}
                      onChange={(e) => setFormData(prev => ({ ...prev, joyNomi: e.target.value }))}
                      required
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    />
                  </div>
                </>
              )}

              {formData.type === 'hamkor' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Hamkor nomi *
                    </label>
                    <input
                      type="text"
                      name="hamkorNomi"
                      value={formData.hamkorNomi}
                      onChange={handleInputChange}
                      required
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Logo *
                    </label>
                    {!imagePreview && !formData.image && (
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="logo-upload"
                          required
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer block"
                        >
                          <div className="space-y-2">
                            <div className={`text-4xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>рџ“·</div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Logo yuklash uchun bosing yoki surib tashlang
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              PNG, JPG, GIF (max 10MB)
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className={`absolute top-2 right-2 p-1 rounded-full ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
                        >
                          вњ•
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Tavsif *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                  rows={3}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Holat *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  required
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
                >
                  <option value="">Tanlang</option>
                  {formData.type === 'banner' && (
                    <>
                      <option value="qo'yilgan">Qo'yilgan</option>
                      <option value="olib_tashlangan">Olib tashlangan</option>
                      <option value="yangilangan">Yangilangan</option>
                    </>
                  )}
                  {formData.type === 'reklama' && (
                    <>
                      <option value="o'rganilmoqda">O'rganilmoqda</option>
                      <option value="tayyor">Tayyor</option>
                      <option value="cancelled">Bekor qilingan</option>
                    </>
                  )}
                  {formData.type === 'hamkor' && (
                    <>
                      <option value="o'rganilmoqda">O'rganilmoqda</option>
                      <option value="hamkor_bo'ldi">Hamkor bo'ldi</option>
                      <option value="cancelled">Bekor qilingan</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-50'}`}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedMarker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                Marker ma'lumotlari
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMarker(null);
                }}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                вњ•
              </button>
            </div>

            <div className="space-y-4">
              {selectedMarker.bannerImage && (
                <div>
                  <img 
                    src={`http://localhost:5000/${selectedMarker.bannerImage}`}
                    alt={selectedMarker.title || selectedMarker.reklamaMavzusi || selectedMarker.hamkorNomi}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Turi</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {selectedMarker.type === 'banner' ? 'Banner' :
                     selectedMarker.type === 'reklama' ? 'Reklama' :
                     'Hamkor'}
                  </p>
                </div>

                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Holat</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.status}</p>
                </div>

                <div className="col-span-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manzil</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.address}</p>
                </div>

                {selectedMarker.type === 'banner' && (
                  <>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sarlavha</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.title}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Banner nomi</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.bannerName}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Banner o'lchami</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        {selectedMarker.bannerSize?.width && selectedMarker.bannerSize?.height 
                          ? `${selectedMarker.bannerSize.width} x ${selectedMarker.bannerSize.height} sm`
                          : 'O\'lcham kiritilmagan'}
                      </p>
                    </div>
                  </>
                )}

                {selectedMarker.type === 'reklama' && (
                  <>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Reklama mavzusi</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.reklamaMavzusi}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joy nomi</p>
                      <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.joyNomi}</p>
                    </div>
                  </>
                )}

                {selectedMarker.type === 'hamkor' && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hamkor nomi</p>
                    <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.hamkorNomi}</p>
                  </div>
                )}

                <div className="col-span-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tavsif</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{selectedMarker.description}</p>
                </div>

                <div className="col-span-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yaratilgan vaqti</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {new Date(selectedMarker.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Oxirgi o'zgarish</p>
                  <p className={`text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {new Date(selectedMarker.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* O'chirish tasdiqlash modali */}
      {showDeleteModal && selectedMarker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Markerni o'chirish</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                вњ•
              </button>
            </div>

            <p className="mb-6">
              <span className="font-medium">
                {selectedMarker.type === 'banner' ? selectedMarker.bannerName : 
                 selectedMarker.type === 'reklama' ? selectedMarker.reklamaMavzusi :
                 selectedMarker.type === 'hamkor' ? selectedMarker.hamkorNomi : selectedMarker.title}
              </span>
              {' '}markerini o'chirishni xohlaysizmi?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDeleteMarker(selectedMarker._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ko'rish modali */}
      {showViewModal && selectedMarker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[90]">
          <div className={`p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Marker ma'lumotlari</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMarker(null);
                }}
                className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                вњ•
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Turi</h3>
                <p className="capitalize">{selectedMarker.type}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Holat</h3>
                <p className="capitalize">{selectedMarker.status}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Manzil</h3>
                <p>{selectedMarker.address}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Tavsif</h3>
                <p>{selectedMarker.description}</p>
              </div>

              {selectedMarker.type === 'banner' && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Banner nomi</h3>
                    <p>{selectedMarker.bannerName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Banner o'lchami</h3>
                    <p>
                      {selectedMarker.bannerSize?.width && selectedMarker.bannerSize?.height 
                        ? `${selectedMarker.bannerSize.width} x ${selectedMarker.bannerSize.height} sm`
                        : 'O\'lcham kiritilmagan'}
                    </p>
                  </div>
                </>
              )}

              {selectedMarker.type === 'reklama' && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Reklama mavzusi</h3>
                    <p>{selectedMarker.reklamaMavzusi}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Reklama turi</h3>
                    <p>{selectedMarker.reklamaTuri}</p>
                  </div>
                </>
              )}

              {selectedMarker.type === 'hamkor' && (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Hamkor nomi</h3>
                    <p>{selectedMarker.hamkorNomi}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Hamkor faoliyati</h3>
                    <p>{selectedMarker.hamkorFaoliyati}</p>
                  </div>
                </>
              )}

              {selectedMarker.bannerImage && (
                <div>
                  <h3 className="font-medium mb-2">Rasm</h3>
                  <img 
                    src={`http://localhost:5000/${selectedMarker.bannerImage}`}
                    alt="Banner" 
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMarker(null);
                  handleEditMarker(selectedMarker);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Tahrirlash
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50">
          {success}
        </div>
      )}
    </div>
  );
}