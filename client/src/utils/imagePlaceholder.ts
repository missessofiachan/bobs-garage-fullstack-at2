/**
 * @author Bob's Garage Team
 * @purpose Utility for placeholder images when no image is available
 * @version 1.0.0
 */

/**
 * Generic placeholder image as data URI SVG
 * Can be used for services, staff, or any other missing images
 */
export const IMAGE_PLACEHOLDER =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(`
		<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
			<rect width='100%' height='100%' fill='#dee2e6'/>
			<g fill='#6c757d' font-family='Arial, Helvetica, sans-serif' font-size='20' font-weight='500'>
				<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>No image</text>
			</g>
		</svg>
	`);

/**
 * Get image source with fallback to placeholder
 * @param imageUrl - The image URL (can be undefined, empty string, or a valid URL)
 * @param baseUrl - Optional base URL for relative paths
 * @returns The image URL or placeholder if no image is provided
 */
export function getImageSrc(
	imageUrl: string | undefined | null,
	baseUrl?: string,
): string {
	if (!imageUrl || imageUrl.trim() === "") {
		return IMAGE_PLACEHOLDER;
	}

	if (imageUrl.startsWith("http")) {
		return imageUrl;
	}

	if (baseUrl) {
		return imageUrl.startsWith("/") ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
	}

	return imageUrl;
}
