// frontend/pages/business/dashboard.tsx
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useApi } from '../../lib/hooks';
import { useAuthStore } from '../../lib/store';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
  cancellationRate: number;
}

export default function BusinessDashboard() {
  const { call } = useApi();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await call('/business/dashboard/overview', 'GET');
      setStats(response);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-orange-500 rounded-full"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Business Dashboard - Urban Help</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <div className="flex gap-4">
                <Link href="/business/profile">
                  <a className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                    Profile
                  </a>
                </Link>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  Total Bookings
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  Pending
                </h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pendingBookings}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  Confirmed
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.confirmedBookings}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  This Month Revenue
                </h3>
                <p className="text-3xl font-bold text-green-600">
                  ${stats.monthlyRevenue.toFixed(2)}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium mb-2">
                  Rating
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.averageRating.toFixed(1)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ({stats.totalReviews} reviews)
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200 flex">
              {['overview', 'bookings', 'profile', 'services', 'reviews'].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 font-medium border-b-2 transition ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ),
              )}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Revenue Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last 7 Days</span>
                        <span className="font-semibold">Loading...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last 30 Days</span>
                        <span className="font-semibold">Loading...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">All Time</span>
                        <span className="font-semibold">
                          ${stats.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-4">Booking Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending</span>
                        <span className="font-semibold">
                          {stats.pendingBookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmed</span>
                        <span className="font-semibold">
                          {stats.confirmedBookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completed</span>
                        <span className="font-semibold">
                          {stats.completedBookings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Cancellation Rate
                        </span>
                        <span className="font-semibold">
                          {stats.cancellationRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <BookingsTab />
              )}

              {activeTab === 'profile' && (
                <ProfileTab />
              )}

              {activeTab === 'services' && (
                <ServicesTab />
              )}

              {activeTab === 'reviews' && (
                <ReviewsTab stats={stats} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BookingsTab() {
  const { call } = useApi();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      const response = await call('/bookings/business/recent', 'GET');
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded font-medium transition ${
                filter === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-900">
                Customer
              </th>
              <th className="px-6 py-3 font-semibold text-gray-900">
                Service
              </th>
              <th className="px-6 py-3 font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking: any) => (
              <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">{booking.customerName}</td>
                <td className="px-6 py-4">{booking.serviceName}</td>
                <td className="px-6 py-4">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-semibold">
                  ${booking.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/bookings/${booking.id}`}>
                    <a className="text-orange-500 hover:underline font-medium">
                      View
                    </a>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { call } = useApi();
  const [business, setBusiness] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await call('/business/dashboard/profile', 'GET');
      setBusiness(response);
      setFormData(response);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      await call('/business/dashboard/profile', 'PUT', formData);
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!business) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl">
      {!editing ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Business Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {business.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-900">{business.description}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500 h-32"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesTab() {
  const { call } = useApi();
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ service_name: '', hourly_rate: '' });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await call('/business/dashboard/services', 'GET');
      setServices(response.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleAddService = async () => {
    try {
      await call('/business/dashboard/services', 'POST', formData);
      setFormData({ service_name: '', hourly_rate: '' });
      setShowForm(false);
      loadServices();
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
        >
          Add Service
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded mb-6 space-y-4">
          <input
            type="text"
            placeholder="Service name"
            value={formData.service_name}
            onChange={(e) =>
              setFormData({ ...formData, service_name: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
          />
          <input
            type="number"
            placeholder="Hourly rate"
            value={formData.hourly_rate}
            onChange={(e) =>
              setFormData({ ...formData, hourly_rate: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddService}
              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.map((service: any) => (
          <div
            key={service.id}
            className="flex justify-between items-center p-4 border border-gray-200 rounded"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-orange-500">
                ${service.hourlyRate}/hr
              </span>
              <button className="text-red-500 hover:text-red-700 font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-orange-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Average Rating
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            <span className="text-3xl font-bold text-orange-600">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Reviews
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalReviews}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Review Trend
          </h3>
          <p className="text-lg font-semibold text-green-600">Positive ↗</p>
        </div>
      </div>

      <p className="text-gray-600">Recent reviews will appear here.</p>
    </div>
  );
}
