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
  const [tokenValue, setTokenValue] = useState("eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI2MzEzMjIxOSwiYWFpIjoxMSwidWlkIjo0MzU1OTExNCwiaWFkIjoiMjAyMy0wNi0xNlQxODowMDowOS4wNDdaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTcwMjMxNTYsInJnbiI6ImV1YzEifQ.-6cmn0a_h328a1fE2be4uQ-qzx65vcgBIH1UA5xCoFs");
  const [column1Id, setColumn1Id] = useState(null);
  const [column2Id, setColumn2Id] = useState(null);
  const [column3Id, setColumn3Id] = useState(null);

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
        columns {
          id
          title
        }
        items {
          id
          column_values {
            id
            value
            title
          }
        }
      }
    }`).then(response => {
      const newBoard = response.data.create_board;
      const newBoardId = newBoard.id;
      const newColumns = newBoard.columns;
      const newItems = newBoard.items;

      setBoardData({ id: newBoardId, columns: newColumns, items: newItems });
      setInputValue(newBoardId);
      setIsLoading(false);
      createNewColumns(newBoardId);
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
            title: "Nombre",
            column_type: text
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Email",
            column_type: text
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Estado",
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

      setColumn1Id(column1Id);
      setColumn2Id(column2Id);
      setColumn3Id(column3Id);

      console.log("Nueva columna Nombre creada:", column1Id);
      console.log("Nueva columna Email creada:", column2Id);
      console.log("Nueva columna Estado creada:", column3Id);

      createItems(newBoardId, column1Id, column2Id, column3Id);
    } catch (error) {
      console.log("Error al crear las columnas:", error);
    }
  };

  const createItems = async (boardId, column1Id, column2Id, column3Id) => {
    try {
      const item1Nombre = "Juan Carlos";
      const item1Email = "juancarlos@gmail.com";
      const item1Estado = "enviado";
  
      const item2Nombre = "Jose";
      const item2Email = "jose@gmail.com";
      const item2Estado = "fallido";
  
      const item3Nombre = "Ana";
      const item3Email = "ana@gmail.com";
      const item3Estado = "en proceso";
  
      const createItemPromises = [
        monday.api(`mutation {
          create_item(
            board_id: ${boardId},
            group_id: "topics",
            item_name: "${item1Nombre}",
            column_values: "{\"${column1Id}\": {\"text\": \"${item1Nombre}\"}, \"${column2Id}\": {\"text\": \"${item1Email}\"}, \"${column3Id}\": {\"text\": \"${item1Estado}\"}}"
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_item(
            board_id: ${boardId},
            group_id: "topics",
            item_name: "${item2Nombre}",
            column_values: "{\"${column1Id}\": {\"text\": \"${item2Nombre}\"}, \"${column2Id}\": {\"text\": \"${item2Email}\"}, \"${column3Id}\": {\"text\": \"${item2Estado}\"}}"
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_item(
            board_id: ${boardId},
            group_id: "topics",
            item_name: "${item3Nombre}",
            column_values: "{\"${column1Id}\": {\"text\": \"${item3Nombre}\"}, \"${column2Id}\": {\"text\": \"${item3Email}\"}, \"${column3Id}\": {\"text\": \"${item3Estado}\"}}"
          ) {
            id
          }
        }`)
      ];
  
      await Promise.all(createItemPromises);
  
      console.log("Items creados exitosamente");
    } catch (error) {
      console.log("Error al crear los items:", error);
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
                {boardData && column1Id && column2Id && column3Id && (
                      <div className="datos">
                        <div className="dato-columna">
                          <p>Nombre:</p>
                          {boardData.items.map(item => (
                            <p key={item.id}>{item.column_values[column1Id]?.text}</p>
                          ))}
                        </div>
                        <div className="dato-columna">
                          <p>Email:</p>
                          {boardData.items.map(item => (
                            <p key={item.id}>{item.column_values[column2Id]?.text}</p>
                          ))}
                        </div>
                        <div className="dato-columna">
                          <p>Estado:</p>
                          {boardData.items.map(item => (
                            <p key={item.id}>{item.column_values[column3Id]?.text}</p>
                          ))}
                        </div>
                      </div>
                    )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
