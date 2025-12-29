# Firestore Security Rules Setup Guide

## Problem: "Missing or insufficient permissions" Error

If you're seeing this error when trying to update habits (or other data), it means your Firestore security rules are not properly configured.

## All Collections Covered

The security rules include permissions for **all features** in the app:

1. ✅ **calorieEntries** - Daily calorie tracking
2. ✅ **habits** - Habit definitions
3. ✅ **habitEntries** - Daily habit completions
4. ✅ **workouts** - Workout logs
5. ✅ **goals** - User goals (calorie, workout, habit, weight)
6. ✅ **weightEntries** - Weight tracking
7. ✅ **waterEntries** - Water intake tracking
8. ✅ **bodyMeasurements** - Body measurements (waist, chest, arms, etc.)
9. ✅ **userSettings** - User preferences (dark mode, notifications, units, body goal)
10. ✅ **mealPlans** - Weekly meal planning
11. ✅ **workoutPlans** - Custom workout plans
12. ✅ **achievements** - User achievements and badges

## Solution: Update Firestore Security Rules

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **"Firestore Database"** in the left sidebar
4. Click on the **"Rules"** tab

### Step 2: Copy Security Rules

1. Open the `firestore.rules` file in your project root
2. Copy all the contents
3. Paste into the Firebase Console Rules editor

### Step 3: Publish Rules

1. Click **"Publish"** button
2. Wait for confirmation that rules are published
3. Rules take effect immediately

## What the Rules Do

The security rules ensure:

1. **Authentication Required**: All operations require a logged-in user
2. **User Isolation**: Users can only access their own data
3. **CRUD Operations**: Users can:
   - **Create** documents where `userId` matches their auth ID
   - **Read** documents where `userId` matches their auth ID
   - **Update** documents where `userId` matches their auth ID
   - **Delete** documents where `userId` matches their auth ID

## Testing the Rules

After updating the rules:

1. **Test in your app**:
   - Try toggling a habit (this was failing before)
   - Try adding a new habit
   - Try deleting a habit
   - Try adding calorie entries
   - Try logging workouts

2. **If still getting errors**:
   - Check browser console for specific error messages
   - Verify you're logged in
   - Make sure the rules were published successfully
   - Check that your user ID matches the `userId` field in documents

## Common Issues

### Issue: "Permission denied" when creating documents

**Solution**: Make sure when creating documents, you're setting the `userId` field to `request.auth.uid` (the logged-in user's ID).

### Issue: "Permission denied" when deleting documents

**Solution**: The rules check `resource.data.userId` for delete operations. Make sure the document has a `userId` field that matches the logged-in user.

### Issue: Rules work in test mode but not in production

**Solution**: Make sure you published the rules. Test mode allows all operations, but production requires proper rules.

## Rule Structure Explained

```javascript
match /habitEntries/{entryId} {
  // Read: User can read if they own the document
  allow read: if isAuthenticated() && isOwner(resource.data.userId);
  
  // Create: User can create if userId in new document matches their auth ID
  allow create: if isCreatingOwner(request.resource.data.userId);
  
  // Update: User can update if they own both old and new document
  allow update: if isOwner(resource.data.userId) && isCreatingOwner(request.resource.data.userId);
  
  // Delete: User can delete if they own the document
  allow delete: if isOwner(resource.data.userId);
}
```

## Need Help?

- Check the [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- Verify your rules syntax in the Firebase Console (it will highlight errors)
- Test rules using the Rules Playground in Firebase Console

