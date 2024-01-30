import React from "react";
import {IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip} from "@mui/material";
import {Autorenew, Close, Delete, Done, Edit} from "@mui/icons-material";
import {useStoreApi, useStoreClients, useStoreClientsApplied, useStoreDialogs, useStoreKeycloak} from "../store";
import {userNameById} from "../utils";

const ClientComponent = (props) => {
    const openClientDialog = useStoreDialogs(state => state.openClientDialog);
    const openConfirmationDialog = useStoreDialogs(state => state.openConfirmationDialog);
    const openWireGuardConfigDialog = useStoreDialogs(state => state.openWireGuardConfigDialog);

    const clients = useStoreClients(state => state.clients);

    const clientsApplied = useStoreClientsApplied(state => state.clientsApplied);

    const editClient = useStoreApi(state => state.editClient);
    const deleteClient = useStoreApi(state => state.deleteClient);

    const users = useStoreKeycloak(state => state.users);

    const clientAndClientAppliedMatch = () => {
        // compare client and clientApplied and ignore id, title values
        const client = {
            ...clients.find(client => client.public_key === props.client.public_key),
            id: null,
            title: null
        };
        const clientApplied = {
            ...clientsApplied.find(client => client.public_key === props.client.public_key),
            id: null,
            title: null
        };

        let clientJson = JSON.stringify(client, Object.keys(client).sort());
        let clientAppliedJson = JSON.stringify(clientApplied, Object.keys(clientApplied).sort());

        return clientJson === clientAppliedJson;
    };

    const clientApplied = clientAndClientAppliedMatch();

    return (
        <React.Fragment>
            <List
                disablePadding
            >
                <ListItem
                    disablePadding
                    key={`listitem-${props.client.id}`}
                    secondaryAction={
                        <React.Fragment>
                            <Tooltip
                                title="Edit client"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openClientDialog({
                                            title: "Edit client",
                                            client: props.client,
                                            handleOk: async body => {
                                                await editClient(props.client.id, body);
                                            }
                                        });
                                    }}
                                >
                                    <Edit/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Delete client"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openConfirmationDialog({
                                            title: "Delete client",
                                            content: `Are you sure you want to delete the client "${props.client.title}"?`,
                                            handleOk: () => deleteClient(props.client.id)
                                        });
                                    }}
                                >
                                    <Delete/>
                                </IconButton>
                            </Tooltip>
                        </React.Fragment>
                    }
                >
                    <ListItemButton
                        onClick={() => {
                            props.client.permitted === "ACCEPTED" &&
                            openWireGuardConfigDialog({
                                client: props.client
                            });
                        }}
                    >
                        <ListItemIcon>
                            {
                                props.client.permitted === "DECLINED" ?
                                    <Tooltip
                                        title="Client declined"
                                    >
                                        <Close/>
                                    </Tooltip> :
                                    clientApplied ?
                                        <Tooltip
                                            title={`Client ready to use`}
                                        >
                                            <Done/>
                                        </Tooltip> :
                                        <Tooltip
                                            title={`${props.client.permitted === "PENDING" ? "Client review pending" : "Client is being configured"}`}
                                        >
                                            <Autorenew/>
                                        </Tooltip>
                            }
                        </ListItemIcon>
                        <ListItemText
                            id={`label-${props.client.id}`}
                            primary={props.client.title}
                            secondary={props.mode === "all" && `Owner: ${userNameById(users, props.client.user_id)}`}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </React.Fragment>
    );
};

export default ClientComponent;
