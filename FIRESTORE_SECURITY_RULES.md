# Firestore Security Rules - Updated

## Overview

This document describes the comprehensive security rules implemented for the FitFlow calorie tracking application. The rules ensure that:

1. **Authentication Required**: All operations require user authentication
2. **Data Isolation**: Users can only access their own data
3. **Data Validation**: All data is validated before being written
4. **Prevent Tampering**: userId cannot be changed after creation
5. **Type Safety**: All fields are validated for correct types and ranges

## Security Features

### 1. Authentication & Authorization

- All operations require authentication (`isAuthenticated()`)
- Users can only read/write their own data
- Document ownership is verified using `userId` field matching `request.auth.uid`

### 2. Data Validation

#### Calorie Entries
- ✅ `userId` must match authenticated user
- ✅ `food` must be a non-empty string
- ✅ `calories` must be a non-negative number
- ✅ `mealType` must be one of: breakfast, lunch, dinner, snack
- ✅ `date` must be in YYYY-MM-DD format
- ✅ `userId` cannot be changed on update

#### Habits
- ✅ `userId` must match authenticated user
- ✅ `name` must be a non-empty string
- ✅ `color` must be a string
- ✅ `userId` cannot be changed on update

#### Habit Entries
- ✅ `userId` must match authenticated user
- ✅ `habitId` must be a non-empty string
- ✅ `date` must be in YYYY-MM-DD format
- ✅ `completed` must be a boolean
- ✅ `userId`, `habitId`, and `date` cannot be changed on update

#### Workouts
- ✅ `userId` must match authenticated user
- ✅ `name` must be a non-empty string
- ✅ `type` must be one of: cardio, strength, flexibility, other
- ✅ `date` must be in YYYY-MM-DD format
- ✅ Optional fields (`duration`, `caloriesBurned`, `weight`, `sets`, `reps`) are validated if present
- ✅ `userId` cannot be changed on update

#### Goals
- ✅ `userId` must match authenticated user
- ✅ `type` must be one of: calorie, workout, habit, weight
- ✅ `target` must be a positive number
- ✅ `period` must be one of: daily, weekly, monthly
- ✅ `startDate` must be in YYYY-MM-DD format
- ✅ `isActive` must be a boolean
- ✅ `userId` and `type` cannot be changed on update

#### Weight Entries
- ✅ `userId` must match authenticated user
- ✅ `date` must be in YYYY-MM-DD format
- ✅ `weight` must be between 0 and 1000 kg (reasonable range)
- ✅ `userId` and `date` cannot be changed on update

#### Water Entries
- ✅ `userId` must match authenticated user
- ✅ `date` must be in YYYY-MM-DD format
- ✅ `amount` must be between 0 and 10000 ml (reasonable range)
- ✅ `userId` and `date` cannot be changed on update

#### Body Measurements
- ✅ `userId` must match authenticated user
- ✅ `date` must be in YYYY-MM-DD format
- ✅ All measurement fields (waist, chest, arms, thighs, hips, neck) are validated if present
- ✅ Measurements must be positive numbers within reasonable ranges (0-500 cm for most, 0-200 cm for limbs/neck)
- ✅ `userId` and `date` cannot be changed on update

#### User Settings
- ✅ Document ID must match `userId` (document ID = user ID)
- ✅ `userId` field must match document ID and authenticated user
- ✅ `userId` cannot be changed on update
- ✅ Boolean fields (`darkMode`, `notificationsEnabled`, `onboardingCompleted`) are validated
- ✅ Only the user can access their own settings document

#### Meal Plans
- ✅ `userId` must match authenticated user
- ✅ `date` must be in YYYY-MM-DD format
- ✅ `userId` and `date` cannot be changed on update

#### Workout Plans
- ✅ `userId` must match authenticated user
- ✅ `name` must be a non-empty string
- ✅ `userId` cannot be changed on update

#### Achievements
- ✅ `userId` must match authenticated user
- ✅ `type` and `title` must be non-empty strings
- ✅ Achievements are read-only (cannot be updated or deleted by users)
- ✅ System-generated, so users cannot modify them

### 3. Helper Functions

The rules include several helper functions for code reuse and clarity:

- `isAuthenticated()`: Checks if user is logged in
- `isOwner(userId)`: Checks if user owns the resource
- `isValidUserId(userId)`: Validates userId matches authenticated user
- `isValidDate(dateString)`: Validates YYYY-MM-DD date format
- `isPositiveNumber(value)`: Validates positive numbers
- `isNonNegativeNumber(value)`: Validates non-negative numbers

### 4. Query Support

The rules support Firestore queries:
- Users can query collections filtered by their `userId`
- List operations are allowed when the query filters by `userId == request.auth.uid`
- Individual document reads are validated against ownership

## Deployment

### Option 1: Firebase Console (Recommended for Quick Setup)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules`
5. Paste into the rules editor
6. Click **Publish**

### Option 2: Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 3: Using firebase.json

If you have a `firebase.json` file, you can configure it like this:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

Then deploy with:
```bash
firebase deploy --only firestore:rules
```

## Testing Rules

### Using Firebase Console

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Playground**
3. Test different scenarios:
   - Authenticated user reading their own data
   - Authenticated user trying to read another user's data
   - Unauthenticated user trying to read data
   - User trying to create data with invalid userId
   - User trying to update userId field

### Common Test Cases

1. **User A tries to read User B's calorie entries** → ❌ Denied
2. **User A creates entry with userId = User B's ID** → ❌ Denied
3. **User A updates entry to change userId** → ❌ Denied
4. **User A creates entry with invalid date format** → ❌ Denied
5. **User A creates entry with negative calories** → ❌ Denied
6. **User A reads their own entries** → ✅ Allowed
7. **User A creates entry with valid data** → ✅ Allowed

## Security Best Practices Implemented

✅ **Principle of Least Privilege**: Users can only access their own data  
✅ **Input Validation**: All data is validated before being written  
✅ **Immutable Fields**: Critical fields like `userId` cannot be changed  
✅ **Type Safety**: All fields are validated for correct types  
✅ **Range Validation**: Numeric values are validated for reasonable ranges  
✅ **Date Validation**: Dates must be in correct format  
✅ **Enum Validation**: String fields with limited values are validated  
✅ **Deny by Default**: All other collections are denied access

## Important Notes

1. **User Settings**: The document ID must match the userId. This is enforced in the rules.

2. **Achievements**: Achievements are read-only. Users cannot update or delete them. They should be created by the system only.

3. **Date Format**: All dates must be in `YYYY-MM-DD` format (e.g., "2024-01-15").

4. **Query Performance**: The rules support efficient queries by allowing list operations when filtered by `userId`.

5. **Backward Compatibility**: The rules are designed to work with existing data structures. If you add new fields, make sure to update the rules accordingly.

## Troubleshooting

### "Missing or insufficient permissions" Error

1. Check that the user is authenticated
2. Verify that `userId` in the document matches `request.auth.uid`
3. Check that all required fields are present and valid
4. Verify date format is YYYY-MM-DD
5. Check that numeric values are within allowed ranges

### Rules Not Working After Deployment

1. Wait a few seconds for rules to propagate
2. Clear browser cache and refresh
3. Check Firebase Console Rules tab to verify rules were published
4. Use Rules Playground to test specific scenarios

### Testing in Development

For development, you can temporarily use test mode rules, but **NEVER deploy test mode to production**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 1, 1);
    }
  }
}
```

⚠️ **WARNING**: Test mode allows anyone to read/write. Only use for local development!

## Updates Made

### Version 2.0 (Current)

- ✅ Added comprehensive field validation
- ✅ Added range validation for numeric fields
- ✅ Added date format validation
- ✅ Prevented userId tampering on updates
- ✅ Added validation for optional fields
- ✅ Made achievements read-only
- ✅ Added deny-by-default for unknown collections
- ✅ Improved helper functions
- ✅ Better error messages through validation

### Previous Version

- Basic authentication checks
- Basic ownership validation
- No field validation
- No range checks
- No date format validation

## Support

If you encounter issues with the security rules:

1. Check the Firebase Console Rules tab for syntax errors
2. Use the Rules Playground to test specific scenarios
3. Review the error messages in the browser console
4. Check that your data structure matches the expected format

