type accountStatus = "active" | "inactive";
type userType = "admin" | "user";

interface Account {
    _id: string;
    status: accountStatus;
    userType: userType;
    pseudonym: string;
    email: string;
    password: string;
}

export default Account;
