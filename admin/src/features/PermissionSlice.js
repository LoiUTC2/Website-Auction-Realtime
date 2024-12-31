import { createSlice } from '@reduxjs/toolkit'

export const permissionSlice = createSlice({
  name: 'permission',
  initialState: {
    value: [],
  },
  reducers: {
      setPermission: (state, action) => {
          state.value = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setPermission } = permissionSlice.actions

export default permissionSlice.reducer