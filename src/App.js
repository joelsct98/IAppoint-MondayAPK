import React, {useEffect, useState} from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";
import "monday-ui-react-core/dist/main.css";
import LoginForm from './LoginForm';
import julexImage from './julex.jpeg';

const monday = mondaySdk();

const App = () => {
    const [context, setContext] = useState();

    useEffect(() => {
        monday.execute("valueCreatedForUser");
        monday.listen("context", (res) => {
            setContext(res.data);
    });
  }, []);

  return (
      <div className="capa">
          <div className="popup">
              <img src={julexImage} alt="Julex"/>
              <h1>Accede a IAppoint</h1>
              <LoginForm/>
          </div>
      </div>
  );
};

export default App;
