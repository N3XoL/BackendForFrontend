import axios from "axios";

export default function Logout() {
    async function onClick() {
        try {
            const response = await axios.post("/bff/logout");
            window.location.href = response.headers['location'] || '/';
        } catch (error) {
            console.error("Error while logging out:", error);
        }
    }

    return (
        <button type="button" onClick={onClick}>
            Logout
        </button>
    );
}