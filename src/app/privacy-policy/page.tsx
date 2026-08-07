export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-20 text-slate-300">
      <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl">
        <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">
          Privacy Policy
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to Apna Nimboda. We respect your privacy and are committed
              to protecting your personal data in compliance with the Digital
              Personal Data Protection Act (DPDP Act) of India and applicable IT
              Rules.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              2. Data We Collect
            </h2>
            <p>To provide a secure community directory, we collect:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>Full Name and Father's Name (for identity verification)</li>
              <li>
                Mobile Number and Email Address (for OTP security and
                communication)
              </li>
              <li>Location, Pincode, and Gram Panchayat</li>
              <li>Profession and Profile Photo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              3. How We Use Your Data
            </h2>
            <p>Your data is exclusively used to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                Create and manage your verified profile in the community
                directory.
              </li>
              <li>Prevent bot attacks and unauthorized access.</li>
              <li>
                Allow community members to connect with you (unless you choose
                to hide your mobile number).
              </li>
            </ul>
            <p className="mt-2 text-white font-medium">
              We do NOT sell your data to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              4. Data Security
            </h2>
            <p>
              We implement strict security measures including bcrypt password
              hashing, JWT authentication, and Firebase Realtime Database
              Security Rules to prevent data breaches.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              5. Your Rights
            </h2>
            <p>
              You have the right to request deletion of your account and
              associated data. Please contact the Admin to exercise this right.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
