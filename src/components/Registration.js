import React, { useState } from 'react';
import '../styles/Registration.css';

function Registration({ isOpen, onClose, onRegister }) {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState('client');
    const [agreement, setAgreement] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');

    const handleRegister = async (e) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: login,
                    password,
                    confirmPassword,
                    name,
                    secondName: surname,
                    thirdName: patronymic,
                    email,
                }),
            });

            if (response.ok) {
                setErrorMessage('');
                onClose();
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            setErrorMessage('Проблемы с сервером, пожалуйста, повторите позже.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Регистрация</h2>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form>
                    <div className="input-group">
                        <label htmlFor="name">Имя</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="surname">Фамилия</label>
                        <input
                            type="text"
                            id="surname"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="patronymic">Отчество</label>
                        <input
                            type="text"
                            id="patronymic"
                            value={patronymic}
                            onChange={(e) => setPatronymic(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login">Логин</label>
                        <input
                            type="text"
                            id="login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="login">Почта</label>
                        <input
                            type="text"
                            id="login"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Пароль</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Повторите пароль</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            id="agreement"
                            checked={agreement}
                            onChange={() => setAgreement(!agreement)}
                        />
                        <label htmlFor="agreement">Я согласен с лицензионным соглашением</label>
                    </div>

                    <button type="button" className="button" onClick={handleRegister}>Зарегистрироваться</button>
                </form>
                <button className="button close" onClick={onClose}>Закрыть</button>
            </div>
        </div>
    );
}

export default Registration;
