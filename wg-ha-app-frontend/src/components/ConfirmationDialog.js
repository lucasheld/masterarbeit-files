import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {useStoreDialogs} from "../store";

const ConfirmationDialog = () => {
    const open = useStoreDialogs(state => state.open);
    const props = useStoreDialogs(state => state.props);
    const closeDialog = useStoreDialogs(state => state.closeDialog);

    const handleOk = () => {
        props.handleOk();
        closeDialog();
    };

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={closeDialog}
            onKeyDown={event => {
                if (event.key === "Enter") {
                    handleOk();
                }
            }}
        >
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{props.content}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="inherit"
                    onClick={closeDialog}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={handleOk}
                >
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
