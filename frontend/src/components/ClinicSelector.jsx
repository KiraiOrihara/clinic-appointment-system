import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { clinicManagerService } from '../services/api';

const ClinicSelector = ({ onClinicChange, selectedClinicId }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentClinic, setCurrentClinic] = useState(null);

  useEffect(() => {
    fetchManagedClinics();
  }, []);

  useEffect(() => {
    if (clinics.length > 0 && selectedClinicId) {
      const clinic = clinics.find(c => c.id === selectedClinicId);
      setCurrentClinic(clinic);
    }
  }, [clinics, selectedClinicId]);

  const fetchManagedClinics = async () => {
    try {
      const response = await clinicManagerService.getManagedClinics();
      // Backend returns clinics array directly, not wrapped in response.clinics
      const clinicsList = Array.isArray(response) ? response : response.clinics || [];
      setClinics(clinicsList);
      if (clinicsList.length > 0 && !selectedClinicId) {
        const defaultClinic = clinicsList[0];
        setCurrentClinic(defaultClinic);
        if (onClinicChange) {
          onClinicChange(defaultClinic.id);
        }
      }
    } catch (error) {
      console.error('Error fetching managed clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClinicSelect = async (clinic) => {
    try {
      await clinicManagerService.selectClinic(clinic.id);
      setCurrentClinic(clinic);
      setIsOpen(false);
      if (onClinicChange) {
        onClinicChange(clinic.id);
      }
    } catch (error) {
      console.error('Error selecting clinic:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (clinics.length <= 1) {
    return currentClinic ? (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{currentClinic.name}</span>
      </div>
    ) : null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {currentClinic?.name || 'Select Clinic'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            {clinics.map((clinic) => (
              <button
                key={clinic.id}
                onClick={() => handleClinicSelect(clinic)}
                className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{clinic.name}</span>
                </div>
                {currentClinic?.id === clinic.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicSelector;
