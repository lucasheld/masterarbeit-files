import {Box, Button, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select} from "@mui/material";
import React from "react";
import MultiChipInputComponent from "./MultiChipInputComponent";
import {Add, Delete} from "@mui/icons-material";

const SelectServicesComponent = React.forwardRef(({onChange, name, label, value, id, title, disabled}, ref) => {
    const generateNewRule = () => {
        return {
            "protocol": "",
            "ports": []
        };
    };

    const generateNewService = () => {
        let rule = generateNewRule();
        return {
            "rules": [
                rule
            ],
            "allowed_tags": []
        };
    };

    return (
        <React.Fragment>
            {
                value.map((service, serviceIndex) =>
                    <Box
                        key={`${serviceIndex}-div`}
                    >
                        {
                            service.rules.map((rule, ruleIndex) => {
                                let displayPorts = ["tcp", "udp"].includes(rule.protocol);
                                let displayDelete = service.rules.length > 1;
                                let xsProtocol = displayPorts ? 4 : displayDelete ? 11 : 12;
                                let xsPorts = displayDelete ? 7 : 8;
                                let xsDelete = 1;

                                return (
                                    <Grid
                                        container
                                        spacing={2}
                                        key={`${serviceIndex}${ruleIndex}-grid`}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Grid item xs={xsProtocol}>
                                            <FormControl
                                                fullWidth
                                                margin="dense"
                                                key={`${serviceIndex}${ruleIndex}-protocol-formcontrol`}
                                            >
                                                <InputLabel id={`${serviceIndex}${ruleIndex}-protocol-select-label`}>
                                                    Protocol
                                                </InputLabel>
                                                <Select
                                                    labelId={`${serviceIndex}${ruleIndex}-protocol-select-label`}
                                                    id={`${serviceIndex}${ruleIndex}-protocol-select`}
                                                    value={rule.protocol}
                                                    label="Protocol"
                                                    onChange={e => {
                                                        let protocol = e.target.value;
                                                        let displayPortsNew = ["tcp", "udp"].includes(rule.protocol);
                                                        let newServices = value.map(s => ({
                                                            ...s,
                                                            rules: service === s ?
                                                                s.rules.map(r => ({
                                                                    ...r,
                                                                    protocol: rule === r ?
                                                                        protocol :
                                                                        r.protocol,
                                                                    ports: rule === r && !displayPortsNew ?
                                                                        [] :
                                                                        r.ports
                                                                })) :
                                                                s.rules
                                                        }));
                                                        onChange(newServices);
                                                    }}
                                                    disabled={disabled}
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
                                        </Grid>
                                        {
                                            displayPorts &&
                                            <Grid item xs={xsPorts}>
                                                <MultiChipInputComponent
                                                    value={rule.ports}
                                                    onChange={ports => {
                                                        let newServices = value.map(s => ({
                                                            ...s,
                                                            rules: service === s ?
                                                                s.rules.map(r => ({
                                                                    ...r,
                                                                    ports: rule === r ?
                                                                        ports :
                                                                        r.ports
                                                                })) :
                                                                s.rules
                                                        }));
                                                        onChange(newServices);
                                                    }}
                                                    id={`${serviceIndex}${ruleIndex}-ports`}
                                                    title="Ports"
                                                    key={`${serviceIndex}${ruleIndex}-ports`}
                                                    disabled={disabled}
                                                />
                                            </Grid>
                                        }
                                        {
                                            displayDelete &&
                                            <Grid item xs={xsDelete}>
                                                <Grid container justifyContent="center">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => {
                                                            let newServices = value.map(s => ({
                                                                ...s,
                                                                rules: service === s ?
                                                                    s.rules.filter(item => item !== rule) :
                                                                    s.rules
                                                            }));
                                                            onChange(newServices);
                                                        }}
                                                        disabled={disabled}
                                                    >
                                                        <Delete/>
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        }
                                    </Grid>
                                );
                            })
                        }
                        <Box mt={1}>
                            <Button
                                onClick={() => {
                                    let rule = generateNewRule();
                                    let newServices = value.map(s => ({
                                        ...s,
                                        rules: service === s ? [...s.rules, rule] : s.rules
                                    }));
                                    onChange(newServices);
                                }}
                                variant="outlined"
                                startIcon={<Add/>}
                                disabled={disabled}
                            >
                                Add Rule
                            </Button>
                        </Box>
                        <Box mt={1}>
                            <MultiChipInputComponent
                                value={service.allowed_tags}
                                onChange={allowed_tags => {
                                    let newServices = value.map(s => ({
                                        ...s,
                                        allowed_tags: service === s ? allowed_tags : s.allowed_tags
                                    }));
                                    onChange(newServices);
                                }}
                                id={`${serviceIndex}-allowedTags`}
                                title="Allowed tags"
                                key={`${serviceIndex}-allowedTags`}
                                disabled={disabled}
                            />
                        </Box>
                        <Box mt={1}>
                            <Grid container justifyContent="flex-end">
                                <Button
                                    onClick={() => {
                                        let newServices = value.filter(item => item !== service);
                                        onChange(newServices);
                                    }}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete/>}
                                    disabled={disabled}
                                >
                                    Remove Service
                                </Button>
                            </Grid>
                        </Box>
                        <Box my={2}>
                            <Divider variant="middle"/>
                        </Box>
                    </Box>
                )
            }
            <Box mt={1}>
                <Button
                    onClick={() => {
                        let service = generateNewService();
                        let newServices = [...value, service];
                        onChange(newServices);
                    }}
                    variant="outlined"
                    startIcon={<Add/>}
                    disabled={disabled}
                >
                    Add Service
                </Button>
            </Box>
        </React.Fragment>

    );
});

export default SelectServicesComponent;
