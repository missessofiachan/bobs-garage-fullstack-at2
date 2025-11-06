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

/**
 * Highlights multiple search terms in text
 */
export function highlightMultipleTerms(text: string, searchTerms: string[]): React.ReactNode {
	if (!searchTerms.length || !text) return text;

	const parts: Array<{ text: string; isMatch: boolean }> = [];
	const remaining = text;
	const lastIndex = 0;

	// Find all matches
	const matches: Array<{ start: number; end: number; term: string }> = [];
	for (const term of searchTerms) {
		if (!term) continue;
		const lowerTerm = term.toLowerCase();
		const lowerText = remaining.toLowerCase();
		let index = lowerText.indexOf(lowerTerm, lastIndex);
		while (index !== -1) {
			matches.push({
				start: index,
				end: index + term.length,
				term: term,
			});
			index = lowerText.indexOf(lowerTerm, index + 1);
		}
	}

	// Sort matches by start position
	matches.sort((a, b) => a.start - b.start);

	// Build parts array
	let currentIndex = 0;
	for (const match of matches) {
		if (match.start > currentIndex) {
			parts.push({
				text: remaining.substring(currentIndex, match.start),
				isMatch: false,
			});
		}
		parts.push({
			text: remaining.substring(match.start, match.end),
			isMatch: true,
		});
		currentIndex = match.end;
	}

	if (currentIndex < remaining.length) {
		parts.push({
			text: remaining.substring(currentIndex),
			isMatch: false,
		});
	}

	return (
		<>
			{parts.map((part, i) =>
				part.isMatch ? (
					<mark key={i} className="bg-warning text-dark">
						{part.text}
					</mark>
				) : (
					part.text
				),
			)}
		</>
	);
}
