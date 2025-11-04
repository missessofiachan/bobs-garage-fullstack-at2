/**
 * @author Bob's Garage Team
 * @purpose Animated favorite button with Framer Motion
 * @version 3.0.0
 */

import { motion } from "framer-motion";
import { Button } from "react-bootstrap";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavorites } from "../hooks/useFavorites";
import { useToast } from "../components/ui/ToastProvider";

export default function FavouriteButton({ id }: { id: number }) {
	const { isFavorite, addFavorite, removeFavorite } = useFavorites();
	const { notify } = useToast();
	const isFav = isFavorite(id);

	const handleToggle = async () => {
		try {
			if (isFav) {
				await removeFavorite(id);
				notify({ body: "Removed from favorites", variant: "success" });
			} else {
				await addFavorite(id);
				notify({ body: "Added to favorites", variant: "success" });
			}
		} catch (err: any) {
			const message = err.response?.data?.message || "Failed to update favorite";
			notify({ body: message, variant: "danger" });
		}
	};

	return (
		<motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
			<Button
				aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
				variant={isFav ? "danger" : "outline-primary"}
				size="sm"
				onClick={handleToggle}
			>
				<motion.div
					key={isFav ? "filled" : "outlined"}
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				>
					{isFav ? <AiFillHeart /> : <AiOutlineHeart />}
				</motion.div>
			</Button>
		</motion.div>
	);
}
