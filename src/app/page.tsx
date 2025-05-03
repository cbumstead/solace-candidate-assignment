"use client";

import { useEffect, useState, useCallback } from "react";
import { Advocate } from "@/db/schema";
import { debounce } from "lodash";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    debounce((term: string) => {
      if (!term.trim()) {
        setFilteredAdvocates(advocates);
        return;
      }

      const searchTermLower = term.toLowerCase();
      const filtered = advocates.filter((advocate) => {
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

      setFilteredAdvocates(filtered);
    }, 300),
    [advocates]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterAdvocates(term);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredAdvocates(advocates);
  };

  if (error) {
    return (
      <main className="p-6">
        <div className="text-red-500">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Solace Advocates</h1>
      
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Advocates
        </label>
        <div className="flex gap-2">
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, city, degree, or specialty..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading advocates...</div>
      ) : filteredAdvocates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No advocates found matching your search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Degree
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Years of Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdvocates.map((advocate) => (
                <tr key={`${advocate.id}-${advocate.firstName}-${advocate.lastName}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.firstName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.degree}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {advocate.specialties?.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.yearsOfExperience}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{advocate.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
