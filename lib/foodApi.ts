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

// Local database of common Indian meals with calorie information
// Calories are per serving (approximately 1 cup/200-250g unless specified)
const indianMealsDatabase: FoodItem[] = [
  // Rice Dishes
  { label: 'Biryani (Chicken)', calories: 350, nutrients: { calories: 350, protein: 18, carbs: 45, fat: 10 }, foodId: 'indian-biryani-chicken' },
  { label: 'Biryani (Vegetable)', calories: 320, nutrients: { calories: 320, protein: 8, carbs: 50, fat: 8 }, foodId: 'indian-biryani-veg' },
  { label: 'Biryani (Mutton)', calories: 380, nutrients: { calories: 380, protein: 20, carbs: 45, fat: 12 }, foodId: 'indian-biryani-mutton' },
  { label: 'Pulao (Vegetable)', calories: 250, nutrients: { calories: 250, protein: 6, carbs: 40, fat: 6 }, foodId: 'indian-pulao-veg' },
  { label: 'Jeera Rice', calories: 220, nutrients: { calories: 220, protein: 4, carbs: 42, fat: 4 }, foodId: 'indian-jeera-rice' },
  { label: 'Lemon Rice', calories: 240, nutrients: { calories: 240, protein: 5, carbs: 38, fat: 6 }, foodId: 'indian-lemon-rice' },
  
  // Curries & Gravies
  { label: 'Butter Chicken', calories: 320, nutrients: { calories: 320, protein: 22, carbs: 12, fat: 20 }, foodId: 'indian-butter-chicken' },
  { label: 'Chicken Curry', calories: 280, nutrients: { calories: 280, protein: 25, carbs: 8, fat: 16 }, foodId: 'indian-chicken-curry' },
  { label: 'Mutton Curry', calories: 300, nutrients: { calories: 300, protein: 28, carbs: 6, fat: 18 }, foodId: 'indian-mutton-curry' },
  { label: 'Fish Curry', calories: 200, nutrients: { calories: 200, protein: 20, carbs: 5, fat: 10 }, foodId: 'indian-fish-curry' },
  { label: 'Paneer Butter Masala', calories: 350, nutrients: { calories: 350, protein: 15, carbs: 15, fat: 25 }, foodId: 'indian-paneer-butter-masala' },
  { label: 'Paneer Tikka Masala', calories: 320, nutrients: { calories: 320, protein: 18, carbs: 12, fat: 20 }, foodId: 'indian-paneer-tikka' },
  { label: 'Dal Makhani', calories: 280, nutrients: { calories: 280, protein: 12, carbs: 30, fat: 12 }, foodId: 'indian-dal-makhani' },
  { label: 'Dal Tadka', calories: 180, nutrients: { calories: 180, protein: 8, carbs: 25, fat: 5 }, foodId: 'indian-dal-tadka' },
  { label: 'Chana Masala', calories: 220, nutrients: { calories: 220, protein: 10, carbs: 35, fat: 6 }, foodId: 'indian-chana-masala' },
  { label: 'Rajma (Kidney Beans)', calories: 240, nutrients: { calories: 240, protein: 12, carbs: 38, fat: 5 }, foodId: 'indian-rajma' },
  { label: 'Aloo Gobi', calories: 150, nutrients: { calories: 150, protein: 4, carbs: 25, fat: 4 }, foodId: 'indian-aloo-gobi' },
  { label: 'Baingan Bharta', calories: 180, nutrients: { calories: 180, protein: 3, carbs: 20, fat: 8 }, foodId: 'indian-baingan-bharta' },
  { label: 'Palak Paneer', calories: 250, nutrients: { calories: 250, protein: 12, carbs: 12, fat: 16 }, foodId: 'indian-palak-paneer' },
  { label: 'Matar Paneer', calories: 280, nutrients: { calories: 280, protein: 14, carbs: 18, fat: 16 }, foodId: 'indian-matar-paneer' },
  { label: 'Malai Kofta', calories: 380, nutrients: { calories: 380, protein: 10, carbs: 25, fat: 26 }, foodId: 'indian-malai-kofta' },
  
  // Breads
  { label: 'Roti (1 piece)', calories: 70, nutrients: { calories: 70, protein: 2, carbs: 12, fat: 1 }, foodId: 'indian-roti' },
  { label: 'Chapati (1 piece)', calories: 70, nutrients: { calories: 70, protein: 2, carbs: 12, fat: 1 }, foodId: 'indian-chapati' },
  { label: 'Naan (1 piece)', calories: 260, nutrients: { calories: 260, protein: 7, carbs: 42, fat: 6 }, foodId: 'indian-naan' },
  { label: 'Paratha (1 piece)', calories: 180, nutrients: { calories: 180, protein: 4, carbs: 25, fat: 7 }, foodId: 'indian-paratha' },
  { label: 'Aloo Paratha (1 piece)', calories: 280, nutrients: { calories: 280, protein: 6, carbs: 38, fat: 10 }, foodId: 'indian-aloo-paratha' },
  { label: 'Butter Naan (1 piece)', calories: 310, nutrients: { calories: 310, protein: 8, carbs: 45, fat: 10 }, foodId: 'indian-butter-naan' },
  { label: 'Kulcha (1 piece)', calories: 240, nutrients: { calories: 240, protein: 6, carbs: 40, fat: 5 }, foodId: 'indian-kulcha' },
  
  // Snacks & Appetizers
  { label: 'Samosa (1 piece)', calories: 150, nutrients: { calories: 150, protein: 3, carbs: 18, fat: 7 }, foodId: 'indian-samosa' },
  { label: 'Pakora (Mixed, 1 piece)', calories: 50, nutrients: { calories: 50, protein: 1, carbs: 5, fat: 2 }, foodId: 'indian-pakora' },
  { label: 'Aloo Tikki (1 piece)', calories: 120, nutrients: { calories: 120, protein: 2, carbs: 15, fat: 5 }, foodId: 'indian-aloo-tikki' },
  { label: 'Dahi Vada (2 pieces)', calories: 180, nutrients: { calories: 180, protein: 6, carbs: 25, fat: 5 }, foodId: 'indian-dahi-vada' },
  { label: 'Pani Puri (1 piece)', calories: 30, nutrients: { calories: 30, protein: 0.5, carbs: 4, fat: 1 }, foodId: 'indian-pani-puri' },
  { label: 'Bhel Puri (1 serving)', calories: 200, nutrients: { calories: 200, protein: 4, carbs: 35, fat: 4 }, foodId: 'indian-bhel-puri' },
  { label: 'Pav Bhaji (1 serving)', calories: 350, nutrients: { calories: 350, protein: 8, carbs: 45, fat: 15 }, foodId: 'indian-pav-bhaji' },
  { label: 'Vada Pav (1 piece)', calories: 280, nutrients: { calories: 280, protein: 6, carbs: 35, fat: 12 }, foodId: 'indian-vada-pav' },
  
  // South Indian
  { label: 'Dosa (Plain, 1 piece)', calories: 120, nutrients: { calories: 120, protein: 3, carbs: 20, fat: 2 }, foodId: 'indian-dosa' },
  { label: 'Masala Dosa (1 piece)', calories: 280, nutrients: { calories: 280, protein: 8, carbs: 35, fat: 10 }, foodId: 'indian-masala-dosa' },
  { label: 'Idli (2 pieces)', calories: 100, nutrients: { calories: 100, protein: 4, carbs: 18, fat: 1 }, foodId: 'indian-idli' },
  { label: 'Vada (2 pieces)', calories: 150, nutrients: { calories: 150, protein: 5, carbs: 20, fat: 4 }, foodId: 'indian-vada' },
  { label: 'Upma (1 serving)', calories: 200, nutrients: { calories: 200, protein: 5, carbs: 35, fat: 4 }, foodId: 'indian-upma' },
  { label: 'Pongal (1 serving)', calories: 250, nutrients: { calories: 250, protein: 6, carbs: 40, fat: 6 }, foodId: 'indian-pongal' },
  { label: 'Sambar (1 cup)', calories: 80, nutrients: { calories: 80, protein: 3, carbs: 12, fat: 2 }, foodId: 'indian-sambar' },
  { label: 'Rasam (1 cup)', calories: 40, nutrients: { calories: 40, protein: 1, carbs: 6, fat: 1 }, foodId: 'indian-rasam' },
  
  // Sweets & Desserts
  { label: 'Gulab Jamun (1 piece)', calories: 150, nutrients: { calories: 150, protein: 2, carbs: 25, fat: 5 }, foodId: 'indian-gulab-jamun' },
  { label: 'Jalebi (100g)', calories: 300, nutrients: { calories: 300, protein: 3, carbs: 60, fat: 8 }, foodId: 'indian-jalebi' },
  { label: 'Kheer (1 cup)', calories: 250, nutrients: { calories: 250, protein: 5, carbs: 45, fat: 6 }, foodId: 'indian-kheer' },
  { label: 'Halwa (1 serving)', calories: 280, nutrients: { calories: 280, protein: 3, carbs: 40, fat: 12 }, foodId: 'indian-halwa' },
  { label: 'Ladoo (1 piece)', calories: 120, nutrients: { calories: 120, protein: 2, carbs: 18, fat: 4 }, foodId: 'indian-ladoo' },
  { label: 'Barfi (1 piece)', calories: 100, nutrients: { calories: 100, protein: 2, carbs: 15, fat: 3 }, foodId: 'indian-barfi' },
  
  // Breakfast Items
  { label: 'Poha (1 serving)', calories: 200, nutrients: { calories: 200, protein: 4, carbs: 35, fat: 4 }, foodId: 'indian-poha' },
  { label: 'Paratha with Curd (1 piece)', calories: 220, nutrients: { calories: 220, protein: 6, carbs: 28, fat: 8 }, foodId: 'indian-paratha-curd' },
  { label: 'Chole Bhature (1 serving)', calories: 450, nutrients: { calories: 450, protein: 12, carbs: 60, fat: 18 }, foodId: 'indian-chole-bhature' },
  
  // Drinks
  { label: 'Lassi (Sweet, 1 glass)', calories: 180, nutrients: { calories: 180, protein: 6, carbs: 25, fat: 6 }, foodId: 'indian-lassi-sweet' },
  { label: 'Lassi (Salted, 1 glass)', calories: 120, nutrients: { calories: 120, protein: 6, carbs: 12, fat: 5 }, foodId: 'indian-lassi-salted' },
  { label: 'Chai (1 cup)', calories: 30, nutrients: { calories: 30, protein: 1, carbs: 5, fat: 1 }, foodId: 'indian-chai' },
];

// Search local Indian meals database
const searchIndianMeals = (query: string): FoodItem[] => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  // Filter meals that match the search term
  const matches = indianMealsDatabase.filter(meal => 
    meal.label.toLowerCase().includes(searchTerm) ||
    meal.label.toLowerCase().split(' ').some(word => word.startsWith(searchTerm))
  );

  // Sort by relevance (exact matches first, then starts with)
  const sorted = matches.sort((a, b) => {
    const aExact = a.label.toLowerCase() === searchTerm;
    const bExact = b.label.toLowerCase() === searchTerm;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = a.label.toLowerCase().startsWith(searchTerm);
    const bStarts = b.label.toLowerCase().startsWith(searchTerm);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return 0;
  });

  return sorted.slice(0, 10); // Return top 10 results
};

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

// Main search function that combines local database and APIs
export const searchFoodAll = async (query: string): Promise<FoodItem[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // First, search local Indian meals database
  const localResults = searchIndianMeals(query);
  
  // Then try external APIs
  let apiResults: FoodItem[] = [];
  
  try {
    // Try Edamam first
    apiResults = await searchFood(query);
    
    // If Edamam returns no results or is not configured, try USDA
    if (apiResults.length === 0) {
      apiResults = await searchFoodUSDA(query);
    }
  } catch (error) {
    console.error('Error searching food APIs:', error);
  }

  // Combine results: local first, then API results
  // Remove duplicates based on label
  const allResults = [...localResults, ...apiResults];
  const uniqueResults = allResults.filter((item, index, self) =>
    index === self.findIndex((t) => t.label.toLowerCase() === item.label.toLowerCase())
  );

  return uniqueResults.slice(0, 15); // Return top 15 results
};

// Get food details by ID (for future use)
export const getFoodDetails = async (foodId: string): Promise<FoodItem | null> => {
  // Check local database first
  const localItem = indianMealsDatabase.find(item => item.foodId === foodId);
  if (localItem) {
    return localItem;
  }
  
  // Implementation for getting detailed food information from APIs
  // This can be used if you want to show more details about a selected food
  return null;
};

