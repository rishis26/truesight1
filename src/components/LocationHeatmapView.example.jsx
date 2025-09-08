import React from 'react';
import LocationHeatmapView from './LocationHeatmapView';

// Example usage in ThreatDashboard component
const ThreatDashboard = ({ analysisResults }) => {
  // Extract location data from analysis results
  const extractLocationData = (analysis) => {
    if (!analysis || !analysis.locations) return [];
    
    return analysis.locations.map(location => ({
      location: location.name || location.address,
      coordinates: {
        lat: location.latitude || location.lat,
        lng: location.longitude || location.lng
      },
      placeType: location.type || 'unknown',
      riskScore: location.riskScore || location.confidence,
      time: location.time || location.timestamp,
      interpretation: location.analysis || location.description
    }));
  };

  // Get all location data from recent analyses
  const allLocationData = analysisResults
    .map(analysis => extractLocationData(analysis))
    .flat()
    .filter(Boolean); // Remove any null/undefined entries

  return (
    <div className="space-y-6">
      {/* Other dashboard components */}
      
      {/* Only render LocationHeatmapView if we have valid location data */}
      {allLocationData.length > 0 && (
        <LocationHeatmapView heatmapData={allLocationData} />
      )}
      
      {/* Rest of dashboard content */}
    </div>
  );
};

// Example data structure for testing
const exampleHeatmapData = [
  {
    location: "Hinjewadi IT Park, Pune",
    coordinates: { lat: 18.5993, lng: 73.7130 },
    placeType: "commercial",
    riskScore: 85,
    time: "18:00",
    interpretation: "Critical risk: Commercial area during peak evening traffic."
  },
  {
    location: "Times Square, New York",
    coordinates: { lat: 40.7580, lng: -73.9855 },
    placeType: "tourist",
    riskScore: 45,
    time: "14:30",
    interpretation: "Medium risk: High foot traffic area with security presence."
  },
  {
    location: "Central Park, New York",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    placeType: "public",
    riskScore: 25,
    // No time provided - will not be displayed
    interpretation: "Low risk: Open public space with good visibility."
  },
  {
    location: "Invalid Location",
    coordinates: { lat: null, lng: 73.7130 }, // Invalid coordinates
    placeType: "unknown",
    riskScore: 90
    // This entry will be filtered out due to invalid coordinates
  }
];

// Example of how to test the component
const TestLocationHeatmap = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Location Heatmap Test</h2>
      
      {/* Test with valid data */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">With Valid Data:</h3>
        <LocationHeatmapView heatmapData={exampleHeatmapData} />
      </div>
      
      {/* Test with empty data - should render nothing */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">With Empty Data (should not render):</h3>
        <LocationHeatmapView heatmapData={[]} />
        <p className="text-gray-500">No map should be visible above</p>
      </div>
      
      {/* Test with invalid data - should render nothing */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">With Invalid Data (should not render):</h3>
        <LocationHeatmapView heatmapData={[{ location: "Test" }]} />
        <p className="text-gray-500">No map should be visible above</p>
      </div>
    </div>
  );
};

export default LocationHeatmapView;
export { ThreatDashboard, TestLocationHeatmap, exampleHeatmapData };
