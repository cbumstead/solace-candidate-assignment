"use client";

import { useEffect, useState, useCallback } from "react";
import { Advocate } from "@/db/schema";
import { debounce } from "lodash";
import { Search, X, Phone, MapPin, GraduationCap, Clock } from "lucide-react";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/advocates");
        if (!response.ok) {
          throw new Error("Failed to fetch advocates");
        }
        const { data } = await response.json();
        setAdvocates(data);
        setFilteredAdvocates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const filterAdvocates = useCallback(
    debounce((term: string, specialty: string) => {
      let filtered = advocates;

      if (term.trim()) {
        const searchTermLower = term.toLowerCase();
        filtered = filtered.filter((advocate) => {
          const searchableFields = [
            advocate.firstName?.toLowerCase() || "",
            advocate.lastName?.toLowerCase() || "",
            advocate.city?.toLowerCase() || "",
            advocate.degree?.toLowerCase() || "",
            ...(advocate.specialties || []).map((s) => s.toLowerCase()),
            String(advocate.yearsOfExperience || ""),
            advocate.phoneNumber || "",
          ];

          return searchableFields.some((field) => 
            field && typeof field === 'string' && field.includes(searchTermLower)
          );
        });
      }

      if (specialty) {
        filtered = filtered.filter((advocate) => 
          advocate.specialties?.includes(specialty)
        );
      }

      setFilteredAdvocates(filtered);
    }, 300),
    [advocates]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterAdvocates(term, selectedSpecialty);
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    filterAdvocates(searchTerm, specialty);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedSpecialty("");
    setFilteredAdvocates(advocates);
  };

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
                value={searchTerm}
                onChange={handleSearch}
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAdvocates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-slate-400 mb-4">No advocates found matching your search criteria.</div>
            <button
              onClick={handleReset}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAdvocates.map((advocate) => (
              <div
                key={`${advocate.id}-${advocate.firstName}-${advocate.lastName}`}
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
        )}
      </div>
    </main>
  );
}
