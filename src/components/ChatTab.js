import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setLoggedInUser, setActiveContact, setChatMessages, addChatMessage } from "../store";
import { Button, message } from "antd";
import { getUsers, countNewMessages, findChatMessages, findChatMessage } from "../util/ApiUtil";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css";

var stompClient = null;

const ChatTab = () => {
    const dispatch = useDispatch();

    // Получаем данные из Redux
    const currentUser = useSelector((state) => state.user.loggedInUser);
    const activeContact = useSelector((state) => state.chat.chatActiveContact);
    const messages = useSelector((state) => state.chat.chatMessages);

    const [text, setText] = useState("");
    const [contacts, setContacts] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            return;
        }
        connect();
        loadContacts();
    }, []);

    useEffect(() => {
        if (!activeContact) return;
        findChatMessages(activeContact.id, userInfo.id).then((msgs) =>
            dispatch(setChatMessages(msgs))
        );
        loadContacts();
    }, [activeContact]);

    const connect = () => {
        const Stomp = require("stompjs");
        var SockJS = require("sockjs-client");
        SockJS = new SockJS("http://localhost:8080/ws");
        stompClient = Stomp.over(SockJS);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        if (stompClient && stompClient.connected) {
            stompClient.subscribe(
                "/user/" + userInfo.id + "/queue/messages",
                onMessageReceived
            );
            console.log("Successfully subscribed to /user/" + userInfo.id + "/queue/messages");
        } else {
            console.warn("Connection is not established yet. Retrying...");
            setTimeout(onConnected, 1000);
        }
    };

    const onError = (err) => {

    };

    const onMessageReceived = (msg) => {
        const notification = JSON.parse(msg.body);

        if (activeContact && activeContact.id === notification.senderId) {
            findChatMessage(notification.id).then((message) => {
                dispatch(addChatMessage(message));
            });
        } else {
            message.info("Received a new message from " + notification.senderName);
        }
        loadContacts();
    };

    const sendMessage = (msg) => {
        if (msg.trim() !== "") {
            const message = {
                senderId: userInfo.id,
                recipientId: activeContact.id,
                senderName: userInfo.name,
                recipientName: activeContact.name,
                content: msg,
                timestamp: new Date(),
            };
            stompClient.send("/app/chat", {}, JSON.stringify(message));
            dispatch(addChatMessage(message));
        }
    };

    const loadContacts = async () => {
        try {
            const users = await getUsers(userInfo.roles[0]);
            const enrichedUsers = await Promise.all(
                users.map(async (contact) => {
                    const count = await countNewMessages(contact.id, userInfo.id);
                    return { ...contact, newMessages: count };
                })
            );
            setContacts(enrichedUsers);
            if (!activeContact && enrichedUsers.length > 0) {
                dispatch(setActiveContact(enrichedUsers[0]));
            }
        } catch (err) {
            console.error("Error loading contacts:", err);
        }
    };

    const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return (
        <div id="frame">
            <div id="sidepanel">
                <div id="profile">
                    <div className="wrap">
                        <p>{userInfo.name}</p>
                    </div>
                </div>
                <div id="contacts">
                    <ul>
                        {contacts && contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <li
                                    key={contact.id}
                                    onClick={() => dispatch(setActiveContact(contact))}
                                    className={
                                        activeContact && contact.id === activeContact.id
                                            ? "contact active"
                                            : "contact"
                                    }
                                >
                                    <div className="wrap">
                                        <span className="contact-status online"></span>
                                        <div className="meta">
                                            <p className="name">{contact.name} {contact.secondName}</p>
                                            {contact.newMessages > 0 && (
                                                <p className="preview">{contact.newMessages} Новое сообщение</p>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>Нет доступных контактов</p>
                        )}
                    </ul>
                </div>
            </div>
            <div className="content">
                <ScrollToBottom className="messages">
                    <ul>
                        {Array.isArray(sortedMessages) && sortedMessages.length > 0 ? (
                            sortedMessages.map((msg) => (
                                <li
                                    key={msg.id}
                                    className={msg.senderId === userInfo.id ? "sent" : "replies"}
                                >
                                    <p>{msg.content}</p>
                                </li>
                            ))
                        ) : (
                            <p>Сообщений нет</p>
                        )}
                    </ul>

                </ScrollToBottom>
                <div className="message-input">
                    <input
                        type="text"
                        placeholder="Введите сообщение..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                sendMessage(text);
                                setText("");
                            }
                        }}
                    />
                    <Button
                        onClick={() => {
                            sendMessage(text);
                            setText("");
                        }}
                    >
                        Отправить
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatTab;
