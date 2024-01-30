import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField
} from "@mui/material";
import {Download, QrCode, TextSnippet} from "@mui/icons-material";
import {QRCodeSVG} from "qrcode.react";
import {atomOneLight, CopyBlock} from "react-code-blocks";
import {useStoreApi, useStoreDialogs} from "../store";

const modeEnum = {
    TEXT: "text",
    QR: "qr"
};

const WireGuardConfigDialog = () => {
    const [wireGuardConfig, setWireGuardConfig] = useState("");
    const [wireGuardConfigWithPrivateKey, setWireGuardConfigWithPrivateKey] = useState("");
    const [mode, setMode] = useState(modeEnum.TEXT);

    const open = useStoreDialogs(state => state.open);
    const props = useStoreDialogs(state => state.props);
    const closeDialog = useStoreDialogs(state => state.closeDialog);

    const getWireGuardConfig = useStoreApi(state => state.getWireGuardConfig);

    useEffect(
        () => {
            if (open) {
                getOutput();
            }
        },
        [open]
    );

    const getOutput = () => {
        getWireGuardConfig(props.client.id)
            .then(response => {
                setWireGuardConfig(response);
                setWireGuardConfigWithPrivateKey(response);
            })
            .catch(error => {
                console.log(error);
            });
    };

    return (
        <React.Fragment>
            <Dialog
                open={open}
                onClose={closeDialog}
                scroll="paper"
                fullWidth
                maxWidth="md"
            >
                <DialogTitle id="scroll-dialog-title">
                    WireGuard Config: {props.client.title}
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        margin="dense"
                        label="Private Key (local replacement)"
                        type="text"
                        onChange={e => {
                            let privateKey = e.target.value;
                            setWireGuardConfigWithPrivateKey(wireGuardConfig.replace("INSERT_PRIVATE_KEY", privateKey));
                        }}
                        fullWidth
                        sx={{marginY: 0}}
                    />
                    <Grid container sx={{marginY: "10px"}}>
                        <ButtonGroup variant="outlined">
                            <Button
                                onClick={() => setMode(modeEnum.TEXT)}
                                startIcon={<TextSnippet/>}
                            >
                                Text
                            </Button>
                            <Button
                                onClick={() => setMode(modeEnum.QR)}
                                startIcon={<QrCode/>}
                            >
                                QR-Code
                            </Button>
                        </ButtonGroup>
                    </Grid>
                    {
                        mode === modeEnum.TEXT &&
                        <React.Fragment>
                            <CopyBlock
                                text={wireGuardConfigWithPrivateKey}
                                language="text"
                                showLineNumbers={false}
                                theme={atomOneLight}
                                codeBlock
                            />
                            <Box mt={1}>
                                <Button
                                    variant="contained"
                                    startIcon={<Download/>}
                                    onClick={() => {
                                        const file = new Blob([wireGuardConfigWithPrivateKey], {type: "text/plain"});
                                        const element = document.createElement("a");
                                        element.href = URL.createObjectURL(file);
                                        element.download = "wg0.conf";
                                        document.body.appendChild(element);
                                        element.click();
                                        element.parentNode.removeChild(element);
                                    }}
                                >Download</Button>
                            </Box>
                        </React.Fragment>
                    }
                    {
                        mode === modeEnum.QR &&
                        <QRCodeSVG size="300" value={wireGuardConfigWithPrivateKey}/>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
};

export default WireGuardConfigDialog;
