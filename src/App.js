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
        items {
          id
        }
      }
    }`).then(response => {
      const newBoardId = response.data.create_board.id;
      const newItemId = response.data.create_board.items[0].id;
      setBoardData({ id: newBoardId });
      setInputValue(newBoardId);
      setIsLoading(false);
      fetchColumnsAndItems(newBoardId);
      createColumns(newBoardId, newItemId); // Crear las columnas y la automatización después de crear el board y el item
    }).catch(error => {
      console.log("Error al crear el board:", error);
      setIsLoading(false);
    });
  }

  const createColumns = async (newBoardId, newItemId) => {
    try {
      const createColumnPromises = [
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Estado",
            column_type: status
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Julex",
            column_type: text
          ) {
            id
          }
        }`)
      ];

      const responses = await Promise.all(createColumnPromises);

      const statusColumnId = responses[0].data.create_column.id;
      const observationsColumnId = responses[1].data.create_column.id;

      console.log("Nueva columna Estado creada:", statusColumnId);
      console.log("Nueva columna Julex creada:", observationsColumnId);
    } catch (error) {
      console.log("Error al crear las columnas:", error);
    }
  };

  const updateStatusLabels = async (boardId, statusValues) => {
    const doneLabel = statusValues.find(value => value === 'Done');
    const stuckLabel = statusValues.find(value => value === 'Stuck');
    const workingLabel = statusValues.find(value => value === 'Working on it');

    if (doneLabel) {
      await monday.api(`mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: "${doneLabel}",
          column_id: "estado",
          value: "{\"label\": \"Julio Durmiendo\"}"
        ) {
          id
        }
      }`);
    }

    if (stuckLabel) {
      await monday.api(`mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: "${stuckLabel}",
          column_id: "estado",
          value: "{\"label\": \"Fallido\"}"
        ) {
          id
        }
      }`);
    }

    if (workingLabel) {
      await monday.api(`mutation {
        change_column_value(
          board_id: ${boardId},
          item_id: "${workingLabel}",
          column_id: "estado",
          value: "{\"label\": \"Agendado\"}"
        ) {
          id
        }
      }`);
    }
  };

  const fetchColumnsAndItems = (boardId) => {
    setIsLoading(true);
    monday.api(`query {
      boards(ids: ${boardId}) {
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
      const statusColumn = board.columns.find(column => column.settings_str && column.settings_str.includes('status'));
      const statusValues = statusColumn?.settings_str?.match(/"label":"(.*?)"/g)?.map(value => value.match(/"label":"(.*?)"/)?.[1]) || [];
      board.statusValues = statusValues; // Agregar los estados al objeto board
      setBoardData(board);
      setIsLoading(false);
      console.log(board);

      // Actualizar los valores de etiquetas
      updateStatusLabels(boardId, statusValues);
    }).catch(error => {
      console.log(error);
      setIsLoading(false);
    });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setTokenValue(tokenInput);
    fetchColumnsAndItems(inputValue);
  }

  const handleTokenChange = (event) => {
    setTokenInput(event.target.value);
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
                  <label htmlFor="token">API Token:</label>
                  <input
                    type="text"
                    id="token"
                    value={tokenInput}
                    onChange={handleTokenChange}
                  />
                  <button type="submit">Actualizar</button>
                </form>
                <h3>Nombre del board: {boardData.name}</h3>
                <h3>Items:</h3>
                <ul>
                  {boardData.items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
                {boardData.statusValues && (
                  <div>
                    <h3>Estados:</h3>
                    <ul>
                      {boardData.statusValues.map((status) => (
                        <li key={status}>{status}</li>
                      ))}
                    </ul>
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
