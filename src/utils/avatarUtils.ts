/**
 * Generates the correct Avatar URL for a user.
 * Supports direct image URLs (Firebase Storage) and DiceBear seeds.
 */
export const getAvatarUrl = (userImage: string | null | undefined): string | null => {
  if (!userImage) return null;

  // 1. Check if it's a full Firebase Storage link or other HTTP URL
  if (userImage.startsWith('http')) {
    return userImage;
  }

  // 2. Check for local dev links (blob/data)
  if (userImage.startsWith('blob:') || userImage.startsWith('data:')) {
    return userImage;
  }

  // 3. Otherwise, treat it as a seed for DiceBear Personas (SVG)
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(userImage)}`;
};
