const localUsers = new Map();

export const saveLocalUser = (user) => {
    localUsers.set(String(user._id), { ...user });
    return user;
};

export const getLocalUserById = (id) => {
    return localUsers.get(String(id)) || null;
};

export const getLocalUserByEmail = (email) => {
    const normalizedEmail = String(email || '').toLowerCase();

    for (const user of localUsers.values()) {
        if (String(user.email || '').toLowerCase() === normalizedEmail) {
            return user;
        }
    }

    return null;
};
