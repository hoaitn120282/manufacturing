import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productionSlice from './slices/productionSlice';
import inventorySlice from './slices/inventorySlice';
import salesSlice from './slices/salesSlice';
import dashboardSlice from './slices/dashboardSlice';
import uiSlice from './slices/uiSlice';
import qualitySlice from './slices/qualitySlice';
import maintenanceSlice from './slices/maintenanceSlice';
import hrmSlice from './slices/hrmSlice';
import financeSlice from './slices/financeSlice';
import procurementSlice from './slices/procurementSlice';
import integrationSlice from './slices/integrationSlice';
import usersSlice from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    production: productionSlice,
    inventory: inventorySlice,
    sales: salesSlice,
    dashboard: dashboardSlice,
    ui: uiSlice,
    quality: qualitySlice,
    maintenance: maintenanceSlice,
    hrm: hrmSlice,
    finance: financeSlice,
    procurement: procurementSlice,
    integration: integrationSlice,
    users: usersSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;