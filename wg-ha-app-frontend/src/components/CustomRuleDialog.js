import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import React, {useRef, useState} from "react";
import {useStoreDialogs} from "../store";
import {Controller, useForm} from "react-hook-form";

const CustomRuleDialog = () => {
    const [displayPorts, setDisplayPorts] = useState(false);

    const open = useStoreDialogs(state => state.open);
    const props = useStoreDialogs(state => state.props);
    const closeDialog = useStoreDialogs(state => state.closeDialog);

    const {watch, register, control, handleSubmit, formState: { errors }} = useForm({
        defaultValues:
            props.customRule ?
                {
                    ...props.customRule,
                    title: props.customRule.title ? props.customRule.title : "",
                    port: props.customRule.port ? props.customRule.port : ""
                } :
                {
                    title: "",
                    type: "",
                    src: "",
                    dst: "",
                    protocol: "",
                    port: ""
                }
    });

    // set displayPorts on component load
    React.useEffect(() => {
        if (props.customRule?.port) {
            setDisplayPorts(["tcp", "udp"].includes(props.customRule.protocol));
        }
    }, []);

    // set displayPorts on watch change
    React.useEffect(() => {
        const subscription = watch(value => {
            setDisplayPorts(["tcp", "udp"].includes(value.protocol))
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = data => {
        props.handleOk(data);
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
                    {props.title}
                </DialogTitle>
                <DialogContent dividers>
                    <Controller
                        name="title"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                {...register('title')}
                                required
                                autoFocus
                                margin="dense"
                                label="Title"
                                type="text"
                                fullWidth
                                error={errors.title ? true : false}
                                helperText={errors.title?.message}
                            />
                        )}
                    />
                    <Controller
                        name="type"
                        control={control}
                        render={({field}) => (
                            <FormControl
                                fullWidth
                                margin="dense"
                                required
                            >
                                <InputLabel id="type-select-label">
                                    Type
                                </InputLabel>
                                <Select
                                    {...field}
                                    labelId="type-select-label"
                                    id="type-select"
                                    label="Type"
                                >
                                    <MenuItem value="ipv4">ipv4</MenuItem>
                                    <MenuItem value="ipv6">ipv6</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                    <Controller
                        name="src"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                required
                                margin="dense"
                                label="Source"
                                type="text"
                                fullWidth
                                error={errors.title ? true : false}
                                helperText={errors.title?.message}
                            />
                        )}
                    />
                    <Controller
                        name="dst"
                        control={control}
                        render={({field}) => (
                            <TextField
                                {...field}
                                required
                                margin="dense"
                                label="Destination"
                                type="text"
                                fullWidth
                                error={errors.title ? true : false}
                                helperText={errors.title?.message}
                            />
                        )}
                    />
                    <Controller
                        name="protocol"
                        control={control}
                        render={({field}) => (
                            <FormControl
                                fullWidth
                                margin="dense"
                                required
                            >
                                <InputLabel id="protocol-select-label">
                                    Protocol
                                </InputLabel>
                                <Select
                                    {...field}
                                    labelId="protocol-select-label"
                                    id="protocol-select"
                                    label="Protocol"
                                >
                                    <MenuItem value="all">all</MenuItem>
                                    <MenuItem value="tcp">tcp</MenuItem>
                                    <MenuItem value="udp">udp</MenuItem>
                                    <MenuItem value="udplite">udplite</MenuItem>
                                    <MenuItem value="icmp">icmp</MenuItem>
                                    <MenuItem value="icmpv6">icmpv6</MenuItem>
                                    <MenuItem value="esp">esp</MenuItem>
                                    <MenuItem value="ah">ah</MenuItem>
                                    <MenuItem value="sctp">sctp</MenuItem>
                                    <MenuItem value="mh">mh</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    />
                    {
                        displayPorts &&
                        <Controller
                            name="port"
                            control={control}
                            render={({field}) => (
                                <TextField
                                    {...field}
                                    margin="dense"
                                    label="Port"
                                    type="number"
                                    fullWidth
                                />
                            )}
                        />
                    }
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

export default CustomRuleDialog;
