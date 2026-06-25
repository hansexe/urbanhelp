// frontend/pages/legal/privacy.tsx
import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Urban Help</title>
        <meta name="description" content="Urban Help Privacy Policy" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
            <p className="text-blue-100 mt-2">Last updated: June 24, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Urban Help Pty Ltd ("we", "us", "our", or "Company") operates the Urban Help
                website and mobile application (the "Service"). This page informs you of our
                policies regarding the collection, use, and disclosure of personal data when
                you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect several different types of information for various purposes to provide
                and improve our Service to you.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Name and email address</li>
                <li>Phone number</li>
                <li>Business registration details (ABN, banking information)</li>
                <li>Address and geolocation data</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Service booking history</li>
                <li>Customer reviews and ratings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Urban Help uses the collected data for various purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information to improve our Service</li>
                <li>To monitor the usage of our Service</li>
                <li>To detect and prevent fraudulent transactions and other illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
              <p className="text-gray-700 leading-relaxed">
                The security of your data is important to us, but remember that no method of
                transmission over the Internet or method of electronic storage is 100% secure.
                While we strive to use commercially acceptable means to protect your Personal
                Data, we cannot guarantee its absolute security. We implement industry-standard
                security measures including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>SSL/TLS encryption for data in transit</li>
                <li>Bcrypt password hashing</li>
                <li>Server-side encryption for data at rest</li>
                <li>Regular security audits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service does not address anyone under the age of 18. We do not knowingly
                collect personally identifiable information from children under 18. If we become
                aware that a child under 18 has provided us with personal information, we
                immediately delete such information from our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the
                "effective date" at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-900">Email: privacy@urbanhelp.com.au</p>
                <p className="text-gray-900">Address: Sydney, NSW, Australia</p>
              </div>
            </section>
          </div>

          {/* Links */}
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/legal/terms">
              <a className="text-orange-500 hover:underline font-medium">Terms of Service</a>
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/legal/refunds">
              <a className="text-orange-500 hover:underline font-medium">Refund Policy</a>
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/legal/cookies">
              <a className="text-orange-500 hover:underline font-medium">Cookie Policy</a>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/pages/legal/terms.tsx
import Head from 'next/head';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service - Urban Help</title>
        <meta name="description" content="Urban Help Terms of Service" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Terms of Service</h1>
            <p className="text-blue-100 mt-2">Last updated: June 24, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Urban Help, you accept and agree to be bound by and comply
                with the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed">
                Permission is granted to temporarily download one copy of the materials
                (information or software) on Urban Help's website for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a transfer of title,
                and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on Urban Help's website are provided on an 'as is' basis. Urban Help
                makes no warranties, expressed or implied, and hereby disclaims and negates all
                other warranties including, without limitation, implied warranties or conditions
                of merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Urban Help or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on Urban
                Help's website, even if Urban Help or a representative has been notified orally or
                in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Accuracy of Materials</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials appearing on Urban Help's website could include technical,
                typographical, or photographic errors. Urban Help does not warrant that any of
                the materials on its website are accurate, complete, or current. Urban Help may
                make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Urban Help has not reviewed all of the sites linked to its website and is not
                responsible for the contents of any such linked site. The inclusion of any link
                does not imply endorsement by Urban Help of the site. Use of any such linked
                website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                Urban Help may revise these terms of service for its website at any time without
                notice. By using this website, you are agreeing to be bound by the then current
                version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the
                laws of New South Wales, Australia, and you irrevocably submit to the exclusive
                jurisdiction of the courts located in Sydney.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-900">Email: legal@urbanhelp.com.au</p>
                <p className="text-gray-900">Address: Sydney, NSW, Australia</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/pages/legal/refunds.tsx
import Head from 'next/head';

export default function RefundPolicy() {
  return (
    <>
      <Head>
        <title>Refund Policy - Urban Help</title>
        <meta name="description" content="Urban Help Refund Policy" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Refund Policy</h1>
            <p className="text-blue-100 mt-2">Last updated: June 24, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                Refunds are available for cancelled bookings under the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>
                  <strong>More than 24 hours before booking:</strong> Full refund of all amounts
                  paid
                </li>
                <li>
                  <strong>Within 24 hours of booking:</strong> 50% refund (cancellation fee
                  applies)
                </li>
                <li>
                  <strong>On day of booking:</strong> No refund (unless service provider cancels)
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Service Provider Cancellations
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If a service provider cancels a booking at any time, customers receive a full
                refund regardless of timing. Refunds are processed within 3-5 business days to
                the original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. No-Show Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                If a customer is not present at the scheduled booking time:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Service provider will wait 15 minutes and attempt to contact customer</li>
                <li>No refund is issued for customer no-shows</li>
                <li>Service provider receives full payment</li>
                <li>Repeat no-shows may result in account restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Poor Service Quality</h2>
              <p className="text-gray-700 leading-relaxed">
                If the service quality is significantly below expectations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Contact Urban Help within 48 hours of service completion</li>
                <li>Provide detailed description of the issue</li>
                <li>We will investigate and determine refund eligibility</li>
                <li>Partial or full refunds may be issued based on circumstances</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Payment Processing Issues
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you experience issues with payment processing or billing errors:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Contact support immediately with proof of payment</li>
                <li>We will investigate within 24 hours</li>
                <li>Duplicate charges will be refunded in full</li>
                <li>Processing time is 3-5 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. How to Request a Refund</h2>
              <p className="text-gray-700 leading-relaxed">
                To request a refund, follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 mt-4">
                <li>Log into your Urban Help account</li>
                <li>Navigate to "Bookings" and select the booking</li>
                <li>Click "Request Refund" and provide reason</li>
                <li>We will respond within 48 hours</li>
                <li>Approved refunds process within 3-5 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Support</h2>
              <p className="text-gray-700 leading-relaxed">
                For refund inquiries, please contact:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-900">Email: refunds@urbanhelp.com.au</p>
                <p className="text-gray-900">Phone: 1300 123 456</p>
                <p className="text-gray-900">Hours: Monday-Friday, 9am-5pm AEDT</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

// frontend/pages/legal/cookies.tsx
import Head from 'next/head';

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy - Urban Help</title>
        <meta name="description" content="Urban Help Cookie Policy" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold">Cookie Policy</h1>
            <p className="text-blue-100 mt-2">Last updated: June 24, 2026</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are small pieces of data stored on your device (computer, phone, tablet)
                when you visit our website. They help us understand how you use Urban Help and
                improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                  <p className="text-gray-700 mt-1">
                    Required for login, security, and basic site functionality. Cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Performance Cookies</h3>
                  <p className="text-gray-700 mt-1">
                    Help us understand how you interact with our site (page views, click patterns).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Functional Cookies</h3>
                  <p className="text-gray-700 mt-1">
                    Remember your preferences and settings (language, location).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                  <p className="text-gray-700 mt-1">
                    Used to track your interactions for personalized advertising (optional).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookie Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies are retained for varying periods depending on type:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Session cookies: Deleted when you close your browser</li>
                <li>Persistent cookies: Retained up to 2 years</li>
                <li>You can delete cookies anytime through browser settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Cookie Choices</h2>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Browser settings (most browsers allow cookie management)</li>
                <li>Our cookie consent banner on first visit</li>
                <li>Do Not Track (DNT) browser settings</li>
                <li>Your account preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Third-Party Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use third-party cookies from:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mt-4">
                <li>Google Analytics (analytics and performance tracking)</li>
                <li>Stripe (payment processing)</li>
                <li>Twilio (SMS delivery confirmation)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These third parties have their own privacy policies governing their cookie use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about our cookie policy:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-900">Email: privacy@urbanhelp.com.au</p>
                <p className="text-gray-900">Address: Sydney, NSW, Australia</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
