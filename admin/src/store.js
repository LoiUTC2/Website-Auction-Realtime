import { configureStore } from '@reduxjs/toolkit'
import  permissionSlice  from './features/PermissionSlice'

export default configureStore({
  reducer: {
    permission:permissionSlice
  },
})