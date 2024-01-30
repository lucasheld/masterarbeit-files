import {useStoreNotification} from "../store";
import {Alert, Snackbar} from "@mui/material";

const SnackbarComponent = () => {
    const notifications = useStoreNotification(state => state.notifications);
    const clearNotification = useStoreNotification(state => state.clearNotification);

    return (
        notifications.map(notification =>
            notification.open &&
            <Snackbar
                key={notification.message}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => clearNotification(notification.message)}
            >
                <Alert
                    onClose={() => clearNotification(notification.message)}
                    severity={notification.severity}
                    elevation={6}
                    variant="filled"
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        )
    );
};

export default SnackbarComponent;
