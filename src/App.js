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
      fetchData(newBoardId);
      createColumns(newBoardId, newItemId); // Crear las columnas y la automatización después de crear el board y el item
    }).catch(error => {
      console.log("Error al crear el board:", error);
      setIsLoading(false);
    });
  }

  const fetchData = (boardId) => {
    setIsLoading(true);
    monday.api(`query {
      boards(ids: ${boardId}) {
        id
        name
        items {
          id
          name
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

  const createColumns = async (newBoardId, newItemId) => {
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
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Julex",
            column_type: button
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Email Marketing",
            column_type: text
          ) {
            id
          }
        }`),
        monday.api(`mutation {
          create_column(
            board_id: ${newBoardId},
            title: "Fecha",
            column_type: date
          ) {
            id
          }
        }`)
      ];

      const responses = await Promise.all(createColumnPromises);

      const column1Id = responses[0].data.create_column.id;
      const column2Id = responses[1].data.create_column.id;
      const column3Id = responses[2].data.create_column.id;
      const column4Id = responses[3].data.create_column.id;
      const column5Id = responses[4].data.create_column.id;
      const fechaColumnId = responses[5].data.create_column.id;

      console.log("Nueva columna Teléfono creada:", column1Id);
      console.log("Nueva columna Email creada:", column2Id);
      console.log("Nueva columna Observaciones creada:", column3Id);
      console.log("Nueva columna Julex creada:", column4Id);
      console.log("Nueva columna Email Marketing creada:", column5Id);
      console.log("Nueva columna Fecha creada:", fechaColumnId);

      const currentDate = new Date().toISOString().split("T")[0];
      monday.api(`mutation {
        change_column_value(
          board_id: ${newBoardId},
          item_id: ${newItemId},
          column_id: ${fechaColumnId}, // ID de la columna "Fecha"
          value: "{\"date\":\"${currentDate}\"}"
        ) {
          id
        }
      }`).then(response => {
        console.log("Fecha actualizada en el item:", newItemId);
      }).catch(error => {
        console.log("Error al actualizar la fecha:", error);
      });
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
