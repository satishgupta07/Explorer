/**
 * Cloudinary URL transformation helpers.
 *
 * Cloudinary supports on-the-fly transformations via URL segments inserted
 * between the domain and the upload path, e.g.:
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_800/<public-id>
 *
 * These utilities detect a Cloudinary URL, inject the transform string, and
 * return the optimised URL. Non-Cloudinary URLs are returned unchanged so the
 * helpers are safe to call on any image URL.
 */

const CLOUDINARY_UPLOAD_RE = /(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)/;

/**
 * Inject transform parameters into a Cloudinary URL.
 *
 * @param {string} url       - Original Cloudinary URL (or any URL).
 * @param {string} transform - Cloudinary transform string, e.g. "f_auto,q_auto,w_800".
 * @returns {string}         - Transformed URL, or the original if not Cloudinary.
 */
function applyTransform(url, transform) {
  if (!url) return url;
  const match = url.match(CLOUDINARY_UPLOAD_RE);
  if (!match) return url; // not a Cloudinary URL — return as-is

  const [, base, rest] = match;
  // Avoid double-injecting transforms if already present.
  if (rest.startsWith(transform)) return url;

  return `${base}${transform}/${rest}`;
}

/**
 * Optimise a post/feed image.
 * - f_auto  : serves WebP/AVIF to browsers that support them, JPEG otherwise
 * - q_auto  : smart compression (Cloudinary picks the best quality/size tradeoff)
 * - w_800   : resize to 800 px wide — enough for a phone or narrow desktop column
 * - c_limit : never upscale images that are already smaller than 800 px
 */
export function postImageUrl(url) {
  return applyTransform(url, "f_auto,q_auto,w_800,c_limit");
}

/**
 * Optimise an avatar thumbnail.
 * - f_auto        : auto format
 * - q_auto        : smart compression
 * - w_200,h_200   : square crop to 200×200 px (plenty for a small circle)
 * - c_fill,g_face : crop mode that prioritises keeping faces centred
 */
export function avatarUrl(url) {
  return applyTransform(url, "f_auto,q_auto,w_200,h_200,c_fill,g_face");
}
