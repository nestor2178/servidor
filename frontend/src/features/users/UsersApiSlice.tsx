//usersApiSlice.tsx
import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/ApiSlice";
import { RootState } from "../../app/store";
const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => ({
                url: "/users",
                validateStatus: (response: Response, result: any) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData: any) => {
                const loadedUsers = responseData.map((user: any) => {
                    user.id = user._id;
                    return user;
                });
                return usersAdapter.setAll(initialState, loadedUsers);
            },
            providesTags: (result, _error, _arg) => {
                if (result?.ids) {
                    return [
                        { type: "User" as const, id: "LIST" },
                        ...result.ids.map((id) => ({ type: "User" as const, id })),
                    ];
                } else return [{ type: "User" as const, id: "LIST" }];
            },
        }),
        addNewUser: builder.mutation({
            query: (initialUserData) => ({
                url: "/users",
                method: "POST",
                body: {
                    ...initialUserData,
                },
            }),
            invalidatesTags: [{ type: "User" as const, id: "LIST" }],
        }),
        updateUser: builder.mutation({
            query: (initialUserData) => ({
                url: "/users",
                method: "PATCH",
                body: {
                    ...initialUserData,
                },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "User" as const, id: arg.id },
            ],
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: `/users`,
                method: "DELETE",
                body: { id },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "User" as const, id: arg.id },
            ],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApiSlice;

// returns the query result object
export const selectUsersResult =
    usersApiSlice.endpoints.getUsers.select(undefined);

// creates memoized selector
const selectUsersData = createSelector(
    selectUsersResult,
    (usersResult) => usersResult.data || initialState
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds,
    // Pass in a selector that returns the users slice of state
} = usersAdapter.getSelectors(
    (state: RootState) => selectUsersData(state) ?? initialState
);
