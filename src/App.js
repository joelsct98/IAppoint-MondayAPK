import React, { useEffect, useState } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import LoginForm from './LoginForm';
import julexImage from './julex.jpeg';

const monday = mondaySdk();

const App = () => {
  const [context, setContext] = useState();
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar si la consulta está en progreso
  const [boardData, setBoardData] = useState(null); // Estado para almacenar los datos del board
  const [inputValue, setInputValue] = useState('1212561485'); // Valor inicial del campo de entrada
  const [tokenInput, setTokenInput] = useState(""); // Estado para almacenar el valor del campo de entrada de tipo texto
  const [tokenValue, setTokenValue] = useState("eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI2MzEzMjIxOSwiYWFpIjoxMSwidWlkIjo0MzU1OTExNCwiaWFkIjoiMjAyMy0wNi0xNlQxODowMDowOS4wNDdaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTcwMjMxNTYsInJnbiI6ImV1YzEifQ.-6cmn0a_h328a1fE2be4uQ-qzx65vcgBIH1UA5xCoFs");

  useEffect(() => {
    monday.execute("valueCreatedForUser");
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    // Ejecutar la consulta una vez que el componente se haya montado
    fetchBoardData(inputValue);
  }, []);

  const fetchBoardData = (boardId) => {
    setIsLoading(true); // Indicar que la consulta está en progreso

    monday.setToken(tokenValue);

    monday.api(`query {
      boards {
        id
        name
        items {
          id
          name
        }
      }
    }`).then(response => {
        const board = response.data.boards.find(board => board.id === boardId);
        setBoardData(board);
        setIsLoading(false); // Indicar que la consulta ha finalizado
        console.log(board);
    }).catch(error => {
      console.log(error);
      setIsLoading(false); // Indicar que la consulta ha finalizado, incluso en caso de error
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setTokenValue(tokenInput); // Actualizar el estado tokenValue con el valor actual de tokenInput
    fetchBoardData(inputValue);
  }

  const handleTokenChange = (event) => {
    setTokenInput(event.target.value); // Actualizar el estado tokenInput con el valor del campo de entrada de tipo texto
  }

  return (
    <div className="capa">
      <div className="popup">
        <img src={julexImage} alt="Julex" />
        <h1>Julex.ia</h1>
        {/* <LoginForm /> */}
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <div>
            {boardData && (
              <div>
                <h2>Datos del board:</h2>
                <form onSubmit={handleSubmit}>
                <label htmlFor="boardId">Board ID:</label>
                  <input
                    type="number"
                    id="boardId"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <label htmlFor="token">Token:</label>
                  <input
                    type="text"
                    id="token"
                    value={tokenInput} // Usar tokenInput en lugar de tokenValue
                    onChange={handleTokenChange} // Usar handleTokenChange en lugar de setTokenValue
                  />
                  
                  <br></br>
                  <button type="submit">Actualizar</button>
                </form>
                <h2>Board: {boardData.name}</h2>
                <div class="datos">
                    <div class="dato-columna">
                        <p>Nombre:</p>
                        {boardData.items.map(item => (
                            <p key={item.id}>{item.name}</p>
                        ))}
                    </div>
                    <div class="dato-columna">
                        <p>Email:</p>
                        {boardData.items.map(item => (
                            <p key={item.id}>{item.name}</p>
                        ))}
                    </div>
                    <div class="dato-columna">
                        <p>Julex:</p>
                        {boardData.items.map(item => (
                            <p key={item.id}>{item.name}</p>
                        ))}
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
