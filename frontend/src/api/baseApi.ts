import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API implementation
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Product', 'Customer', 'Sale', 'Expense', 'Dashboard'],
  endpoints: (builder) => ({
    // --- DASHBOARD ---
    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
    getRevenueExpense: builder.query({
      query: () => '/dashboard/revenue-expense',
      providesTags: ['Dashboard'],
    }),
    getStockMovement: builder.query({
      query: () => '/dashboard/stock-movement',
      providesTags: ['Dashboard'],
    }),
    getLowStockAlerts: builder.query({
      query: () => '/dashboard/alerts/low-stock',
      providesTags: ['Dashboard'],
    }),
    getAgingCredits: builder.query({
      query: () => '/dashboard/alerts/aging-credit',
      providesTags: ['Dashboard'],
    }),
    getAIInsights: builder.query({
      query: () => '/dashboard/ai-insights',
      providesTags: ['Dashboard'],
    }),

    // --- PRODUCTS ---
    getProducts: builder.query({
      query: () => '/products',
      keepUnusedDataFor: 300, // 5 minutes
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    addProduct: builder.mutation({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Dashboard'],
    }),
    adjustStock: builder.mutation({
      query: (body) => ({
        url: '/products/adjust-stock',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
         { type: 'Product', id: productId },
         { type: 'Product', id: 'LIST' },
         'Dashboard'
      ],
    }),

    // --- CUSTOMERS ---
    getCustomers: builder.query({
      query: () => '/customers',
      keepUnusedDataFor: 300, // 5 minutes
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Customer', id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    addCustomer: builder.mutation({
        query: (body) => ({
            url: '/customers',
            method: 'POST',
            body,
        }),
        invalidatesTags: [{ type: 'Customer', id: 'LIST' }, 'Dashboard'],
    }),

    // --- SALES ---
    createSale: builder.mutation({
        query: (body) => ({
            url: '/finance/sales',
            method: 'POST',
            body,
        }),
        invalidatesTags: ['Product', 'Dashboard', 'Sale', 'Customer'],
    }),

    // --- SETTLEMENTS ---
    settleBalance: builder.mutation({
      query: (body) => ({
        url: '/finance/settlements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer', 'Dashboard'],
    }),

    getCustomerProfit: builder.query({
      query: (id) => `/customers/${id}/profit`,
    }),

    // --- EXPENSES ---
    getExpenses: builder.query({
        query: () => '/finance/expenses',
        providesTags: ['Expense'],
    }),
    addExpense: builder.mutation({
      query: (body) => ({
        url: '/finance/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Expense', 'Dashboard'],
    }),
    getExpenseCategories: builder.query({
      query: () => '/finance/expense-categories',
    }),
    
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetRevenueExpenseQuery,
  useGetStockMovementQuery,
  useGetLowStockAlertsQuery,
  useGetAgingCreditsQuery,
  useGetAIInsightsQuery,
  useGetProductsQuery,
  useAddProductMutation,
  useAdjustStockMutation,
  useGetCustomersQuery,
  useAddCustomerMutation,
  useCreateSaleMutation,
  useSettleBalanceMutation,
  useGetCustomerProfitQuery,
  useLazyGetCustomerProfitQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useGetExpenseCategoriesQuery
} = api;
