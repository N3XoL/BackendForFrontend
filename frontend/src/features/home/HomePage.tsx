import {useUserContext} from "@/store/user-context.ts";
import {Link} from "react-router-dom";
import {type FormEvent, useState} from "react";
import axios from "axios";

interface EntityDto {
    id: number;
    entityKey: string;
    entityValue: string;
}

export default function HomePage() {
    const currentUser = useUserContext();
    const [responseMessage, setResponseMessage] = useState("");
    const [entityKey, setEntityKey] = useState("");
    const [entityValue, setEntityValue] = useState("");
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setResponseMessage("Submitting...");
        try {
            const response = await axios.post<EntityDto>("/bff/api/reactive/create", {entityKey, entityValue});
            setResponseMessage(`Entity created successfully! ID=${response.data.id}`);
            setEntityKey("");
            setEntityValue("");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setResponseMessage(`Error while creating entity: ${error.message}`);
            } else {
                setResponseMessage("Something went wrong!");
            }
            setEntityKey("");
            setEntityValue("");
        }
    };

    return (
        <main className="min-h-screen">
            <h1 className="mt-2">Starter website for bff!</h1>
            <div className="flex flex-col items-center justify-between p-24">
                <div className="flex gap-4">
                    <Link to="/about">About</Link>
                    {currentUser.isAuthenticated && (
                        <>
                            <span>|</span>
                            <a href="/bff/api/reactive/get-all" target="_blank">Get all entities</a>
                        </>
                    )}
                </div>
                <div className="mt-6"></div>
                <div>
                    {currentUser.isAuthenticated ? (
                    <>
                        <div className="flex flex-row gap-10">
                            <div className="flex-1 p-6 border-2 rounded-lg shadow-md">
                                <p className="text-xl mb-4">Hello <strong>{currentUser.name}</strong>!</p>
                                {currentUser.roles && currentUser.roles.length > 0 ? (
                                    <>
                                        <p className="font-medium mb-2">Your roles are:</p>
                                        <ul className=" rounded-md p-4">
                                            {currentUser.roles.map((role, index) => (
                                                <li key={index} className="text-left py-1 text-gray-300">- {role.substring("ROLE_".length, role.length).toUpperCase()}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : <p className="italic text-gray-400">You don't have any roles.</p>}
                            </div>
                            {currentUser.isAdmin ? (
                                <>
                                    <div className="flex-1 flex-col gap-4">
                                        <div className="text-2xl font-bold">Create Entity</div>
                                        <div className="flex-1 mt-4 border-2 p-8 rounded shadow-lg w-full max-w-2xl">
                                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                                <div className="text-xl font-semibold mb-4">Enter key:
                                                    <label htmlFor="entityKey" className="block text-sm font-medium text-white mb-0"/>
                                                    <input
                                                        type="text"
                                                        id="entityKey"
                                                        value={entityKey}
                                                        onChange={(e) => setEntityKey(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="text-xl font-semibold mb-4">Enter value:
                                                    <label htmlFor="entityValue" className="block text-sm font-medium text-white mb-0"/>
                                                    <input
                                                        type="text"
                                                        id="entityValue"
                                                        value={entityValue}
                                                        onChange={(e) => setEntityValue(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                >
                                                    Create
                                                </button>
                                                <p className={`mt-4 text-sm ${responseMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                                                    {responseMessage}
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </>
                            ) : <p className="italic text-white-900-400">You don't have admin rights to create entity</p>}
                        </div>
                    </>
                    ) : (
                    <p>You are not authenticated.</p>
                    )}
                </div>
            </div>
        </main>
    );
}