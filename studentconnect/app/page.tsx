// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-mint-800">
            Welcome to StudentConnect
          </h1>
          <p className="text-xl mb-8 text-mint-700">
            Connect with opportunities and events for students
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/events" className="group p-8 bg-white/70 backdrop-blur-sm border border-mint-200 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-3 text-mint-800 group-hover:text-mint-600">
                📅 Events
              </h3>
              <p className="text-mint-700">
                Discover upcoming student events and activities
              </p>
            </div>
          </Link>
          
          <Link href="/jobs" className="group p-8 bg-white/70 backdrop-blur-sm border border-mint-200 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-3 text-mint-800 group-hover:text-mint-600">
                💼 Job Opportunities
              </h3>
              <p className="text-mint-700">
                Find internships and job opportunities
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
