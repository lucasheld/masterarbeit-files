import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormLabel,
    Grid,
    TextField
} from "@mui/material";
import React, {useRef} from "react";
import MultiChipInputComponent from "./MultiChipInputComponent";
import SelectServicesComponent from "./SelectServicesComponent";
import {useStoreDialogs} from "../store";
import {Controller, useForm} from "react-hook-form";

const ClientDialog = () => {
    const open = useStoreDialogs(state => state.open);
    const props = useStoreDialogs(state => state.props);
    const closeDialog = useStoreDialogs(state => state.closeDialog);

    const {control, handleSubmit} = useForm({
        defaultValues:
            props.client ?
                {
                    ...props.client,
                    services: props.client.services.map(service => ({
                        ...service,
                        rules: service.rules ?
                            service.rules.map(rule => ({
                                ...rule,
                                ports: rule.ports ?
                                    rule.ports.map(port => port.toString())
                                    : []
                            }))
                            : [],
                        allowed_tags: service.allowed_tags ? service.allowed_tags : []
                    })),
                    subnet: props.client.subnet ? props.client.subnet : 0
                } :
                {
                    title: "",
                    public_key: "",
                    tags: [],
                    services: [],
                    subnet: 0
                }
    });

    const onSubmit = data => {
        props.handleOk(data);
        closeDialog();
    };

    const formRef = useRef(null);

    const getClientAllowedIpsHost = () => {
        if (props.client?.allowed_ips) {
            let ipWithoutSubnetMask = props.client.allowed_ips[0].split("/")[0];
            let ipParts = ipWithoutSubnetMask.split('.', -1);
            if (!ipParts) {
                ipParts = ipWithoutSubnetMask.split(':', -1);
            }
            return ipParts[ipParts.length-1];
        }
        return "X";
    }

    const allowedIpsHost = getClientAllowedIpsHost();

    return (
        <Dialog
            open={open}
            onClose={closeDialog}
            fullWidth
        >
            <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                <DialogTitle id="alert-dialog-title">
                    {props.title}
                </DialogTitle>
                <DialogContent dividers>
                    <Controller
                        name="title"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                required
                                autoFocus
                                margin="dense"
                                label="Title"
                                type="text"
                                fullWidth
                                disabled={props.disabled}
                            />
                        )}
                    />
                    <Controller
                        name="public_key"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                required
                                margin="dense"
                                label="Public Key"
                                type="text"
                                fullWidth
                                disabled={props.disabled}
                            />
                        )}
                    />
                    <Box
                        component="fieldset"
                        sx={{borderRadius: "4px", margin: 0, borderColor: "white"}}
                    >
                        <FormLabel
                            component="legend"
                            sx={{fontSize: "15px", padding: "revert"}}
                        >
                            Interface Address
                        </FormLabel>
                        <Grid
                            container
                            spacing={2}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Grid item xs={6}>
                                <TextField
                                    margin="dense"
                                    type="text"
                                    fullWidth
                                    disabled
                                    value="10.0."
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Controller
                                    name="subnet"
                                    control={control}
                                    render={({field}) => (
                                        <TextField
                                            {...field}
                                            required
                                            margin="dense"
                                            label="Subnet"
                                            type="number"
                                            fullWidth
                                            disabled={props.disabled}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    margin="dense"
                                    type="text"
                                    fullWidth
                                    disabled
                                    value={`.${allowedIpsHost}`}
                                />
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={2}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Grid item xs={6}>
                                <TextField
                                    margin="dense"
                                    type="text"
                                    fullWidth
                                    disabled
                                    value="fdc9:281f:4d7:9ee9::"
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Controller
                                    name="subnet"
                                    control={control}
                                    render={({field}) => (
                                        <TextField
                                            {...field}
                                            required
                                            margin="dense"
                                            label="Subnet"
                                            type="number"
                                            fullWidth
                                            disabled
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    margin="dense"
                                    type="text"
                                    fullWidth
                                    disabled
                                    value={`.${allowedIpsHost}`}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <Controller
                        name="tags"
                        control={control}
                        render={({field}) => (
                            <MultiChipInputComponent
                                {...field}
                                id="tags"
                                title="Tags"
                                disabled={props.disabled}
                            />
                        )}
                    />
                    <Box my={2}>
                        <Divider/>
                    </Box>
                    <Controller
                        name="services"
                        control={control}
                        render={({field}) => (
                            <SelectServicesComponent
                                {...field}
                                disabled={props.disabled}
                            />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        onClick={closeDialog}
                    >
                        Cancel
                    </Button>
                    {
                        props.customDialogActions ?
                            props.customDialogActions :
                            <Button
                                color="primary"
                                type="submit"
                            >
                                Ok
                            </Button>
                    }
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ClientDialog;
