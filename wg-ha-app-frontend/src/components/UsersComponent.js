import {Alert, Fab, List, Paper, Tooltip} from "@mui/material";
import {Add} from "@mui/icons-material";
import {useStoreApi, useStoreDialogs, useStoreUsers} from "../store";
import React from "react";
import UserComponent from "./UserComponent";

const UsersComponent = () => {
    const openUserDialog = useStoreDialogs(state => state.openUserDialog);

    const users = useStoreUsers(state => state.users);

    const addUser = useStoreApi(state => state.addUser);

    return (
        <React.Fragment>
            {
                users.length === 0 ?
                    <Alert variant="outlined" severity="info">
                        No Users available
                    </Alert>
                    :
                    <Paper>
                        <List>
                            {
                                users.map(user =>
                                    <UserComponent
                                        key={user.id}
                                        user={user}
                                    />
                                )
                            }
                        </List>
                    </Paper>
            }

            <Tooltip title="Add User">
                <Fab
                    color="primary"
                    sx={{
                        position: "absolute",
                        bottom: theme => theme.spacing(2),
                        right: theme => theme.spacing(2)
                    }}
                    onClick={() => {
                        openUserDialog({
                            handleOk: async body => {
                                await addUser(body);
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

export default UsersComponent;
