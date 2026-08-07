export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] p-8 md:p-20 text-slate-300">
      <div className="max-w-4xl mx-auto glass-panel p-8 md:p-12 rounded-3xl">
        <h1 className="text-4xl font-bold text-white mb-8 border-b border-white/10 pb-4">
          Terms of Service
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By registering and accessing Apna Nimboda, you agree to comply
              with these Terms of Service. If you do not agree, please do not
              use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              2. User Conduct & Content
            </h2>
            <p>
              You agree to use this platform strictly for community networking
              and lawful purposes.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2 text-red-300">
              <li>
                Posting hate speech, explicit content, or illegal material is
                strictly prohibited.
              </li>
              <li>
                Spamming, harassment, or attempting to hack the system will
                result in an immediate permanent ban.
              </li>
            </ul>
            <p className="mt-2 text-yellow-300 text-sm">
              Under the Information Technology (Intermediary Guidelines) Rules
              2021, we reserve the right to remove unlawful content within 36
              hours of being reported.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              3. Account Approval
            </h2>
            <p>
              All registrations are subject to manual approval by the Admin to
              ensure community safety. The Admin reserves the right to reject
              any application without specifying a reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-blue-400 mb-3">
              4. Disclaimer of Liability
            </h2>
            <p>
              Apna Nimboda acts solely as an intermediary platform. We are not
              responsible for the accuracy of information provided by users or
              any disputes arising between members.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
