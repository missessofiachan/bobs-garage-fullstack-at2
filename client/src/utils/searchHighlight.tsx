/**
 * @file searchHighlight.tsx
 * @author Bob's Garage Team
 * @description Utility component for highlighting search terms in text
 * @version 1.0.0
 * @since 1.0.0
 */

import type React from "react";

/**
 * Highlights search terms in text
 */
export function highlightSearch(text: string, searchTerm: string): React.ReactNode {
	if (!searchTerm || !text) return text;

	const lowerText = text.toLowerCase();
	const lowerSearch = searchTerm.toLowerCase();
	const index = lowerText.indexOf(lowerSearch);

	if (index === -1) return text;

	const before = text.substring(0, index);
	const match = text.substring(index, index + searchTerm.length);
	const after = text.substring(index + searchTerm.length);

	return (
		<>
			{before}
			<mark className="bg-warning text-dark">{match}</mark>
			{highlightSearch(after, searchTerm)}
		</>
	);
}

