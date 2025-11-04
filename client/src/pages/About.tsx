/**
 * @author Bob's Garage Team
 * @purpose About page component displaying garage history and staff members
 * @version 1.0.0
 */

import Staff from "./Staff";

export default function About() {
	return (
		<div>
			<h1>About</h1>
			<p>
				Bob's Garage has served our community for over 20 years. Our certified mechanics and
				friendly reception team keep your car running smoothly.
			</p>
			<hr />
			<h2 className="mt-4">Our Team</h2>
			<Staff />
		</div>
	);
}
