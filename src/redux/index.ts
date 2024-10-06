import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialState {
  openSidebar: boolean;
  openFullSidebar: boolean;
}

const initialState: InitialState = {
  openSidebar: false,
  openFullSidebar: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setOpenSidebar(state, action: PayloadAction<boolean>) {
      state.openSidebar = action.payload;
    },
    setOpenFullSidebar(state, action: PayloadAction<boolean>) {
      state.openFullSidebar = action.payload;
    },
  },
});

export const { setOpenSidebar, setOpenFullSidebar } = globalSlice.actions;
export default globalSlice.reducer;
