import { configureStore, createSlice } from "@reduxjs/toolkit";

// Slice для состояния пользователя
const userSlice = createSlice({
    name: "user",
    initialState: {
        loggedInUser: {}, // Состояние пользователя
    },
    reducers: {
        setLoggedInUser: (state, action) => {
            state.loggedInUser = action.payload;
        },
    },
});

// Slice для активного контакта
const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chatActiveContact: null, // Активный контакт
        chatMessages: [], // Сообщения
    },
    reducers: {
        setActiveContact: (state, action) => {
            state.chatActiveContact = action.payload;
        },
        setChatMessages: (state, action) => {
            state.chatMessages = action.payload;
        },
        addChatMessage: (state, action) => {
            state.chatMessages = [...state.chatMessages, action.payload];
        },
    },
});

export const { setLoggedInUser } = userSlice.actions;
export const { setActiveContact, setChatMessages, addChatMessage } = chatSlice.actions;

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        chat: chatSlice.reducer,
    },
});
