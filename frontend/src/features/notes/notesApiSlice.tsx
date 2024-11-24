import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/ApiSlice";

// Define tu propio tipo de RootState si es necesario
type RootState = {
    notes: ReturnType<typeof notesAdapter.getInitialState>;
    api: ReturnType<typeof apiSlice.reducer>;
};

interface Note {
    username: string;
    id: string;
    _id: string;
    completed: boolean;
    // Añade otros campos según sea necesario
}

const notesAdapter = createEntityAdapter<Note>({
    sortComparer: (a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1,
});

const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotes: builder.query({
            query: () => ({
                url: "/notes",
                validateStatus: (response, result) => {
                    return response.status === 200 && !result.isError;
                },
            }),
            transformResponse: (responseData: Note[]) => {
                const loadedNotes = responseData.map((note) => {
                    note.id = note._id;
                    return note;
                });
                return notesAdapter.setAll(initialState, loadedNotes);
            },
            providesTags: (result, _error, _arg) => {
                if (result?.ids) {
                    return [
                        { type: "Note" as const, id: "LIST" },
                        ...result.ids.map((id) => ({ type: "Note" as const, id })),
                    ];
                } else return [{ type: "Note" as const, id: "LIST" }];
            },
        }),
        addNewNote: builder.mutation({
            query: (initialNote) => ({
                url: "/notes",
                method: "POST",
                body: { ...initialNote },
            }),
            invalidatesTags: [{ type: "Note" as const, id: "LIST" }],
        }),
        updateNote: builder.mutation({
            query: (initialNote) => ({
                url: "/notes",
                method: "PATCH",
                body: { ...initialNote },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "Note" as const, id: arg.id },
            ],
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes`,
                method: "DELETE",
                body: { id },
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: "Note" as const, id: arg.id },
            ],
        }),
    }),
});

export const {
    useGetNotesQuery,
    useAddNewNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} = notesApiSlice;

export const selectNotesResult =
    notesApiSlice.endpoints.getNotes.select("defaultQueryArg");

const selectNotesData = createSelector(
    selectNotesResult,
    (notesResult) => notesResult?.data ?? initialState
);

export const {
    selectAll: selectAllNotes,
    selectById: selectNoteById,
    selectIds: selectNoteIds,
} = notesAdapter.getSelectors(
    (state: RootState) => selectNotesData(state) ?? initialState
);
