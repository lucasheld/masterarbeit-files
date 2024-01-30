export const ansibleApiUrl = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;
export const flowerApiUrl = `http://${process.env.REACT_APP_FLOWER_HOST}:${process.env.REACT_APP_FLOWER_PORT}/api`;

export const parseTaskDatetime = task => {
    let locale = "de-DE";
    let dateObj = new Date(task.received * 1000);
    let date = dateObj.toLocaleDateString(locale);
    let time = dateObj.toLocaleTimeString(locale);
    return `${date} ${time}`;
};

export const userNameById = (users, userId) => {
    for (const usersKey in users) {
        const user = users[usersKey];
        if (user.id === userId) {
            return user.username;
        }
    }
    return userId;
};
