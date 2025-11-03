/**
 * @author Bob's Garage Team
 * @purpose Animated favorite button with Framer Motion
 * @version 2.0.0
 */

import { motion } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addFavorite, removeFavorite } from '../slices/favorites.slice';

export default function FavouriteButton({ id }: { id: number }) {
  const favs = useSelector((s: RootState) => s.favorites.items);
  const dispatch = useDispatch();
  const isFav = favs.includes(id);
  const toggle = () =>
    isFav ? dispatch(removeFavorite(id)) : dispatch(addFavorite(id));
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
        variant={isFav ? 'danger' : 'outline-primary'}
        size="sm"
        onClick={toggle}
      >
        <motion.div
          key={isFav ? 'filled' : 'outlined'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {isFav ? <AiFillHeart /> : <AiOutlineHeart />}
        </motion.div>
      </Button>
    </motion.div>
  );
}
