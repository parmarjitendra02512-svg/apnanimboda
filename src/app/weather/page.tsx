"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import {
  ArrowLeft,
  Search,
  Loader2,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentCityLabel, setCurrentCityLabel] = useState(
    "Nimboda, Bhinmal, Jalore, Rajasthan",
  );

  useEffect(() => {
    fetchWeather(
      "Bhinmal, Rajasthan, India",
      "Nimboda, Bhinmal, Jalore, Rajasthan",
    );
  }, []);

  const fetchWeather = async (query: string, displayLabel?: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const url = `/api/weather?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "ok") {
        setWeatherData(data.data);
        if (displayLabel) {
          setCurrentCityLabel(displayLabel);
        } else {
          setCurrentCityLabel(`${data.data.name}, ${data.data.sys.country}`);
        }
      } else {
        setError(data.message || "Failed to fetch weather.");
        setWeatherData(null);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching weather.");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      fetchWeather(searchTerm);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000')] bg-cover bg-center bg-fixed relative">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl glass-panel rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 z-10 sticky top-4 mb-8 border border-white/20 shadow-2xl"
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/dashboard" replace>
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Live Weather
              </h1>
              <p className="text-xs text-sky-200">Real-time Updates</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-sky-200 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search City (e.g., Jaipur)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-sky-200/50 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
          />
          <button type="submit" className="hidden" />
        </form>
      </motion.header>

      {/* Content */}
      <main className="w-full max-w-4xl z-10 flex-1 flex flex-col items-center justify-center">
        {loading || isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <Loader2 className="w-12 h-12 animate-spin text-sky-400 mb-4" />
            <p className="text-lg font-medium text-sky-100">
              Fetching latest weather data...
            </p>
          </div>
        ) : error ? (
          <div className="glass-card border border-red-500/30 p-8 rounded-3xl flex flex-col items-center justify-center text-center max-w-lg w-full">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
            <p className="text-red-200">{error}</p>
          </div>
        ) : weatherData ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 mb-8">
                  <MapPin className="w-4 h-4 text-sky-300" />
                  <span className="text-sm font-semibold text-white tracking-wide uppercase">
                    {currentCityLabel}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-12">
                  <div className="flex flex-col items-center">
                    <img
                      src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                      alt="Weather Icon"
                      className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-pulse"
                    />
                    <span className="text-xl font-medium text-sky-200 capitalize mt-2">
                      {weatherData.weather[0].description}
                    </span>
                  </div>

                  <div className="flex flex-col items-center md:items-start">
                    <div className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg">
                      {Math.round(weatherData.main.temp)}&deg;
                    </div>
                    <div className="text-lg text-sky-200 font-medium flex gap-4 mt-2">
                      <span>
                        H: {Math.round(weatherData.main.temp_max)}&deg;
                      </span>
                      <span>
                        L: {Math.round(weatherData.main.temp_min)}&deg;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Thermometer className="w-6 h-6 text-orange-400" />
                    <span className="text-xs text-slate-300">Feels Like</span>
                    <span className="text-lg font-bold text-white">
                      {Math.round(weatherData.main.feels_like)}&deg;
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Droplets className="w-6 h-6 text-blue-400" />
                    <span className="text-xs text-slate-300">Humidity</span>
                    <span className="text-lg font-bold text-white">
                      {weatherData.main.humidity}%
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Wind className="w-6 h-6 text-teal-400" />
                    <span className="text-xs text-slate-300">Wind</span>
                    <span className="text-lg font-bold text-white">
                      {weatherData.wind.speed} m/s
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <CloudSun className="w-6 h-6 text-indigo-400" />
                    <span className="text-xs text-slate-300">Pressure</span>
                    <span className="text-lg font-bold text-white">
                      {weatherData.main.pressure} hPa
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </main>
    </div>
  );
}
