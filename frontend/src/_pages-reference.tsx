// frontend/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// frontend/pages/index.tsx
import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthContext } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuthContext();

  return (
    <>
      <Head>
        <title>Urban Help - Find Trusted Local Tradespeople</title>
      </Head>

      {/* Header */}
      <header className='sticky top-0 bg-primary text-white shadow-md z-50'>
        <div className='max-w-6xl mx-auto px-4 py-4 flex justify-between items-center'>
          <div className='text-2xl font-bold'>Urban Help</div>
          <nav className='space-x-4'>
            {isAuthenticated ? (
              <>
                <span>Hello, {user?.firstName}</span>
                <Link href='/dashboard' className='text-accent'>
                  Dashboard
                </Link>
                <button onClick={() => window.location.href = '/auth/logout'} className='text-accent'>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href='/auth/login' className='hover:text-accent'>
                  Login
                </Link>
                <Link href='/auth/signup' className='bg-accent px-4 py-2 rounded hover:bg-orange-600'>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className='bg-gradient-to-r from-primary to-blue-700 text-white py-20'>
        <div className='max-w-6xl mx-auto px-4 text-center'>
          <h1 className='text-5xl font-bold mb-4'>Need a trusted local tradesperson?</h1>
          <p className='text-xl mb-8'>
            Find verified electricians, plumbers, locksmiths and builders near you.
            Available 24/7 including emergency services.
          </p>
          <div className='space-x-4'>
            <Link
              href='/search'
              className='inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-orange-600 font-semibold'
            >
              Find a Professional
            </Link>
            <Link
              href='/auth/business-register'
              className='inline-block bg-white text-primary px-8 py-3 rounded-lg hover:bg-light font-semibold'
            >
              Join as a Business
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-16 bg-light'>
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center mb-12'>How It Works</h2>
          <div className='grid grid-cols-4 gap-8'>
            {[
              { num: '1', title: 'Search', desc: 'Find nearby professionals' },
              { num: '2', title: 'Request', desc: 'Book your service' },
              { num: '3', title: 'Payment', desc: 'Pay securely online' },
              { num: '4', title: 'Complete', desc: 'Review & rate' },
            ].map((step) => (
              <div key={step.num} className='text-center'>
                <div className='w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4'>
                  {step.num}
                </div>
                <h3 className='font-bold mb-2'>{step.title}</h3>
                <p className='text-gray-600'>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className='bg-primary text-white py-8'>
        <div className='max-w-6xl mx-auto px-4 text-center'>
          <p>&copy; 2026 Urban Help. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

// frontend/pages/auth/login.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from '@/hooks/useForm';
import { useAuthStore } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');

  const form = useForm(
    { email: '', mobile: '', password: '' },
    async (values) => {
      if (loginMethod === 'email') {
        await login(values.email, values.password);
      } else {
        const response = await apiClient.loginWithMobile(values.mobile, values.password);
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      router.push('/search');
    },
  );

  return (
    <>
      <Head>
        <title>Login - Urban Help</title>
      </Head>

      <div className='min-h-screen bg-gradient-to-r from-primary to-blue-700 flex items-center justify-center'>
        <div className='bg-white rounded-lg shadow-xl p-8 w-full max-w-md'>
          <h1 className='text-3xl font-bold text-center mb-8'>Login to Urban Help</h1>

          <div className='flex space-x-4 mb-6'>
            <button
              type='button'
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-2 px-4 rounded ${
                loginMethod === 'email'
                  ? 'bg-primary text-white'
                  : 'bg-light text-primary'
              }`}
            >
              Email
            </button>
            <button
              type='button'
              onClick={() => setLoginMethod('mobile')}
              className={`flex-1 py-2 px-4 rounded ${
                loginMethod === 'mobile'
                  ? 'bg-primary text-white'
                  : 'bg-light text-primary'
              }`}
            >
              Mobile
            </button>
          </div>

          <form onSubmit={form.handleSubmit} className='space-y-4'>
            {loginMethod === 'email' ? (
              <input
                type='email'
                name='email'
                placeholder='Email'
                value={form.values.email}
                onChange={form.handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent'
              />
            ) : (
              <input
                type='tel'
                name='mobile'
                placeholder='Mobile Number'
                value={form.values.mobile}
                onChange={form.handleChange}
                className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent'
              />
            )}

            <input
              type='password'
              name='password'
              placeholder='Password'
              value={form.values.password}
              onChange={form.handleChange}
              className='w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent'
            />

            {form.errors.password && <div className='text-error text-sm'>{form.errors.password}</div>}

            <button
              type='submit'
              disabled={form.isSubmitting}
              className='w-full bg-accent text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50'
            >
              {form.isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className='mt-6 text-center text-sm'>
            <a href='/auth/forgot-password' className='text-accent hover:underline'>
              Forgot Password?
            </a>
          </div>

          <div className='mt-6 text-center text-sm'>
            Don't have an account?{' '}
            <a href='/auth/signup' className='text-accent hover:underline'>
              Sign up here
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/pages/search.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function Search() {
  const [filters, setFilters] = useState({
    serviceType: '',
    suburb: '',
    postcode: '',
    page: 1,
  });

  const { data: results, isLoading } = useQuery(
    ['businesses', filters],
    () => apiClient.searchBusinesses(filters),
    {
      select: (res) => res.data.data,
    },
  );

  return (
    <>
      <Head>
        <title>Find Services - Urban Help</title>
      </Head>

      <div className='min-h-screen bg-light'>
        {/* Search Bar */}
        <div className='bg-primary text-white py-8'>
          <div className='max-w-6xl mx-auto px-4'>
            <h1 className='text-3xl font-bold mb-6'>Find a Professional</h1>
            <div className='grid grid-cols-3 gap-4'>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value, page: 1 })}
                className='px-4 py-2 rounded text-dark'
              >
                <option value=''>All Services</option>
                <option value='electrician'>Electrician</option>
                <option value='plumber'>Plumber</option>
                <option value='builder'>Builder</option>
                <option value='carpenter'>Carpenter</option>
                <option value='locksmith'>Locksmith</option>
                <option value='handyman'>Handyman</option>
              </select>

              <input
                type='text'
                placeholder='Suburb'
                value={filters.suburb}
                onChange={(e) => setFilters({ ...filters, suburb: e.target.value, page: 1 })}
                className='px-4 py-2 rounded text-dark'
              />

              <input
                type='text'
                placeholder='Postcode'
                value={filters.postcode}
                onChange={(e) => setFilters({ ...filters, postcode: e.target.value, page: 1 })}
                className='px-4 py-2 rounded text-dark'
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className='max-w-6xl mx-auto px-4 py-12'>
          {isLoading ? (
            <div className='text-center py-12'>Loading...</div>
          ) : !results?.businesses || results.businesses.length === 0 ? (
            <div className='text-center py-12'>No businesses found. Try adjusting your search.</div>
          ) : (
            <div className='grid grid-cols-2 gap-6'>
              {results.businesses.map((business: any) => (
                <Link key={business.id} href={`/business/${business.id}`}>
                  <div className='bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden'>
                    <div className='h-48 bg-gray-300'>{/* Image placeholder */}</div>
                    <div className='p-4'>
                      <h3 className='text-xl font-bold mb-2'>{business.name}</h3>
                      <p className='text-gray-600 mb-2'>{business.distance || 0} km away</p>
                      <div className='flex justify-between items-center'>
                        <span className='text-accent font-bold'>★ {business.avgRating}</span>
                        <span className='text-gray-600'>({business.totalReviews})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// frontend/pages/business/[id].tsx
import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function BusinessProfile() {
  const router = useRouter();
  const { id } = router.query;

  const { data: business, isLoading } = useQuery(
    ['business', id],
    () => id ? apiClient.getBusinessProfile(id as string) : null,
    {
      enabled: !!id,
      select: (res) => res?.data?.data,
    },
  );

  if (isLoading) return <div className='py-12 text-center'>Loading...</div>;
  if (!business) return <div className='py-12 text-center'>Business not found</div>;

  return (
    <>
      <Head>
        <title>{business.name} - Urban Help</title>
      </Head>

      <div className='min-h-screen bg-light'>
        {/* Header */}
        <div className='bg-primary text-white py-8'>
          <div className='max-w-6xl mx-auto px-4'>
            <Link href='/search' className='text-white hover:text-accent mb-4 inline-block'>
              ← Back to Search
            </Link>
            <h1 className='text-4xl font-bold mb-2'>{business.name}</h1>
            <div className='flex items-center space-x-4'>
              <span className='text-2xl'>★ {business.avgRating}</span>
              <span>({business.totalReviews} reviews)</span>
              {business.isVerified && <span className='bg-accent px-3 py-1 rounded'>✓ Verified</span>}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='max-w-6xl mx-auto px-4 py-12'>
          <div className='grid grid-cols-3 gap-8'>
            <div className='col-span-2'>
              {/* Image Gallery Placeholder */}
              <div className='h-96 bg-gray-300 rounded mb-8'>{/* Images go here */}</div>

              <div className='bg-white rounded-lg p-6 shadow mb-8'>
                <h2 className='text-2xl font-bold mb-4'>About</h2>
                <p className='text-gray-700'>{business.description}</p>
              </div>

              <div className='bg-white rounded-lg p-6 shadow mb-8'>
                <h2 className='text-2xl font-bold mb-4'>Experience & Qualifications</h2>
                <p className='mb-4'><strong>Experience:</strong> {business.experience}</p>
                <p className='mb-4'><strong>Qualifications:</strong> {business.qualifications}</p>
                <p><strong>Licences:</strong> {business.licences}</p>
              </div>

              <div className='bg-white rounded-lg p-6 shadow'>
                <h2 className='text-2xl font-bold mb-4'>Reviews</h2>
                {business.reviews?.map((review: any, idx: number) => (
                  <div key={idx} className='border-t pt-4'>
                    <div className='flex justify-between mb-2'>
                      <span className='text-accent'>★ {review.rating}</span>
                      <span className='text-gray-600 text-sm'>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className='text-gray-700'>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className='bg-white rounded-lg p-6 shadow mb-6'>
                <h3 className='text-xl font-bold mb-4'>Call-Out Fees</h3>
                {business.services?.map((service: any, idx: number) => (
                  <div key={idx} className='mb-4'>
                    <p className='font-semibold text-gray-700'>{service.serviceType}</p>
                    <p className='text-gray-600'>Business Hours: ${service.businessHoursFee}</p>
                    <p className='text-gray-600'>Out of Hours: ${service.outOfHoursFee}</p>
                  </div>
                ))}
              </div>

              <div className='bg-white rounded-lg p-6 shadow mb-6'>
                <h3 className='text-xl font-bold mb-4'>Service Area</h3>
                <p className='text-gray-700'>{business.suburb}, {business.postcode}</p>
                <p className='text-gray-600 text-sm'>Service radius: {business.serviceRadius} km</p>
              </div>

              <Link
                href={`/bookings/new?businessId=${id}`}
                className='w-full block bg-accent text-white text-center py-3 rounded font-bold hover:bg-orange-600'
              >
                Hire Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/styles/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
}

input,
select,
textarea {
  font-family: inherit;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
