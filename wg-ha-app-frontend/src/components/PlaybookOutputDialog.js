import {useEffect} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography} from "@mui/material";
import {parseTaskDatetime} from "../utils";
import {useStoreApi, useStoreTasks} from "../store";

const PlaybookOutputDialog = (props) => {
    const tasks = useStoreTasks(state => state.tasks);
    const editTaskOutput = useStoreTasks(state => state.editTaskOutput);

    const task = tasks.find(task => task.uuid === props.task.uuid);

    const getPlaybookOutput = useStoreApi(state => state.getPlaybookOutput);

    useEffect(() => {
        if (props.isOpen) {
            getPlaybookOutput(props.task.uuid)
                .then(response => {
                    let taskOutput = response.output;

                    // set task output if not already updated by websocket events
                    if (!task.output) {
                        editTaskOutput({
                            uuid: task.uuid,
                            output: taskOutput
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, [props.isOpen]);

    return (
        <Dialog
            open={props.isOpen}
            onClose={props.handleClose}
            scroll="paper"
            fullWidth
            maxWidth="md"
        >
            <DialogTitle id="scroll-dialog-title">Playbook output</DialogTitle>
            <DialogContent dividers>
                <DialogContentText>
                    <Typography component="span">
                        Started: {parseTaskDatetime(props.task)}
                    </Typography>
                    <br/>
                    <Typography component="span">
                        State: {props.task.state}
                    </Typography>
                    <br/>
                    {task.output && <br/>}
                </DialogContentText>
                <Typography component="span" variant="body1" style={{whiteSpace: "pre-line"}}>
                    {task.output || ""}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PlaybookOutputDialog;
