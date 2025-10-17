class CarbonCalculator {
  static carbonFactors = {
    // Electricity (kg CO2 per kWh)
    electricity: {
      grid_average: 0.385,
      coal: 0.96,
      natural_gas: 0.44,
      solar: 0.05,
      wind: 0.01,
      hydro: 0.01,
    },

    // Transportation (kg CO2 per unit)
    transportation: {
      gasoline: 8.887, // per gallon
      diesel: 10.16, // per gallon
      jet_fuel: 9.75, // per gallon
      electric_vehicle: 0.12, // per mile
      gas_vehicle: 0.24, // per mile
      public_transit: 0.05, // per mile
      flight: 0.18, // per passenger mile
    },

    // Food (kg CO2 per kg of product)
    food: {
      beef: 27.0,
      lamb: 24.0,
      cheese: 13.0,
      pork: 12.1,
      turkey: 10.9,
      chicken: 6.9,
      tuna: 6.1,
      eggs: 4.8,
      potatoes: 2.9,
      rice: 2.7,
      nuts: 2.3,
      beans: 2.0,
      tofu: 2.0,
      milk: 1.9,
      vegetables: 0.4,
      fruits: 0.4,
      lentils: 0.9,
    },

    // Home Energy (kg CO2 per unit)
    home: {
      natural_gas: 5.3, // per therm
      heating_oil: 10.21, // per gallon
      propane: 5.75, // per gallon
      lpg: 5.75,
    },

    // Waste (kg CO2 per kg of waste)
    waste: {
      landfill: 0.71,
      recycled: -0.21,
      composted: -0.11,
    },
  };

  // Enhanced calculation with better accuracy
  static calculate(type, value, subtype = null) {
    let carbon_kg = 0;

    switch (type) {
      case "electricity":
        const energySource = subtype || "grid_average";
        carbon_kg =
          value *
          (this.carbonFactors.electricity[energySource] ||
            this.carbonFactors.electricity.grid_average);
        break;

      case "transportation":
        const vehicleType = subtype || "gas_vehicle";
        carbon_kg =
          value *
          (this.carbonFactors.transportation[vehicleType] ||
            this.carbonFactors.transportation.gas_vehicle);
        break;

      case "food":
        const foodType = subtype || "beef";
        carbon_kg =
          value *
          (this.carbonFactors.food[foodType] || this.carbonFactors.food.beef);
        break;

      case "home":
        const fuelType = subtype || "natural_gas";
        carbon_kg =
          value *
          (this.carbonFactors.home[fuelType] ||
            this.carbonFactors.home.natural_gas);
        break;

      case "waste":
        const wasteType = subtype || "landfill";
        carbon_kg =
          value *
          (this.carbonFactors.waste[wasteType] ||
            this.carbonFactors.waste.landfill);
        break;

      default:
        // If type not found, return 0 instead of throwing error
        carbon_kg = 0;
    }

    return Math.round(carbon_kg * 100) / 100;
  }

  // Generate AI-style insights based on carbon data
  static generateInsights(analysisData, calculatedCarbon) {
    const insights = [];

    // Use AI analysis if available, otherwise use our calculations
    const carbon = analysisData.total_emission || calculatedCarbon;
    const category = analysisData.category || "general";

    if (carbon > 100) {
      insights.push(
        `Your ${category} usage is significant. Consider reduction strategies.`
      );
    }

    // Category-specific advice
    if (category === "electricity" && carbon > 50) {
      insights.push(
        "💡 Switch to LED bulbs and unplug devices when not in use."
      );
      insights.push("🌞 Consider solar panels to reduce grid dependency.");
    }

    if (category === "transportation" && carbon > 30) {
      insights.push(
        "🚗 Try carpooling or using public transportation 2 days a week."
      );
      insights.push("🚲 Consider biking for short distances.");
    }

    if (category === "food" && carbon > 20) {
      insights.push("🌱 Incorporate more plant-based meals into your diet.");
      insights.push(
        "🥦 Buy local and seasonal produce to reduce transport emissions."
      );
    }

    // Fallback if no specific insights
    if (insights.length === 0) {
      insights.push(
        "📊 Continue tracking to get personalized recommendations."
      );
      insights.push("🌍 Every small reduction contributes to a larger impact!");
    }

    return insights.slice(0, 3); // Return max 3 insights
  }

  // Get carbon equivalents for better understanding
  static getCarbonEquivalents(carbon_kg) {
    return {
      trees_needed: Math.round(carbon_kg / 21.77),
      car_miles: Math.round(carbon_kg / 0.24),
      smartphones_charged: Math.round(carbon_kg / 0.008),
    };
  }
}

module.exports = CarbonCalculator;
