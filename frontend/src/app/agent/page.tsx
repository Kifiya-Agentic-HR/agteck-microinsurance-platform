"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/agent/sidebar";
import AvatarMenu from "@/components/common/avatar";
import { createEnrollment } from "@/utils/api/enrollment";
import { getProductsbyCompany } from "@/utils/api/product";
import { getCurrentUser } from "@/utils/api/user";
import EnrollmentList from "@/components/agent/enrollmentList";
import {
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  RefreshCw,
  Search,
} from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import MapPicker to prevent SSR issues with Leaflet
const MapPicker = dynamic(() => import("@/components/agent/mapPicker"), {
  ssr: false,
});

interface Product {
  id: number;
  name: string;
  company_id: number;
}

export default function CustomerEnrollmentPage() {
  const [formData, setFormData] = useState({
    fName: "",
    mName: "",
    lName: "",
    accountNo: "",
    accountType: "ID",
    premium: 500,
    sumInsured: 10000,
    dateFrom: "",
    dateTo: "",
    receiptNo: "",
    productId: 1,
    longitude: "",
    latitude: "",
    // Other fields from your original state
    cpsZone: 0,
    grid: 0,
  });

  // State for products and form status
  const [products, setProducts] = useState<Product[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: State for location search
  const [locationQuery, setLocationQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(Number(user.sub));
        setCompanyId(user.company_id ? Number(user.company_id) : null);

        const productsResult = await getProductsbyCompany(
          Number(user.company_id)
        );
        const productsArray = Array.isArray(productsResult)
          ? productsResult
          : [productsResult];
        setProducts(productsArray);

        if (productsArray.length > 0) {
          setFormData((prev) => ({ ...prev, productId: productsArray[0].id }));
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setErrorMessage("Failed to load initial data. Please try refreshing.");
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["premium", "sumInsured", "productId"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  // NEW: Function to handle location search (Geocoding)
  const handleLocationSearch = async () => {
    if (!locationQuery) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationQuery
        )}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        handleLocationSelect(parseFloat(lat), parseFloat(lon)); // Reuse handler
      } else {
        setErrorMessage(`Could not find location: "${locationQuery}".`);
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
      setErrorMessage(
        "Failed to fetch location. Please check your connection."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    if (!userId || !companyId) {
      setErrorMessage("User or company information is missing. Cannot submit.");
      setIsSubmitting(false);
      return;
    }

    try {
      await createEnrollment({
        f_name: formData.fName,
        m_name: formData.mName,
        l_name: formData.lName,
        account_no: formData.accountNo,
        account_type: formData.accountType,
        user_id: userId,
        ic_company_id: companyId,
        branch_id: 1, // Or get dynamically if needed
        premium: formData.premium,
        sum_insured: formData.sumInsured,
        date_from: formData.dateFrom,
        date_to: formData.dateTo,
        receipt_no: formData.receiptNo,
        product_id: formData.productId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        // Other fields
        cps_zone: "0",
        grid: "0",
        payout_rate: 0,
      });

      setSuccessMessage("Customer enrolled successfully!");
      // Reset form
      setFormData({
        fName: "",
        mName: "",
        lName: "",
        accountNo: "",
        accountType: "ID",
        premium: 500,
        sumInsured: 10000,
        dateFrom: "",
        dateTo: "",
        receiptNo: "",
        productId: products.length > 0 ? products[0].id : 1,
        longitude: "",
        latitude: "",
        cpsZone: 0,
        grid: 0,
      });
      setLocationQuery("");
    } catch (error: any) {
      setErrorMessage(error.message || "Enrollment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define default coordinates for the map if form data is empty
  const mapCenter = {
    lat: parseFloat(formData.latitude) || 9.03, // Default to Addis Ababa
    lng: parseFloat(formData.longitude) || 38.74,
  };

  return (
    <div className="flex min-h-screen bg-[#f9f8f3] text-[#2c423f]">
      <Sidebar />
      <main className="flex-1 p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#3a584e] flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-[#8ba77f]" />
              Customer Enrollment
            </h1>
            <p className="mt-2 text-[#7a938f] max-w-2xl">
              Register new agricultural insurance policies and manage customer
              coverage.
            </p>
          </div>
          <AvatarMenu />
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info, Account Info, Policy Details sections remain the same... */}
              {/* ... (Code for those sections is omitted for brevity but should be here) ... */}

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["fName", "mName", "lName"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      {field === "fName"
                        ? "First Name*"
                        : field === "mName"
                        ? "Middle Name*"
                        : "Last Name*"}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                      placeholder={
                        field === "fName"
                          ? "Enter first name"
                          : field === "mName"
                          ? "Enter middle name"
                          : "Enter last name"
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Account Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">
                    Account Number*
                  </label>
                  <input
                    type="text"
                    name="accountNo"
                    value={formData.accountNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">
                    Account Type*
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg bg-white"
                    required
                    aria-label="Account Type"
                  >
                    <option value="ID">ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Policy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["premium", "sumInsured"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      {field === "premium" ? "Premium Amount*" : "Sum Insured*"}
                    </label>
                    <input
                      type="number"
                      name={field}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                      placeholder={
                        field === "premium"
                          ? "Enter premium amount"
                          : "Enter sum insured"
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">
                    Coverage Start*
                  </label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                    placeholder="Select coverage start date"
                    title="Coverage Start Date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">
                    Coverage End*
                  </label>
                  <input
                    type="date"
                    name="dateTo"
                    value={formData.dateTo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                    placeholder="Select coverage end date"
                    title="Coverage End Date"
                  />
                </div>
              </div>

              {/* Receipt and Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#7a938f] mb-2">
                    Receipt Number*
                  </label>
                  <input
                    type="text"
                    name="receiptNo"
                    value={formData.receiptNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                    required
                    placeholder="Enter receipt number"
                  />
                </div>
                <div>
                  <label
                    htmlFor="productId"
                    className="block text-sm font-medium text-[#7a938f] mb-2"
                  >
                    Product*
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg bg-white"
                    required
                    aria-label="Product"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* REWRITTEN Location Section */}
              <div>
                <h3 className="text-lg font-medium text-[#3a584e] mb-4">
                  Farm Location
                </h3>
                <div className="flex items-end gap-2 mb-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      Search for Location (e.g., City, Region)
                    </label>
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      placeholder="e.g., Addis Ababa, Ethiopia"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleLocationSearch();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    disabled={isSearching || !locationQuery}
                    className="px-4 py-2.5 bg-[#8ba77f] text-white rounded-lg font-medium hover:bg-[#7a937f] disabled:bg-gray-400 flex items-center gap-2"
                  >
                    {isSearching ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    <span>{isSearching ? "..." : "Search"}</span>
                  </button>
                </div>

                <p className="text-sm text-center text-[#7a938f] mb-3">
                  Or enter coordinates manually / click on the map.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      latitude*
                    </label>
                    <input
                      type="number"
                      name="latitude" // Ensure this matches state: `latitude`
                      value={formData.latitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                      placeholder="e.g., 9.03"
                      step="any"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#7a938f] mb-2">
                      Longitude*
                    </label>
                    <input
                      type="number"
                      name="longitude" // Ensure this matches state: `longitude`
                      value={formData.longitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-[#e0e7d4] rounded-lg"
                      required
                      placeholder="e.g., 38.74"
                      step="any"
                    />
                  </div>
                </div>

                <MapPicker
                  onLocationSelect={handleLocationSelect}
                  center={mapCenter}
                />

                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-gray-500 mt-2">
                    Map centered on: {Number(formData.latitude).toFixed(4)},{" "}
                    {Number(formData.longitude).toFixed(4)}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg font-medium transition-colors w-full sm:w-auto bg-[#8ba77f] text-white hover:bg-[#7a937f] disabled:bg-[#8ba77f]/70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                      Processing...
                    </span>
                  ) : (
                    "Submit Enrollment"
                  )}
                </button>
              </div>

              {/* Feedback Messages */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> {errorMessage}
                </div>
              )}
            </form>
          </div>

          {/* Enrollment List */}
          <div className="bg-white p-6 rounded-xl border border-[#e0e7d4] shadow-sm">
            <h2 className="text-xl font-semibold text-[#3a584e] mb-6 pb-2 border-b border-[#e0e7d4] flex items-center gap-2">
              <ListChecks className="w-5 h-5" /> Recent Enrollments
            </h2>
            <EnrollmentList />
          </div>
        </div>
      </main>
    </div>
  );
}
