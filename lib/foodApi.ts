// Food API service for automatic calorie lookup
// Using Edamam Food Database API (free tier available)

export interface FoodItem {
  label: string;
  calories: number;
  nutrients?: {
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  brand?: string;
  foodId?: string;
}

export interface FoodSearchResult {
  foods: FoodItem[];
  total: number;
}

// Search for food items using Edamam API
export const searchFood = async (query: string): Promise<FoodItem[]> => {
  // In Next.js, NEXT_PUBLIC_ variables are available on client side
  const apiKey = process.env.NEXT_PUBLIC_EDAMAM_API_KEY;
  const appId = process.env.NEXT_PUBLIC_EDAMAM_APP_ID;

  // If API keys are not set, return empty array
  if (!apiKey || !appId) {
    // Silently fail - user can still manually enter calories
    return [];
  }

  try {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(query)}&app_id=${appId}&app_key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Food API request failed');
    }

    const data = await response.json();
    
    // Transform Edamam response to our FoodItem format
    const foods: FoodItem[] = (data.hints || []).slice(0, 10).map((hint: any) => {
      const food = hint.food;
      const nutrients = food.nutrients || {};
      
      return {
        label: food.label,
        calories: Math.round(nutrients.ENERC_KCAL || 0),
        nutrients: {
          calories: Math.round(nutrients.ENERC_KCAL || 0),
          protein: Math.round(nutrients.PROCNT || 0),
          carbs: Math.round(nutrients.CHOCDF || 0),
          fat: Math.round(nutrients.FAT || 0),
        },
        brand: food.brand,
        foodId: food.foodId,
      };
    });

    return foods;
  } catch (error) {
    console.error('Error searching food:', error);
    return [];
  }
};

// Alternative: USDA FoodData Central API (completely free, no API key needed)
export const searchFoodUSDA = async (query: string): Promise<FoodItem[]> => {
  const apiKey = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';

  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=10`
    );

    if (!response.ok) {
      throw new Error('USDA API request failed');
    }

    const data = await response.json();
    
    const foods: FoodItem[] = (data.foods || []).map((food: any) => {
      const nutrients = food.foodNutrients || [];
      const calories = nutrients.find((n: any) => n.nutrientName === 'Energy')?.value || 0;
      const protein = nutrients.find((n: any) => n.nutrientName === 'Protein')?.value || 0;
      const carbs = nutrients.find((n: any) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0;
      const fat = nutrients.find((n: any) => n.nutrientName === 'Total lipid (fat)')?.value || 0;
      
      return {
        label: food.description,
        calories: Math.round(calories),
        nutrients: {
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
        },
        foodId: food.fdcId?.toString(),
      };
    });

    return foods;
  } catch (error) {
    console.error('Error searching food (USDA):', error);
    return [];
  }
};

// Get food details by ID (for future use)
export const getFoodDetails = async (foodId: string): Promise<FoodItem | null> => {
  // Implementation for getting detailed food information
  // This can be used if you want to show more details about a selected food
  return null;
};

