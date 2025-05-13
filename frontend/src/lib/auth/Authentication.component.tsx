import Logout from "./Logout.tsx";
import {useUserContext} from "../../user-context.ts";
import Login from "./Login.tsx";


interface AuthenticationProperties {
    onLogin: (eventData: Record<string, never>) => void;
}

export default function Authentication({onLogin}: AuthenticationProperties) {
    const user = useUserContext();
    return (
        <span>
            {!user.isAuthenticated ?
                (<Login onLogin={onLogin}></Login>) :
                (<Logout></Logout>)}
        </span>
    );
}