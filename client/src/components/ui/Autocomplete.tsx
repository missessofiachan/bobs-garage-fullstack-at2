/**
 * @author Bob's Garage Team
 * @purpose Reusable autocomplete component with dropdown suggestions
 * @version 1.0.0
 */

import { useEffect, useRef, useState } from "react";
import { Form, InputGroup } from "react-bootstrap";
import type { ServiceDTO } from "../../api/types";
import { formatCurrency } from "../../utils/formatters";
import { highlightSearch } from "../../utils/searchHighlight";

interface AutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	onSelect?: (service: ServiceDTO) => void;
	services: ServiceDTO[] | undefined;
	placeholder?: string;
	ariaLabel?: string;
	maxSuggestions?: number;
	disabled?: boolean;
}

/**
 * Autocomplete component that shows service suggestions as user types
 */
export default function Autocomplete({
	value,
	onChange,
	onSelect,
	services = [],
	placeholder = "Search...",
	ariaLabel = "Search",
	maxSuggestions = 5,
	disabled = false,
}: AutocompleteProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Filter services based on search query
	const suggestions = services
		.filter((service) => {
			if (!value.trim()) return false;
			const query = value.toLowerCase();
			return (
				service.published !== false &&
				(service.name.toLowerCase().includes(query) ||
					service.description?.toLowerCase().includes(query))
			);
		})
		.slice(0, maxSuggestions);

	// Reset highlighted index when suggestions change
	useEffect(() => {
		setHighlightedIndex(-1);
	}, [suggestions.length, value]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		setIsOpen(newValue.trim().length > 0 && suggestions.length > 0);
		setHighlightedIndex(-1);
	};

	const handleInputFocus = () => {
		if (value.trim().length > 0 && suggestions.length > 0) {
			setIsOpen(true);
		}
	};

	const handleSelect = (service: ServiceDTO) => {
		onChange(service.name);
		setIsOpen(false);
		setHighlightedIndex(-1);
		if (onSelect) {
			onSelect(service);
		}
		inputRef.current?.blur();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen || suggestions.length === 0) {
			if (e.key === "Enter") {
				e.preventDefault();
			}
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
					handleSelect(suggestions[highlightedIndex]);
				}
				break;
			case "Escape":
				e.preventDefault();
				setIsOpen(false);
				setHighlightedIndex(-1);
				inputRef.current?.blur();
				break;
		}
	};

	// Scroll highlighted item into view
	useEffect(() => {
		if (highlightedIndex >= 0 && suggestionsRef.current) {
			const highlightedElement = suggestionsRef.current.children[highlightedIndex] as HTMLElement;
			if (highlightedElement) {
				highlightedElement.scrollIntoView({
					block: "nearest",
					behavior: "smooth",
				});
			}
		}
	}, [highlightedIndex]);

	return (
		<div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
			<InputGroup>
				<InputGroup.Text aria-hidden="true">
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="currentColor"
						style={{ display: "block" }}
					>
						<path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
					</svg>
				</InputGroup.Text>
				<Form.Control
					ref={inputRef}
					type="text"
					value={value}
					onChange={handleInputChange}
					onFocus={handleInputFocus}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					aria-label={ariaLabel}
					aria-expanded={isOpen}
					aria-autocomplete="list"
					aria-controls="autocomplete-suggestions"
					disabled={disabled}
					autoComplete="off"
				/>
			</InputGroup>
			{isOpen && suggestions.length > 0 && (
				<div
					id="autocomplete-suggestions"
					ref={suggestionsRef}
					className="border rounded shadow-sm bg-white"
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						right: 0,
						zIndex: 1000,
						maxHeight: "300px",
						overflowY: "auto",
						marginTop: "4px",
					}}
					role="listbox"
				>
					{suggestions.map((service, index) => (
						<div
							key={service.id}
							role="option"
							aria-selected={index === highlightedIndex}
							onClick={() => handleSelect(service)}
							onMouseEnter={() => setHighlightedIndex(index)}
							style={{
								padding: "12px 16px",
								cursor: "pointer",
								backgroundColor:
									index === highlightedIndex
										? "var(--bs-primary-bg-subtle)"
										: "var(--bs-secondary-bg-subtle)",
								borderBottom: index < suggestions.length - 1 ? "1px solid var(--bs-border-color)" : "none",
							}}
						>
							<div className="fw-semibold" style={{ fontSize: "0.95rem" }}>
								{highlightSearch(service.name, value)}
							</div>
							{service.description && (
								<div
									className="text-muted small"
									style={{
										marginTop: "4px",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{highlightSearch(service.description, value)}
								</div>
							)}
							<div className="text-primary small mt-1">{formatCurrency(service.price)}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
