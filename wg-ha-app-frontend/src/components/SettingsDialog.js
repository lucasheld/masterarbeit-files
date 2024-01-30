import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    List,
    ListItem,
    ListSubheader,
    TextField,
    Typography
} from "@mui/material";
import {useRef} from "react";
import {useStoreApi, useStoreDialogs, useStoreSettings} from "../store";
import {Controller, useForm} from "react-hook-form";

const SettingsDialog = () => {
    const open = useStoreDialogs(state => state.open);
    const closeDialog = useStoreDialogs(state => state.closeDialog);

    const settings = useStoreSettings(state => state.settings);
    const setSettings = useStoreApi(state => state.setSettings);

    const {control, handleSubmit} = useForm({
        defaultValues: {...settings}
    });

    const onSubmit = data => {
        setSettings(data);
        closeDialog();
    };

    const formRef = useRef(null);

    return (
        <Dialog
            open={open}
            onClose={closeDialog}
            fullWidth
        >
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle id="alert-dialog-title">
                    Edit settings
                </DialogTitle>
                <DialogContent
                    dividers
                    sx={{paddingX: "8px"}}
                >
                    <List
                        subheader={
                            <ListSubheader>
                                <Typography sx={{fontWeight: 'bold'}}>
                                    General
                                </Typography>
                            </ListSubheader>
                        }
                    >
                        <ListItem>
                            <FormControlLabel
                                control={
                                    <Controller
                                        name="review"
                                        control={control}
                                        render={({field}) => (
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={e => field.onChange(e.target.checked)}
                                            />
                                        )}
                                    />
                                }
                                label="Enable client review"
                            />
                        </ListItem>
                    </List>
                    <List
                        subheader={
                            <ListSubheader>
                                <Typography sx={{fontWeight: 'bold'}}>
                                    WireGuard server interface
                                </Typography>
                            </ListSubheader>
                        }
                    >
                        <ListItem>
                            <Controller
                                name="server.private_key"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        required
                                        margin="dense"
                                        label="Private Key"
                                        type="text"
                                        fullWidth
                                    />
                                )}
                            />
                        </ListItem>
                        <ListItem>
                            <Controller
                                name="server.endpoint"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        required
                                        margin="dense"
                                        label="Endpoint"
                                        type="text"
                                        fullWidth
                                    />
                                )}
                            />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={closeDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        type="submit"
                    >
                        Ok
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default SettingsDialog;
