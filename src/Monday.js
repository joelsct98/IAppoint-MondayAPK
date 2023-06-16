import React, { useEffect, useState } from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import LoginForm from './LoginForm';
import julexImage from './julex.jpeg';

const monday = mondaySdk();

const App = () => {
  const [context, setContext] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [boardData, setBoardData] = useState(null);
  const [inputValue, setInputValue] = useState('1212561485');
  const [tokenValue, setTokenValue] = useState("eyJ0aWQiOjI2MzEzMjIxOSwiYWFpIjoxMSwidWlkIjo0MzU1OTExNCwiaWFkIjoiMjAyMy0wNi0xNlQxODowMDowOS4wNDdaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTcwMjMxNTYsInJnbiI6ImV1YzEifQ"); // Valor por defecto del token

  useEffect(() => {
    monday.execute("valueCreatedForUser");
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    if (tokenValue !== "") {
      monday.setToken(tokenValue);
      fetchBoardData(inputValue);
    } else {
      fetchBoardData(inputValue);
    }
  }, [tokenValue]);

  const fetchBoardData = (boardId) => {
    setIsLoading(true);
  
    monday.api(`query {
      boards {
        id
        name
        items {
          id
          name
        }
      }
    }`)
      .then(response => {
        if (response && response.data && response.data.boards) {
        //   const board = response.data.boards.find(board => board.id === boardId);
        //   setBoardData(board);
        //   setIsLoading(false);
          console.log(response);
        } else {
          throw new Error("La respuesta de la API no tiene la estructura esperada.");
        }
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };
  
  const handleSubmit = (event) => {
    event.preventDefault();
    setTokenValue(inputValue);
  }

  return (
    <div className="capa">
      <div className="popup">
        <img src={julexImage} alt="Julex" />
        <h1>Julex.ia</h1>
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <div>
            {boardData && (
              <div>
                <h2>Datos del board:</h2>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="boardId">ID:</label>
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
                    value={tokenValue}
                    onChange={(e) => setTokenValue(e.target.value)}
                  />
                  <button type="submit">Actualizar</button>
                </form>
                <p>Nombre: {boardData.name}</p>
                <p>Items:</p>
                <ul>
                  {boardData.items.map(item => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
