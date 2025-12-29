# Food API Setup Guide

This app includes automatic calorie lookup using food database APIs. You can use one of the following options:

## Option 1: Edamam Food Database API (Recommended)

Edamam provides a comprehensive food database with good free tier.

### Setup Steps:

1. **Sign up for Edamam**
   - Go to [Edamam Developer Portal](https://developer.edamam.com/)
   - Create a free account
   - Navigate to "Applications" → "Create New Application"
   - Select "Food Database API"
   - Copy your **Application ID** and **Application Keys**

2. **Add to Environment Variables**
   - Add to your `.env.local` file:
   ```env
   NEXT_PUBLIC_EDAMAM_APP_ID=your_app_id_here
   NEXT_PUBLIC_EDAMAM_API_KEY=your_api_key_here
   ```

3. **Free Tier Limits:**
   - 5,000 API calls per month
   - More than enough for personal use

### Benefits:
- ✅ Comprehensive food database
- ✅ Includes brand name products
- ✅ Provides macros (protein, carbs, fat)
- ✅ Good free tier

---

## Option 2: USDA FoodData Central API (Free, No Signup Required)

USDA provides a completely free API with no signup required (though getting an API key is recommended).

### Setup Steps:

1. **Get API Key (Optional but Recommended)**
   - Go to [USDA API Key Registration](https://fdc.nal.usda.gov/api-guide.html)
   - Fill out the form to get a free API key
   - Or use `DEMO_KEY` for limited testing

2. **Add to Environment Variables**
   - Add to your `.env.local` file:
   ```env
   NEXT_PUBLIC_USDA_API_KEY=your_api_key_here
   ```
   - Or leave it empty to use `DEMO_KEY` (limited requests)

3. **Free Tier:**
   - Unlimited requests with your own API key
   - `DEMO_KEY` has rate limits

### Benefits:
- ✅ Completely free
- ✅ No signup required (for demo key)
- ✅ Comprehensive USDA database
- ✅ Official government data

---

## Option 3: Use Both (Recommended)

The app automatically tries Edamam first, then falls back to USDA if Edamam is not configured or returns no results.

### Setup:

Add both to `.env.local`:
```env
NEXT_PUBLIC_EDAMAM_APP_ID=your_edamam_app_id
NEXT_PUBLIC_EDAMAM_API_KEY=your_edamam_api_key
NEXT_PUBLIC_USDA_API_KEY=your_usda_api_key
```

This gives you:
- Best results from Edamam (branded products)
- Fallback to USDA (comprehensive database)
- Maximum coverage

---

## How It Works

1. **User types food name** in the search box
2. **App searches** food database after 500ms delay (debounced)
3. **Results appear** in dropdown with:
   - Food name
   - Calories per serving
   - Macros (protein, carbs, fat) if available
   - Brand name (if available)
4. **User selects food** → Calories auto-populate
5. **User can still edit** calories manually if needed

## Features

- ✅ **Autocomplete/Search** - Type to search food database
- ✅ **Auto-fill Calories** - Automatically populate calories when food is selected
- ✅ **Macro Information** - Shows protein, carbs, fat when available
- ✅ **Keyboard Navigation** - Use arrow keys to navigate results
- ✅ **Fallback Support** - Works with or without API keys (manual entry still works)

## Testing

1. Start your dev server: `npm run dev`
2. Go to Calories page
3. Click "Add Entry"
4. Start typing a food name (e.g., "apple", "chicken", "pasta")
5. Select from dropdown → Calories auto-fill!

## Troubleshooting

### "No food items found"
- Check that API keys are set in `.env.local`
- Restart dev server after adding environment variables
- Try a different search term
- Check browser console for errors

### "API request failed"
- Verify API keys are correct
- Check API key limits (Edamam: 5,000/month)
- Ensure you're using `NEXT_PUBLIC_` prefix for environment variables

### Food search not working
- The app will still work - users can manually enter calories
- Check that environment variables are prefixed with `NEXT_PUBLIC_`
- Restart dev server after adding variables

## Production Deployment

When deploying, add the same environment variables to your hosting platform:

**Vercel:**
- Settings → Environment Variables
- Add `NEXT_PUBLIC_EDAMAM_APP_ID`
- Add `NEXT_PUBLIC_EDAMAM_API_KEY`
- Add `NEXT_PUBLIC_USDA_API_KEY` (optional)

**Netlify:**
- Site settings → Environment variables
- Add the same variables

## Alternative APIs

If you want to use a different API:

1. **Spoonacular API** - Free tier: 150 requests/day
2. **Nutritionix API** - Free tier: 500 requests/day
3. **FatSecret API** - Free tier available

To integrate a different API, modify `lib/foodApi.ts` and add your API function following the same pattern.

## No API? No Problem!

The app works perfectly fine without API keys. Users can:
- Manually type food names
- Manually enter calories
- Use the app normally

The food search is a **convenience feature**, not required!

