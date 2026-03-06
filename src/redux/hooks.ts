import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// ✅ Use instead of plain `useDispatch`
export const useAppDispatch: () => AppDispatch = useDispatch;

// ✅ Use instead of plain `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
