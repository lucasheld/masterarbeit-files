import React, {useEffect} from "react";
import Keycloak from "keycloak-js";
import {useStoreKeycloak} from "../store";
import {CircularProgress, Grid} from "@mui/material";

const KeycloakComponent = () => {
    const setKeycloak = useStoreKeycloak(state => state.setKeycloak);
    const setToken = useStoreKeycloak(state => state.setToken);
    const setRoles = useStoreKeycloak(state => state.setRoles);
    const setUserId = useStoreKeycloak(state => state.setUserId);
    const loadUsers = useStoreKeycloak(state => state.loadUsers);

    useEffect(() => {
        const keycloak = new Keycloak("/keycloak.json");
        keycloak.init({
            onLoad: "login-required"
        }).then(authenticated => {
            setKeycloak(keycloak);
            if (authenticated) {
                setUserId(keycloak.subject);
                setRoles(keycloak.realmAccess.roles);
                setToken(keycloak.token);
                loadUsers();
            } else {
                window.location.reload();
            }

            // Token Refresh
            setInterval(() => {
                keycloak.updateToken(70).then(refreshed => {
                    if (refreshed) {
                        setToken(keycloak.token);
                        console.info("Refreshed Keycloak token");
                    }
                }).catch(() => {
                    console.error("Failed to refresh Keycloak token");
                });
            }, 6000);
        }).catch(function () {
            console.error("Failed to initialize Keycloak");
        });
    }, []);

    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            style={{
                minHeight: "100vh"
            }}
        >
            <Grid item>
                <CircularProgress size={50}/>
            </Grid>
        </Grid>
    );
};

export default KeycloakComponent;
