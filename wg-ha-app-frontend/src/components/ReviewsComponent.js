import React from "react";
import {useStoreClients} from "../store";
import {Alert, List, Paper} from "@mui/material";
import ReviewComponent from "./ReviewComponent";

const ReviewsComponent = () => {
    const clients = useStoreClients(state => state.clients);

    const reviewClients = clients.filter(client => client.permitted === "PENDING");

    return (
        <React.Fragment>
            {
                reviewClients.length === 0 ?
                    <Alert variant="outlined" severity="info">
                        No Reviews available
                    </Alert>
                    :
                    <Paper>
                        <List>
                            {
                                reviewClients.map(client =>
                                    <ReviewComponent
                                        key={client.id}
                                        client={client}
                                    />
                                )
                            }
                        </List>
                    </Paper>
            }
        </React.Fragment>
    );
};

export default ReviewsComponent;
