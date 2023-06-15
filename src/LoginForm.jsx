import React, {useState} from 'react';
import axios from 'axios';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const raizUrl = 'https://presupuestaya-production.up.railway.app';

        try {
            const response = await axios.post(`${raizUrl}/api/authenticate`, {
                username: username,
                password: password,
            });

            const authToken = response.data.jwt;
            localStorage.setItem('authToken', authToken);

            window.location.href = 'https://easyapprouch.com/pantallas/IA/asistente-julex.html';
        } catch (error) {
            alert(
                'Error al iniciar sesión. Por favor, verifica tus credenciales e intenta nuevamente.'
            );
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre</label> <br/>
            <input
                type="text"
                placeholder="Escriba su Nombre"
                id="nombre"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            /> <br/><br/>

            <label htmlFor="password">Contraseña</label> <br/>
            <input
                type="password"
                id="password"
                placeholder="Escribe su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            /> <br/> <br/>

            <button type="submit">Acceder</button>
        </form>
    );
};

export default LoginForm;
