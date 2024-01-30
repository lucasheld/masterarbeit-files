import {useStoreApi, useStoreDialogs} from "../store";
import {IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import React from "react";

const UserComponent = (props) => {
    const openUserDialog = useStoreDialogs(state => state.openUserDialog);
    const openConfirmationDialog = useStoreDialogs(state => state.openConfirmationDialog);

    const editUser = useStoreApi(state => state.editUser);
    const deleteUser = useStoreApi(state => state.deleteUser);

    return (
        <React.Fragment>
            <List
                disablePadding
            >
                <ListItem
                    disablePadding
                    key={`listitem-${props.user.id}`}
                    secondaryAction={
                        <React.Fragment>
                            <Tooltip
                                title="Edit user"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openUserDialog({
                                            user: props.user,
                                            edit: true,
                                            handleOk: async body => {
                                                await editUser(props.user.id, body);
                                            }
                                        });
                                    }}
                                >
                                    <Edit/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Delete user"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openConfirmationDialog({
                                            title: "Delete user",
                                            content: `Are you sure you want to delete the user "${props.user.username}"?`,
                                            handleOk: () => deleteUser(props.user.id)
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
                        disabled
                        style={{
                            opacity: 1
                        }}
                    >
                        <ListItemText
                            id={`label-${props.user.id}`}
                            primary={props.user.username}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </React.Fragment>
    );
};

export default UserComponent;
