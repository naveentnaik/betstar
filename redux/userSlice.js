import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userdetails: {
      email: "",
      is_admin: false,
      password: "",
      phone_number: "",
      user_id: "",
      username: "",
    },
  },
  reducers: {
    setUser: (state, action) => {
      state.userdetails={...state.userdetails,...action.payload}
    },
  },
});

export const { setUser } = userSlice.actions;
