import { useSelector, useDispatch } from "react-redux";
import { dispatch, RootState } from "./store";

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<dispatch>();
