import {interval, Subscription} from 'rxjs';
import type {Dispatch, SetStateAction} from "react";
import axios from "axios";

interface UserinfoDto {
    name: string;
    email: string;
    authorities: string[];
    exp: number;
}

export class User {
    static readonly ANONYMOUS = new User("", "", []);

    public name: string;
    public email: string;
    public roles: string[];

    constructor(name: string, email: string, roles: string[]) {
        this.name = name;
        this.email = email;
        this.roles = roles;
    }

    get isAuthenticated(): boolean {
        return !!this.name;
    }

     isAdmin(): boolean {
        for (const role of this.roles) {
            if (role === 'ROLE_ADMIN') {
                return true;
            }
        }
        return false;
    }
}

export class UserService {
    private refreshSub?: Subscription;

    constructor(user: User, setUser: Dispatch<SetStateAction<User>>) {
        this.refresh(user, setUser).catch(error => {
            console.error("error while refreshing:", error);
        });
    }

    async refresh(user: User, setUser: Dispatch<SetStateAction<User>>): Promise<void> {
        this.refreshSub?.unsubscribe();
        const response = await axios.get<UserinfoDto>('/bff/api/servlet/me');
        if (response.data.name !== user.name ||
            response.data.email !== user.email ||
            (response.data.authorities || []).toString() !== user.roles.toString()) {
            setUser(response.data.name ? new User(response.data.name, response.data.email, response.data.authorities) : User.ANONYMOUS);
        }

        if (response.data.exp) {
            const now = Date.now();
            const delay = (1000 * response.data.exp - now) * 0.8;
            if (delay > 2000) {
                this.refreshSub = interval(delay).subscribe(() =>
                    this.refresh(user, setUser)
                );
            }
        }
    }
}