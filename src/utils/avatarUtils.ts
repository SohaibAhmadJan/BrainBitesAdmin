/**
 * Generates the correct Avatar URL for a user.
 * Supports direct image URLs and DiceBear Persona seeds.
 */
export const getAvatarUrl = (userImage: string | null | undefined): string | null => {
  if (!userImage) return null;

  // If it's a full URL (Firebase Storage, Unsplash, etc.)
  if (userImage.startsWith('http') || userImage.startsWith('blob:') || userImage.startsWith('data:')) {
    return userImage;
  }

  // Otherwise, treat it as a seed for DiceBear Personas (SVG)
  return `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(userImage)}`;
};
