import { API_URL } from "@/lib/constant";

class Endpoints {
    static BASE_URL = API_URL;
    static QUERY_URL = `${API_URL}/meta/query`;
    static AUTH_URL = `${API_URL}/auth`;
    static GET_AUTH_USERS = `${API_URL}/auth/users`;
    static CREATE_AUTH_USER = `${API_URL}/auth/users`;
    static UPDATE_AUTH_USER = `${API_URL}/auth/users`;
    static DELETE_AUTH_USER = `${API_URL}/auth/users`;
}
export default Endpoints;