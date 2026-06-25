// frontend/pages/search.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApi } from '../lib/hooks';
import Head from 'next/head';

interface Business {
  id: string;
  name: string;
  description: string;
  averageRating: number;
  totalReviews: number;
  serviceRadiusKm: number;
  imageUrl: string;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Business[]>([]);
  const { call } = useApi();

  const serviceTypes = [
    { id: 'all', name: 'All Services' },
    { id: 'plumbing', name: 'Plumbing' },
    { id: 'electrical', name: 'Electrical' },
    { id: 'carpentry', name: 'Carpentry' },
    { id: 'cleaning', name: 'Cleaning' },
    { id: 'gardening', name: 'Gardening' },
    { id: 'painting', name: 'Painting' },
  ];

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await call('/search/businesses', 'GET', {
        query: searchQuery,
        service: serviceType !== 'all' ? serviceType : undefined,
        location: location || undefined,
      });
      setResults(response.businesses || []);
      setFilteredResults(response.businesses || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setFilteredResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleSortChange = (sortBy: string) => {
    let sorted = [...filteredResults];
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'reviews':
        sorted.sort((a, b) => b.totalReviews - a.totalReviews);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    setFilteredResults(sorted);
  };

  return (
    <>
      <Head>
        <title>Search Services - Urban Help</title>
        <meta name="description" content="Find trusted service providers in your area" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-8">Find Services Near You</h1>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search service or business name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-3 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                />

                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="px-4 py-3 rounded bg-white text-gray-900 focus:outline-none"
                >
                  {serviceTypes.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Location or postcode"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-4 py-3 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded transition"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {results.length > 0 && (
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-700">
                Found <span className="font-bold">{results.length}</span> results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSortChange('rating')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  Sort by Rating
                </button>
                <button
                  onClick={() => handleSortChange('reviews')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  Most Reviewed
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-500 rounded-full"></div>
              </div>
            </div>
          )}

          {!loading && filteredResults.length === 0 && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery ? 'No results found. Try a different search.' : 'Enter a search query to get started.'}
              </p>
            </div>
          )}

          {/* Business Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((business) => (
              <Link key={business.id} href={`/business/${business.id}`}>
                <a className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    {business.imageUrl && (
                      <img
                        src={business.imageUrl}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {business.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {business.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold">
                          {business.averageRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({business.totalReviews})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {business.serviceRadiusKm} km radius
                      </span>
                    </div>

                    <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition">
                      View Profile
                    </button>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/pages/business/[id].tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useApi } from '../../lib/hooks';
import { useAuthStore } from '../../lib/store';

interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  experience: string;
  qualifications: string;
  licences: string;
  website: string;
  serviceRadiusKm: number;
  averageRating: number;
  totalReviews: number;
  approvalStatus: string;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  rate: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const { call } = useApi();
  const { user } = useAuthStore();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadBusinessDetails();
    }
  }, [id]);

  const loadBusinessDetails = async () => {
    try {
      setLoading(true);
      const [businessRes, servicesRes, reviewsRes] = await Promise.all([
        call(`/search/businesses/${id}`, 'GET'),
        call(`/businesses/${id}/services`, 'GET'),
        call(`/reviews/business/${id}`, 'GET'),
      ]);

      setBusiness(businessRes);
      setServices(servicesRes.services || []);
      setReviews(reviewsRes.reviews || []);
    } catch (error) {
      console.error('Failed to load business:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!business) {
    return <div className="flex items-center justify-center h-screen">Business not found</div>;
  }

  return (
    <>
      <Head>
        <title>{business.name} - Urban Help</title>
        <meta name="description" content={business.description} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-bold">{business.averageRating}</span>
                <span>({business.totalReviews} reviews)</span>
              </div>
              <span className="text-blue-200">•</span>
              <span>Serves {business.serviceRadiusKm} km radius</span>
            </div>
            <p className="text-blue-100">{business.description}</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* About Section */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">About</h2>
                <div className="space-y-4">
                  {business.experience && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Experience</h3>
                      <p className="text-gray-600">{business.experience}</p>
                    </div>
                  )}
                  {business.qualifications && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Qualifications</h3>
                      <p className="text-gray-600">{business.qualifications}</p>
                    </div>
                  )}
                  {business.licences && (
                    <div>
                      <h3 className="font-semibold text-gray-900">Licences</h3>
                      <p className="text-gray-600">{business.licences}</p>
                    </div>
                  )}
                  {business.website && (
                    <div>
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline"
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Services</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {service.name}
                        </h3>
                      </div>
                      <span className="text-lg font-bold text-orange-500">
                        ${service.rate}/hr
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Reviews ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-200 pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{review.customerName}</h3>
                          <span className="text-yellow-500">
                            {'⭐'.repeat(review.rating)}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {review.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {review.comment}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-2xl font-bold mb-4">Request a Booking</h3>

                {user ? (
                  <>
                    <div className="space-y-4">
                      <select
                        value={selectedService?.id || ''}
                        onChange={(e) => {
                          const service = services.find(
                            (s) => s.id === e.target.value,
                          );
                          setSelectedService(service || null);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - ${service.rate}/hr
                          </option>
                        ))}
                      </select>

                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                      />

                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                        defaultValue="1"
                      >
                        <option value="1">1 hour</option>
                        <option value="2">2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                        <option value="5">5+ hours</option>
                      </select>

                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition">
                        Request Booking
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Please log in to request a booking
                    </p>
                    <a
                      href="/auth/login"
                      className="w-full block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded transition text-center"
                    >
                      Log In
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
