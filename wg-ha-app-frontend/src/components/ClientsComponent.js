import React from "react";
import {Alert, Fab, List, Paper, Tooltip} from "@mui/material";
import {Add} from "@mui/icons-material";
import {useStoreApi, useStoreClients, useStoreDialogs, useStoreKeycloak} from "../store";
import ClientComponent from "./ClientComponent";

const ClientsComponent = ({mode}) => {
    const openClientDialog = useStoreDialogs(state => state.openClientDialog);

    const allClients = useStoreClients(state => state.clients);

    const userId = useStoreKeycloak(state => state.userId);

    let clients;
    if (mode === "all") {
        clients = allClients;
    } else {
        clients = allClients.filter(c => c.user_id === userId);
    }

    const addClient = useStoreApi(state => state.addClient);

    return (
        <React.Fragment>
            {
                clients.length === 0 ?
                    <Alert variant="outlined" severity="info">
                        No Clients available
                    </Alert>
                    :
                    <Paper>
                        <List>
                            {
                                clients.map(client =>
                                    <ClientComponent
                                        key={client.id}
                                        client={client}
                                        mode={mode}
                                    />
                                )
                            }
                        </List>
                    </Paper>
            }

            <Tooltip title="Add Client">
                <Fab
                    color="primary"
                    sx={{
                        position: "absolute",
                        bottom: theme => theme.spacing(2),
                        right: theme => theme.spacing(2)
                    }}
                    onClick={() => {
                        openClientDialog({
                            title: "Add client",
                            handleOk: async (body) => {
                                await addClient(body);
                            }
                        });
                    }}
                >
                    <Add/>
                </Fab>
            </Tooltip>
        </React.Fragment>
    );
};

export default ClientsComponent;
