import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
// Import store types from the actual store file
import type { AppDispatch, RootState } from "../store/store";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
