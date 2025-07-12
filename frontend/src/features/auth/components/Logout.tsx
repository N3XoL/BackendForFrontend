import axios from "axios";

export default function Logout() {
    async function onClick() {
        try {
            const response = await axios.post("/bff/logout", null, {
                headers: {
                    'X-Post-Logout-Redirect-Uri': window.location.href
                }
            });
            window.location.href = response.request.responseURL || '/react-ui';
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