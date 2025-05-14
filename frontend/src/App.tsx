import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./lib/home/HomePage.tsx";
import About from "./about/About.tsx";
import './App.css';
import {UserContext} from "./user-context.ts";
import {useState} from "react";
import {User, UserService} from "./lib/auth/user.service.ts";
import Authentication from "./lib/auth/Authentication.component.tsx";

export default function App() {
    const [user, setUser] = useState(User.ANONYMOUS);
    const userService = new UserService(user, setUser);
    const basename = import.meta.env.VITE_PUBLIC_BASE_PATH || '/';
    return (
        <UserContext.Provider value={user}>
            <BrowserRouter basename={basename}>
                <div className="app-container">
                    <div className="flex">
                        <div className="m-auto"></div>
                        <div className="m-auto"></div>
                        <div className="m-3"></div>
                        <div className="mt-2">
                            <Authentication onLogin={() => userService.refresh(user, setUser)}/>
                        </div>
                    </div>
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/about" element={<About/>}/>
                    </Routes>
                </div>
            </BrowserRouter>
        </UserContext.Provider>
    );
}