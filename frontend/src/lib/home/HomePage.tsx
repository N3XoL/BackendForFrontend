import {useUserContext} from "../../user-context.ts";
import {Link} from "react-router-dom";

export default function HomePage() {
    const currentUser = useUserContext();
    const message = currentUser.isAuthenticated ? (
        <>
            <p>Hello <strong>{currentUser.name}</strong>!</p>
            {currentUser.roles && currentUser.roles.length > 0 ? (
                <>
                    <div className="mt-6"></div>
                    <p>Your roles are:</p>
                    <ul>
                        {currentUser.roles.map((role, index) => (
                            <li key={index} className="text-left">- {role}</li>
                        ))}
                    </ul>
                </>
            ) : <p>You don't have any roles.</p>
            }
        </>
    ) : (
        "You are not authenticated."
    );

    return (
        <main className="min-h-screen">
            <h1 className="mt-2">Starter website for bff!</h1>
            <div className="flex flex-col items-center justify-between p-24">
                <div className="flex gap-4">
                    <Link to="/about">About</Link>
                    <span>|</span>
                    <a href="/bff/api/servlet/me">Secured Resource</a>
                </div>
                <div className="mt-6"></div>
                <div>{message}</div>
            </div>
        </main>
    );
}