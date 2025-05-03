"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Advocate } from "@/db/schema";
import { debounce } from "lodash";
import { Search, X, Phone, MapPin, GraduationCap, Clock } from "lucide-react";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver>();
  const lastAdvocateRef = useRef<HTMLDivElement>(null);

  const fetchAdvocates = useCallback(async (pageNum: number, search: string, specialty: string, append: boolean = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        q: search,
        specialty: specialty
      });
      
      const response = await fetch(`/api/advocates?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch advocates");
      }
      
      const { data, pagination } = await response.json();
      setHasMore(pageNum < pagination.totalPages);
      
      if (append) {
        setAdvocates(prev => [...prev, ...data]);
      } else {
        setAdvocates(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdvocates(1, searchTerm, selectedSpecialty);
  }, [searchTerm, selectedSpecialty, fetchAdvocates]);

  const handleSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPage(1);
    }, 500),
    []
  );

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setPage(1);
  };

  useEffect(() => {
    if (isLoading) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (lastAdvocateRef.current) {
      observer.current.observe(lastAdvocateRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchAdvocates(page, searchTerm, selectedSpecialty, true);
    }
  }, [page, searchTerm, selectedSpecialty, fetchAdvocates]);

  const allSpecialties = Array.from(
    new Set(advocates.flatMap((advocate) => advocate.specialties || []))
  ).sort();

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            Error: {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Find Your Perfect Healthcare Advocate
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Connect with experienced healthcare professionals who can guide you through your medical journey
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, city, degree, or specialty..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 flex items-center gap-2"
            >
              <X size={18} />
              Reset
            </button>
          </div>

          {/* Specialty Filters */}
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyChange(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advocates.map((advocate, index) => (
            <div
              key={`${advocate.id}-${advocate.firstName}-${advocate.lastName}`}
              ref={index === advocates.length - 1 ? lastAdvocateRef : null}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {advocate.firstName} {advocate.lastName}
                </h3>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={16} />
                  <span className="text-sm">{advocate.yearsOfExperience} years</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap size={16} />
                  <span>{advocate.degree}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={16} />
                  <span>{advocate.city}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} />
                  <span>{advocate.phoneNumber}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {advocate.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
    </main>
  );
}
