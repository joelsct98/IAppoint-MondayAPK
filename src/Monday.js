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
  const [inputValue, setInputValue] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenValue, setTokenValue] = useState("eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI2MzEzMjIxOSwiYWFpIjoxMSwidWlkIjo0MzU1OTExNCwiaWFkIjoiMjAyMy0wNi0xNlQxODowMDowOS4wNDdaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTcwMjMxNTYsInJnbiI6ImV1YzEifQ.-6cmn0a_h328a1fE2be4uQ-qzx65vcgBIH1UA5xCoFs"); // Reemplaza "YOUR_API_TOKEN" con tu token

  useEffect(() => {
    monday.listen("context", (res) => {
      setContext(res.data);
    });

    createBoardAndFetchData();
  }, []);

  const createBoardAndFetchData = () => {
    setIsLoading(true);
    monday.setToken(tokenValue);

    monday.api(`mutation {
      create_board(
        board_name: "Julex",
        board_kind: public,
        description: "Bienvenido a Nuestro sistema de Ventas de Julex.ia"
      ) {
        id
      }
    }`).then(response => {
      const newBoardId = response.data.create_board.id;
      setBoardData({ id: newBoardId });
      setInputValue(newBoardId);
      setIsLoading(false);
      fetchData(newBoardId);
      createNewColumns(newBoardId); // Crear las columnas automáticamente después de crear el board
    }).catch(error => {
      console.log("Error al crear el board:", error);
      setIsLoading(false);
    });
  }

  const fetchData = (boardId) => {
    setIsLoading(true);
    monday.api(`query {
      boards(ids: ${boardId}) {
        name
        columns {
          id
          title
          settings_str
        }
        items {
          id
          name
          column_values {
            id
            value
            title
          }
        }
      }
    }`).then(response => {
      const board = response.data.boards[0];
      setBoardData(board);
      setIsLoading(false);
      console.log(board);
    }).catch(error => {
      console.log(error);
      setIsLoading(false);
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setTokenValue(tokenInput);
    fetchData(inputValue);
  }

  const handleTokenChange = (event) => {
    setTokenInput(event.target.value);
  }

  const createNewColumns = async (newBoardId) => {
    try {
      const createColumnPromises = [
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Teléfono",
            column_type: phone
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Email",
            column_type: email
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Observaciones",
            column_type: text
          ) {
            id
          }
        }`)
      ];
  
      const responses = await Promise.all(createColumnPromises);
  
      const column1Id = responses[0].data.create_column.id;
      const column2Id = responses[1].data.create_column.id;
      const column3Id = responses[2].data.create_column.id;
  
      console.log("Nueva columna Teléfono creada:", column1Id);
      console.log("Nueva columna Email creada:", column2Id);
      console.log("Nueva columna Observaciones creada:", column3Id);
    } catch (error) {
      console.log("Error al crear las columnas:", error);
    }
  };

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
                    value={tokenInput}
                    onChange={handleTokenChange}
                  />
                  <br></br>
                  <button type="submit">Actualizar</button>
                </form>
                <h2>Board: {boardData.name}</h2>
                <div className="datos">
                  <div className="dato-columna">
                    <p>Nombre:</p>
                    {boardData.items.map(item => (
                      <p key={item.id}>{item.name}</p>
                    ))}
                  </div>
                  <div className="dato-columna">
                    <p>Email:</p>
                    {boardData.items.map(item => (
                      <p key={item.id}>{item.name}</p>
                    ))}
                  </div>
                  <div className="dato-columna">
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
