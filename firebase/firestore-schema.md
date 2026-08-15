# BrainBites Firestore Schema

This document defines the production Firestore structure for BrainBites and BrainBitesAdmin.

## Top-level collections

- `facts`
- `categories`
- `quizzes`
- `collections`
- `achievements`
- `dailyTips`
- `notifications`
- `users`
- `admins`
- `adminActivity`
- `analyticsEvents`

## Singleton document

`appConfig/global`

Recommended fields:
- `maintenanceMode: boolean`
- `minimumAppVersion: string`
- `latestAppVersion: string`
- `dailyGoalDefault: number`
- `heroRotationEnabled: boolean`
- `heroRotationIntervalSeconds: number`
- `featuredFactId: string|null`
- `teaserEnabled: boolean`
- `quizEnabled: boolean`
- `notificationsEnabled: boolean`
- `analyticsEnabled: boolean`
- `updatedAt: timestamp`

## facts/{factId}

Fields:
- `id: string`
- `fact: string`
- `categoryId: string`
- `title: string`
- `snippet: string`
- `fullFact: string`
- `whyItMatters: string`
- `imageUrl: string|null`
- `keywords: string[]`
- `readTimeMinutes: number`
- `teaserType: string|null`
- `isPublished: boolean`
- `isFeatured: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`
- `createdBy: string`
- `updatedBy: string`

Do not store user-specific `isBookmarked` or `isCompleted` fields here.

## categories/{categoryId}

Fields:
- `name: string`
- `description: string`
- `icon: string|null`
- `imageUrl: string|null`
- `isActive: boolean`
- `sortOrder: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## quizzes/{quizId}

Fields:
- `factId: string`
- `question: string`
- `options: string[]`
- `correctAnswerIndex: number`
- `teaserType: string|null`
- `isActive: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## collections/{collectionId}

Fields:
- `title: string`
- `description: string`
- `icon: string|null`
- `color: string|null`
- `factIds: string[]`
- `isPublished: boolean`
- `sortOrder: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## achievements/{achievementId}

Fields:
- `name: string`
- `description: string`
- `icon: string|null`
- `requirementType: string`
- `requirementValue: number`
- `isActive: boolean`
- `sortOrder: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## dailyTips/{tipId}

Fields:
- `text: string`
- `isActive: boolean`
- `sortOrder: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## notifications/{notificationId}

Global/admin-created notification fields:
- `title: string`
- `message: string`
- `type: string`
- `targetType: string` (all|user|segment)
- `targetUserId: string|null`
- `scheduledAt: timestamp|null`
- `sentAt: timestamp|null`
- `status: string`
- `createdAt: timestamp`
- `createdBy: string`

## users/{uid}

Fields:
- `email: string|null`
- `displayName: string`
- `photoUrl: string|null`
- `bio: string`
- `publicProfile: boolean`
- `accountStatus: string` (active|disabled|deleted)
- `analyticsEnabled: boolean`
- `dailyGoal: number`
- `textScale: number`
- `hapticsEnabled: boolean`
- `notificationsEnabled: boolean`
- `streak: number`
- `lastActiveAt: timestamp|null`
- `factsReadCount: number`
- `favoritesCount: number`
- `sharesCount: number`
- `createdAt: timestamp`
- `updatedAt: timestamp`
- `lastLoginAt: timestamp|null`

### users/{uid}/favorites/{factId}
- `factId: string`
- `createdAt: timestamp`

### users/{uid}/history/{historyId}
- `factId: string`
- `viewedAt: timestamp`
- `completed: boolean`

### users/{uid}/achievements/{achievementId}
- `achievementId: string`
- `progress: number`
- `unlocked: boolean`
- `unlockedAt: timestamp|null`
- `adminOverride: boolean`

### users/{uid}/collectionProgress/{collectionId}
- `collectionId: string`
- `completedFacts: number`
- `totalFacts: number`
- `progress: number`
- `completed: boolean`
- `updatedAt: timestamp`

### users/{uid}/notifications/{notificationId}
- `title: string`
- `message: string`
- `type: string`
- `isRead: boolean`
- `createdAt: timestamp`
- `actionType: string|null`
- `actionData: map|null`

### users/{uid}/activity/{activityId}
- `type: string`
- `factId: string|null`
- `metadata: map|null`
- `createdAt: timestamp`

## admins/{uid}

Fields:
- `email: string`
- `displayName: string`
- `role: string` (SUPER_ADMIN|ADMIN|CONTENT_MANAGER|ANALYST)
- `permissions: string[]`
- `isActive: boolean`
- `createdAt: timestamp`
- `updatedAt: timestamp`

## adminActivity/{logId}

Fields:
- `adminUid: string`
- `action: string`
- `targetType: string`
- `targetId: string|null`
- `before: map|null`
- `after: map|null`
- `reason: string|null`
- `createdAt: timestamp`

## analyticsEvents/{eventId}

Fields:
- `uid: string|null`
- `eventName: string`
- `factId: string|null`
- `categoryId: string|null`
- `metadata: map|null`
- `createdAt: timestamp`

## Existing collections

The current Firebase project already contains `audit_logs`, `categories`, `collections`, and `facts`. Do not delete or duplicate those collections until their document fields are migrated and the existing admin implementation has been replaced.

The existing `audit_logs` collection should eventually be migrated to the standardized `adminActivity` collection, but only after the current records are preserved.
