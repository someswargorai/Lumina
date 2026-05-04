import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface NotificationState {
    notifications: Notification[];
}

const initialState: NotificationState = {
    notifications: []
}

export const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification> ) => {
            state.notifications = [action.payload, ...state.notifications]
        },
    },
})

export const { setNotifications } = notificationsSlice.actions

export default notificationsSlice.reducer
