import React from "react";
import {IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {useStoreApi, useStoreDialogs} from "../store";

const CustomRuleComponent = (props) => {
    const openCustomRuleDialog = useStoreDialogs(state => state.openCustomRuleDialog);
    const openConfirmationDialog = useStoreDialogs(state => state.openConfirmationDialog);

    const editCustomRule = useStoreApi(state => state.editCustomRule);
    const deleteCustomRule = useStoreApi(state => state.deleteCustomRule);

    return (
        <React.Fragment>
            <List
                disablePadding
            >
                <ListItem
                    disablePadding
                    key={`listitem-${props.customRule.id}`}
                    secondaryAction={
                        <React.Fragment>
                            <Tooltip
                                title="Edit custom rule"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openCustomRuleDialog({
                                            title: "Edit custom rule",
                                            customRule: props.customRule,
                                            handleOk: async body => {
                                                await editCustomRule(props.customRule.id, body);
                                            }
                                        });
                                    }}
                                >
                                    <Edit/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                title="Delete custom rule"
                            >
                                <IconButton
                                    edge="end"
                                    onClick={() => {
                                        openConfirmationDialog({
                                            title: "Delete custom rule",
                                            content: `Are you sure you want to delete the custom rule "${props.customRule.title}"?`,
                                            handleOk: () => deleteCustomRule(props.customRule.id)
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
                            id={`label-${props.customRule.id}`}
                            primary={props.customRule.title}
                            secondary={`${props.customRule.type} ${props.customRule.src} -> ${props.customRule.dst} ${props.customRule.protocol} ${props.customRule.port}`}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </React.Fragment>
    );
};

export default CustomRuleComponent;
