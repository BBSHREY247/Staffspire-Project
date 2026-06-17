import { useState } from "react";
import Login from "./auth/Login";

function App() {

    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <header>
                
            </header>

            {
                isLogin
                    ? <Login switchPage={() => setIsLogin(false)} />
                    : <Register switchPage={() => setIsLogin(true)} />
            }

        </div>
    );
}

export default App;