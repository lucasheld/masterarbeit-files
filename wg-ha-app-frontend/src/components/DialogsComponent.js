import ConfirmationDialog from "./ConfirmationDialog";
import {useStoreDialogs} from "../store";
import ClientDialog from "./ClientDialog";
import WireGuardConfigDialog from "./WireGuardConfigDialog";
import SettingsDialog from "./SettingsDialog";
import CustomRuleDialog from "./CustomRuleDialog";

export const CONFIRMATION_DIALOG = "CONFIRMATION_DIALOG";
export const CLIENT_DIALOG = "CLIENT_DIALOG";
export const WIREGUARD_CONFIG_DIALOG = "WIREGUARD_CONFIG_DIALOG";
export const SETTINGS_DIALOG = "SETTINGS_DIALOG";
export const CUSTOM_RULE_DIALOG = "CUSTOM_RULE_DIALOG";

const DialogsComponent = () => {
    const type = useStoreDialogs(state => state.type);

    switch (type) {
        case CONFIRMATION_DIALOG:
            return <ConfirmationDialog/>;
        case CLIENT_DIALOG:
            return <ClientDialog/>;
        case WIREGUARD_CONFIG_DIALOG:
            return <WireGuardConfigDialog/>;
        case SETTINGS_DIALOG:
            return <SettingsDialog/>;
        case CUSTOM_RULE_DIALOG:
            return <CustomRuleDialog/>;
        default:
            return null;
    }
};

export default DialogsComponent;
