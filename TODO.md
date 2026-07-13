# ERP Completion - TODO

## Frontend (highest priority: make the app actually render)
- [ ] Replace `frontend/src/App.jsx` with a real app shell (React Router + MUI provider + auth-aware routing).
- [ ] Create missing frontend pages/components that are currently absent in the repo snapshot:
  - [ ] `frontend/src/pages/auth/Login.jsx`
  - [ ] `frontend/src/pages/dashboard/Dashboard.jsx`
  - [ ] `frontend/src/routes/AppRoutes.jsx` (or equivalent routes file used by `App.jsx`)
  - [ ] `frontend/src/components/common/ProtectedRoute.jsx`
- [ ] Wire Login UI to existing `frontend/src/features/auth/authSlice.js` (dispatch `login`, handle errors, redirect on success).
- [ ] Ensure 401 behavior works end-to-end with existing `frontend/src/api/axios.js` interceptor.

## Frontend modules
- [ ] Add minimal navigation/menu (optional now, but useful): sidebar/header.
- [ ] Implement at least one working CRUD screen per module (Products, Customers, Suppliers, Sales Orders, Purchase Orders, GRN, Invoices).

## Backend verification
- [ ] Confirm each backend controller returns fields consistent with frontend expectations.
- [ ] Verify GRN stock update logic and invoice generation logic.
- [ ] Run backend lint/tests and fix any failing tests.

## End-to-end
- [ ] Run backend + frontend dev servers.
- [ ] Run `npm --prefix backend test` (or `npm test` from backend) and `npm --prefix frontend run build`.

