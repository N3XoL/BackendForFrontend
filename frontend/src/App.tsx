import {BrowserRouter, Route, Routes} from "react-router-dom";
import HomePage from "./features/home/HomePage.tsx";
import About from "./features/about/About.tsx";
import '@/styles/components/app.css';
import {UserContext} from "./store/user-context.ts";
import {useState} from "react";
import {User, UserService} from "./services/user.service.ts";
import Authentication from "./features/auth/components/Authentication.tsx";

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