import React, { useEffect, useState } from "react";
import { Button, Modal, Input, message } from "antd";
import { getUsersAll } from "../util/ApiUtil";
import { banUser } from "../util/ApiUtil";
import { setRoles } from "../util/ApiUtil";
import "../styles/ManagerTab.css";
import Registration from "../components/Registration";

const ManagerTab = () => {
    const [step, setStep] = useState(0);
    const [role, setRole] = useState(0);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isRegistrationOpen, setIsRegistrationOpen] = useState();

    useEffect(() => {
        if (step === 1) {

        }
    }, [step]);

    const loadUsers = async (role) => {
        console.log(role)
        try {
            if(role === "clients") {
                const patients = await getUsersAll(role);
                setUsers(patients);
                setFilteredUsers(patients)
                setRole("ROLE_PATIENT")
            } else {
                const doctors = await getUsersAll(role);
                setUsers(doctors);
                setFilteredUsers(doctors)
                setRole("ROLE_DOCTOR")
            }
        } catch (error) {
            console.error("Error loading users:", error);
            message.error("Ошибка загрузки данных");
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setFilteredUsers(
            users.filter((user) =>
                user.name.toLowerCase().includes(value.toLowerCase())
            )
        );
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedUser(null);
    };

    const handleGiveDoctor = async () => {
        if (selectedUser) {
            try {
                setRole("ROLE_DOCTOR")
                await setRoles(selectedUser.id, role);
                message.success("Пациент стал врачом!");
                setIsModalVisible(false);
            } catch (error) {
                console.error("Error setting doctor:", error);
                message.error("Ошибка при назначении врача");
            }
        }
    };

    const handleRemoveDoctor = async () => {
        if (selectedUser) {
            try {
                setRole("ROLE_PATIENT")
                await setRoles(selectedUser.id, role);
                message.success("Врач отозван!");
                setIsModalVisible(false);
            } catch (error) {
                console.error("Error removing doctor:", error);
                message.error("Ошибка при отзыве врача");
            }
        }
    };

    const handleBanUser = async () => {
        if (selectedUser) {
            try {
                await banUser(selectedUser.id);
                message.success("Пользователь забанен!");
                setIsModalVisible(false);
            } catch (error) {
                console.error("Error banning user:", error);
                message.error("Ошибка при бане пользователя");
            }
        }
    };

    const handleGiveDoctorButton = () => {
        setStep(1);
    };

    const handleNextStep = () => {
        setStep((prev) => Math.min(prev + 1, 1)); // Увеличиваем шаг, максимум - 3
    };

    const handlePreviousStep = () => {
        setStep((prev) => Math.max(prev - 1, 0)); // Уменьшаем шаг, минимум - 1
    };

    const handleCreateDoctorButton = () => {
        setIsRegistrationOpen(true); // Открываем окно регистрации
    };
    const handleCloseRegistration = () => {
        setIsRegistrationOpen(false)
    }
    return (
        <div id="manager-tab">
            {step === 0 && (
                <div>
                    <Button onClick={handleGiveDoctorButton}>Дать врача</Button>
                    <Button onClick={handleCreateDoctorButton}>Создать врача</Button>
                </div>
            )}
            <Registration
                isOpen={isRegistrationOpen}
                onClose={handleCloseRegistration}
                onRegister={(doctorData) => {
                    console.log('Данные нового врача:', doctorData);
                    // Логика для обработки данных нового врача после успешной регистрации
                    handleCloseRegistration();
                }}
            />

            {step === 1 && (
                <div>
                    <Input
                        placeholder="Поиск"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div>
                        <Button onClick={() => loadUsers("clients")}>Пациенты</Button>
                        <Button onClick={() => loadUsers("doctors")}>Врачи</Button>
                    </div>
                    <div className="user-list">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className="user-item"
                                onClick={() => handleUserClick(user)}
                            >
                                <span>{user.name}</span>
                            </div>
                        ))}
                    </div>
                    <div className="navigation-buttons">
                        <button
                            className="btn nav-btn"
                            onClick={handlePreviousStep}
                            disabled={step === 0}
                        >
                            Назад
                        </button>
                        <button
                            className="btn nav-btn"
                            onClick={handleNextStep}
                            disabled={step === 1}
                        >
                            Вперёд
                        </button>
                    </div>
                </div>
            )}

            <Modal
                title={selectedUser ? selectedUser.name : ""}
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {selectedUser && (
                    <div>
                        <p>Полная информация о пользователе:</p>
                        <p>Никнейм: {selectedUser.username}</p>
                        <p>Почта: {selectedUser.email}</p>
                        <p>Имя: {selectedUser.name}</p>
                        <p>Фамилия: {selectedUser.secondName}</p>
                        <p>Отчество: {selectedUser.thirdName}</p>
                        <p>Роль: {selectedUser.thirdName}</p>
                        <p>ID: {selectedUser.id}</p>

                        <div className="modal-buttons">
                            {role === "doctor" ? (
                                <Button onClick={handleRemoveDoctor}>Отобрать врача</Button>
                            ) : (
                                <Button onClick={handleGiveDoctor}>Дать врача</Button>
                            )}
                            <Button onClick={handleBanUser}>Забанить</Button>
                            <Button onClick={handleCloseModal}>Закрыть</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ManagerTab;
