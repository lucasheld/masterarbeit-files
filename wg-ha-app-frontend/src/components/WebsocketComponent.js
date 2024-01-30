import {useEffect} from "react";
import io from "socket.io-client";
import {
    useStoreClients,
    useStoreClientsApplied,
    useStoreCustomRules,
    useStoreKeycloak,
    useStoreSettings,
    useStoreTasks
} from "../store";

const WebsocketComponent = () => {
    const setClients = useStoreClients(state => state.setClients);
    const addClient = useStoreClients(state => state.addClient);
    const editClient = useStoreClients(state => state.editClient);
    const deleteClient = useStoreClients(state => state.deleteClient);

    const setCustomRules = useStoreCustomRules(state => state.setCustomRules);
    const addCustomRule = useStoreCustomRules(state => state.addCustomRule);
    const editCustomRule = useStoreCustomRules(state => state.editCustomRule);
    const deleteCustomRule = useStoreCustomRules(state => state.deleteCustomRule);

    const setClientsApplied = useStoreClientsApplied(state => state.setClientsApplied);

    const setSettings = useStoreSettings(state => state.setSettings);

    const addOrEditTask = useStoreTasks(state => state.addOrEditTask);
    const editTaskOutput = useStoreTasks(state => state.editTaskOutput);

    const token = useStoreKeycloak(state => state.token);

    useEffect(() => {
        const socket = io("http://127.0.0.1:5000", {
            extraHeaders: {
                "Authorization": `Bearer ${token}`
            }
        });

        socket.on("connect", r => {

        });

        socket.on("disconnect", r => {

        });


        socket.on("setClients", r => {
            setClients(r);
        });

        socket.on("addClient", r => {
            addClient(r);
        });

        socket.on("editClient", r => {
            editClient(r);
        });

        socket.on("deleteClient", r => {
            deleteClient(r);
        });


        socket.on("setCustomRules", r => {
            setCustomRules(r);
        });

        socket.on("addCustomRule", r => {
            addCustomRule(r);
        });

        socket.on("editCustomRule", r => {
            editCustomRule(r);
        });

        socket.on("deleteCustomRule", r => {
            deleteCustomRule(r);
        });


        socket.on("setClientsApplied", r => {
            setClientsApplied(r);
        });


        socket.on("setSettings", r => {
            setSettings(r);
        });


        [
            "task-sent",
            "task-received",
            "task-started",
            "task-succeeded",
            "task-failed",
            "task-rejected",
            "task-revoked",
            "task-retried"
        ].forEach(e => {
            socket.on(e, r => {
                addOrEditTask(r);
            });
        });

        socket.on("task-progress", r => {
            editTaskOutput(r);
        });


        socket.onAny((event, data) => {
            console.log({event, data});
        });

        return () => {
            [
                "connect",
                "disconnect",
                "setClients",
                "addClient",
                "editClient",
                "deleteClient",
                "setClientsApplied",
                "setSettings",
                "setCustomRules",
                "addCustomRule",
                "editCustomRule",
                "deleteCustomRule",
                "task-sent",
                "task-received",
                "task-started",
                "task-succeeded",
                "task-failed",
                "task-rejected",
                "task-revoked",
                "task-retried",
                "task-progress",
            ].forEach(e => {
                socket.off(e);
            });

            socket.offAny();
        };
    }, []);

    return null;
};

export default WebsocketComponent;
