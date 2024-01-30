import {create} from "zustand";
import {
    CLIENT_DIALOG,
    CONFIRMATION_DIALOG,
    CUSTOM_RULE_DIALOG,
    SETTINGS_DIALOG,
    WIREGUARD_CONFIG_DIALOG
} from "./components/DialogsComponent";
import {ansibleApiUrl, flowerApiUrl} from "./utils";

const sortTasks = tasks => {
    return tasks.sort((a, b) => parseFloat(b.received) - parseFloat(a.received));
};

export const useStore = create((setStore, getStore) => ({
    keycloak: create((set, get) => ({
        keycloak: null,
        token: "",
        roles: [],
        userId: "",
        users: [],
        setKeycloak: keycloak => {
            set({
                keycloak: keycloak
            });
        },
        setToken: token => {
            set({
                token: token
            });
        },
        setRoles: roles => {
            set({
                roles: roles
            });
        },
        setUserId: userId => {
            set({
                userId: userId
            });
        },
        loadUsers: () => {
            let roles = get().roles;
            if (roles.includes("app-admin")) {
                let token = get().token;
                let realm = get().keycloak.realm;
                const requestOptions = {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                };
                fetch(`http://127.0.0.1:8080/admin/realms/${realm}/users`, requestOptions)
                    .then(r => r.json())
                    .then(r => {
                        set({
                            users: r
                        });
                    });
            }
        },
        logout: () => {
            get().keycloak.logout({
                redirectUri: "http://127.0.0.1:3000"
            });
        }
    })),
    dialogs: create((set, get) => ({
        open: false,
        type: null,
        props: {},
        openDialog: (type, props) => {
            set({
                open: true,
                type: type,
                props: props
            });
        },
        openConfirmationDialog: props => get().openDialog(CONFIRMATION_DIALOG, props),
        openClientDialog: props => get().openDialog(CLIENT_DIALOG, props),
        openWireGuardConfigDialog: props => get().openDialog(WIREGUARD_CONFIG_DIALOG, props),
        openSettingsDialog: props => get().openDialog(SETTINGS_DIALOG, props),
        openCustomRuleDialog: props => get().openDialog(CUSTOM_RULE_DIALOG, props),
        closeDialog: () => {
            set({
                open: false,
                type: null
            });
        }
    })),
    clientsApplied: create((set, get) => ({
        clientsApplied: [],
        setClientsApplied: clientsApplied => {
            set({
                clientsApplied: clientsApplied
            });
        },
    })),
    clients: create((set, get) => ({
        clients: [],
        setClients: clients => {
            set({
                clients: clients
            });
        },
        addClient: client => {
            set({
                clients: [...get().clients, client]
            });
        },
        editClient: client => {
            set({
                clients: get().clients.map(i => i.id === client.id ? client : i)
            });
        },
        deleteClient: clientId => {
            set({
                clients: get().clients.filter(i => i.id !== clientId)
            });
        }
    })),
    tasks: create((set, get) => ({
        tasks: [],
        error: "",
        loaded: false,
        loadTasks: () => {
            const url = `${flowerApiUrl}/tasks`;
            fetch(url)
                .then(res => res.json())
                .then(taskList => {
                    let taskIds = Object.keys(taskList);
                    let tasks = [];
                    for (let taskId of taskIds) {
                        let task = taskList[taskId];
                        if (task.received) {
                            tasks.push(task);
                        }
                    }
                    tasks = sortTasks(tasks);
                    set({
                        tasks,
                        error: ""
                    });
                })
                .catch(error => {
                    console.log(error);
                    set({
                        error: error,
                        tasks: []
                    });
                })
                .finally(() => {
                    set({
                        loaded: true
                    });
                });
        },
        addOrEditTask: task => {
            let tasks = [];
            let edited = false;
            get().tasks.forEach(t => {
                if (t.uuid === task.uuid) {
                    tasks.push({
                        ...task,
                        output: t.output
                    });
                    edited = true;
                } else {
                    tasks.push(t);
                }
            });
            if (!edited) {
                tasks.push(task);
            }
            tasks = sortTasks(tasks);
            set({
                tasks: tasks
            });
        },
        editTaskOutput: task => {
            set({
                tasks: get().tasks.map(i => i.uuid === task.uuid ? {...i, output: task.output} : i)
            });
        }
    })),
    api: create((set, get) => ({
        addClient: body => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/client`,
                requestOptions,
                "Client added"
            );
        },
        editClient: (clientId, body) => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/client/${clientId}`,
                requestOptions,
                "Client edited"
            );
        },
        editClientReview: (clientId, body) => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/client/${clientId}/review`,
                requestOptions,
                "Client edited"
            );
        },
        getWireGuardConfig: clientId => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/client/${clientId}/config`,
                requestOptions
            );
        },
        getPlaybookOutput: taskId => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/playbook/${taskId}`,
                requestOptions
            );
        },
        cancelTask: taskId => {
            const requestOptions = {
                method: "POST"
            };
            return get().requestAndNotify(
                `${flowerApiUrl}/task/revoke/${taskId}?terminate=true`,
                requestOptions,
                "Task canceled"
            );
        },
        deleteClient: clientId => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/client/${clientId}`,
                requestOptions,
                "Client deleted"
            );
        },
        requestAndNotify: (url, requestOptions, successMessage) => {
            return new Promise(resolve => {
                fetch(url, requestOptions)
                    .then(response => {
                        if (!response.ok) {
                            throw response;
                        }
                        return response;
                    })
                    .then(async response => {
                        const text = await response.text();
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            return text;
                        }
                    })
                    .then(response => {
                        if (successMessage) {
                            getStore().notification.getState().addSuccessNotification(successMessage);
                        }
                        resolve(response);
                    })
                    .catch(async error => {
                        let message;
                        try {
                            let text = await error.text();
                            message = JSON.parse(text).message;
                        } catch (e) {
                            message = error.message;
                        }
                        getStore().notification.getState().addErrorNotification(message);
                    });
            });
        },
        setSettings: body => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/settings`,
                requestOptions,
                "Settings edited"
            );
        },
        addCustomRule: body => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/custom-rule`,
                requestOptions,
                "Custom rule added"
            );
        },
        editCustomRule: (customRuleId, body) => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body)
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/custom-rule/${customRuleId}`,
                requestOptions,
                "Custom rule edited"
            );
        },
        deleteCustomRule: customRuleId => {
            const token = getStore().keycloak.getState().token;
            const requestOptions = {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            return get().requestAndNotify(
                `${ansibleApiUrl}/custom-rule/${customRuleId}`,
                requestOptions,
                "Custom rule deleted"
            );
        },
    })),
    notification: create((set, get) => ({
        notifications: [],
        open: false,
        message: "",
        severity: "success",
        addNotification: (message, severity) => {
            let notification = {
                open: true,
                message: message,
                severity: severity
            };
            set({
                notifications: [...get().notifications, notification]
            });
        },
        addSuccessNotification: message => get().addNotification(message, "success"),
        addErrorNotification: message => get().addNotification(message, "error"),
        clearNotification: message => {
            set({
                notifications: get().notifications.filter(i => i.message !== message)
            });
        },
    })),
    settings: create(set => ({
        settings: {
            review: false,
            server: {
                address: [],
                private_key: "",
                endpoint: ""
            }
        },
        setSettings: settings => {
            set({
                settings: settings
            });
        },
    })),
    customRules: create((set, get) => ({
        customRules: [],
        setCustomRules: customRules => {
            set({
                customRules: customRules
            });
        },
        addCustomRule: customRule => {
            set({
                customRules: [...get().customRules, customRule]
            });
        },
        editCustomRule: customRule => {
            set({
                customRules: get().customRules.map(i => i.id === customRule.id ? customRule : i)
            });
        },
        deleteCustomRule: customRuleId => {
            set({
                customRules: get().customRules.filter(i => i.id !== customRuleId)
            });
        }
    })),
}));

export const useStoreKeycloak = state => useStore(s => s.keycloak(state));
export const useStoreDialogs = state => useStore(s => s.dialogs(state));
export const useStoreClientsApplied = state => useStore(s => s.clientsApplied(state));
export const useStoreClients = state => useStore(s => s.clients(state));
export const useStoreTasks = state => useStore(s => s.tasks(state));
export const useStoreApi = state => useStore(s => s.api(state));
export const useStoreNotification = state => useStore(s => s.notification(state));
export const useStoreSettings = state => useStore(s => s.settings(state));
export const useStoreCustomRules = state => useStore(s => s.customRules(state));
