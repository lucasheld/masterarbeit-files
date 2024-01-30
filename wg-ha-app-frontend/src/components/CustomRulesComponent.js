import React from "react";
import {useStoreApi, useStoreCustomRules, useStoreDialogs} from "../store";
import {Alert, Fab, List, Paper, Tooltip} from "@mui/material";
import CustomRuleComponent from "./CustomRuleComponent";
import {Add} from "@mui/icons-material";

const CustomRulesComponent = () => {
    const customRules = useStoreCustomRules(state => state.customRules);

    const openCustomRuleDialog = useStoreDialogs(state => state.openCustomRuleDialog);

    const addCustomRule = useStoreApi(state => state.addCustomRule);

    return (
        <React.Fragment>
            {
                customRules.length === 0 ?
                    <Alert variant="outlined" severity="info">
                        No Custom Rules available
                    </Alert>
                    :
                    <Paper>
                        <List>
                            {
                                customRules.map(customRule =>
                                    <CustomRuleComponent
                                        key={customRule.id}
                                        customRule={customRule}
                                    />
                                )
                            }
                        </List>
                    </Paper>
            }

            <Tooltip title="Add custom rule">
                <Fab
                    color="primary"
                    sx={{
                        position: "absolute",
                        bottom: theme => theme.spacing(2),
                        right: theme => theme.spacing(2)
                    }}
                    onClick={() => {
                        openCustomRuleDialog({
                            title: "Add custom rule",
                            handleOk: async (body) => {
                                await addCustomRule(body);
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

export default CustomRulesComponent;
